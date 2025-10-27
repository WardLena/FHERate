"use client";

import { useState, useCallback } from "react";
import { Contract } from "ethers";
import { useWallet } from "./useWallet";
import { useFHEVM } from "./useFHEVM";
import { FHERatingContractABI } from "../abi/FHERatingContractABI";
import { FHERatingContractAddresses } from "../abi/FHERatingContractAddresses";

export function useFHERating() {
  const { account, chainId, getSigner } = useWallet();
  const { instance: fhevmInstance } = useFHEVM();
  const [isLoading, setIsLoading] = useState(false);

  const getContract = useCallback(async () => {
    if (!chainId) throw new Error("No chain ID");
    
    const addressInfo = FHERatingContractAddresses[chainId.toString() as keyof typeof FHERatingContractAddresses];
    if (!addressInfo) throw new Error(`Contract not deployed on chain ${chainId}`);

    const signer = await getSigner();
    return new Contract(addressInfo.address, FHERatingContractABI.abi, signer);
  }, [chainId, getSigner]);

  const createActivity = useCallback(
    async (params: {
      title: string;
      description: string;
      coverImageUrl: string;
      dimensions: string[];
      scale: number;
      endTime: number;
      allowMultiple: boolean;
    }) => {
      setIsLoading(true);
      try {
        const contract = await getContract();
        const tx = await contract.createActivity(
          params.title,
          params.description,
          params.coverImageUrl,
          params.dimensions,
          params.scale,
          params.endTime,
          params.allowMultiple
        );
        const receipt = await tx.wait();
        
        // Extract activityId from event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === "ActivityCreated";
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = contract.interface.parseLog(event);
          return parsed?.args.activityId;
        }
        
        return null;
      } catch (error) {
        console.error("Create activity failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  const submitRating = useCallback(
    async (activityId: number, scores: number[]) => {
      if (!fhevmInstance || !account) throw new Error("FHEVM not initialized");
      
      setIsLoading(true);
      try {
        const contract = await getContract();
        const contractAddress = await contract.getAddress();

        // Encrypt scores
        const input = fhevmInstance.createEncryptedInput(contractAddress, account);
        scores.forEach((score) => input.add32(score));
        const encrypted = await input.encrypt();

        // Submit to contract
        const tx = await contract.submitRating(
          activityId,
          encrypted.handles,
          encrypted.inputProof
        );
        await tx.wait();
        
        return true;
      } catch (error) {
        console.error("Submit rating failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fhevmInstance, account, getContract]
  );

  const getActivity = useCallback(
    async (activityId: number) => {
      try {
        const contract = await getContract();
        return await contract.getActivity(activityId);
      } catch (error) {
        console.error("Get activity failed:", error);
        throw error;
      }
    },
    [getContract]
  );

  const getCreatorActivities = useCallback(
    async (creator: string) => {
      try {
        const contract = await getContract();
        return await contract.getCreatorActivities(creator);
      } catch (error) {
        console.error("Get creator activities failed:", error);
        throw error;
      }
    },
    [getContract]
  );

  const getParticipantActivities = useCallback(
    async (participant: string) => {
      try {
        const contract = await getContract();
        return await contract.getParticipantActivities(participant);
      } catch (error) {
        console.error("Get participant activities failed:", error);
        throw error;
      }
    },
    [getContract]
  );

  const hasUserRated = useCallback(
    async (activityId: number, user: string) => {
      try {
        const contract = await getContract();
        return await contract.hasUserRated(activityId, user);
      } catch (error) {
        console.error("Check user rated failed:", error);
        throw error;
      }
    },
    [getContract]
  );

  const decryptRatings = useCallback(
    async (activityId: number) => {
      if (!fhevmInstance || !account) throw new Error("FHEVM not initialized");
      
      setIsLoading(true);
      try {
        const contract = await getContract();
        const contractAddress = await contract.getAddress();
        const signer = await getSigner();
        
        // Get all ratings for this activity
        // Returns: [raters[], allScores[][], timestamps[]]
        const result = await contract.getAllRatings(activityId);
        
        // Extract raters, scores and timestamps from the tuple
        const raters = result[0]; // address[]
        const allScores = result[1]; // euint32[][]
        const timestamps = result[2]; // uint256[]
        
        console.log("getAllRatings result:", { raters, allScores, timestamps });
        
        if (raters.length === 0) {
          return [];
        }
        
        // Load or generate decryption signature
        const { FhevmDecryptionSignature } = await import("../fhevm/FhevmDecryptionSignature");
        const storage = {
          get: (key: string) => localStorage.getItem(key),
          set: (key: string, value: string) => localStorage.setItem(key, value),
          remove: (key: string) => localStorage.removeItem(key),
        };
        
        const sig = await FhevmDecryptionSignature.loadOrSign(
          fhevmInstance,
          [contractAddress as `0x${string}`],
          signer,
          storage
        );
        
        if (!sig) {
          throw new Error("Failed to generate decryption signature");
        }
        
        // Collect all encrypted handles to decrypt
        const handlesToDecrypt: Array<{ handle: string; contractAddress: string }> = [];
        allScores.forEach((scoreArray: any) => {
          scoreArray.forEach((handle: any) => {
            handlesToDecrypt.push({
              handle: handle.toString(),
              contractAddress: contractAddress,
            });
          });
        });
        
        console.log("Handles to decrypt:", handlesToDecrypt.length);
        
        // Perform batch decryption
        const decryptedValues = await fhevmInstance.userDecrypt(
          handlesToDecrypt,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );
        
        console.log("Decrypted values:", decryptedValues);
        
        // Map decrypted values back to ratings
        const decryptedRatings = raters.map((rater: string, index: number) => {
          const scoreHandles = allScores[index];
          const scores = scoreHandles.map((handle: any) => {
            const decrypted = decryptedValues[handle.toString()];
            return Number(decrypted);
          });
          
          return {
            rater,
            scores,
            timestamp: Number(timestamps[index]),
          };
        });
        
        return decryptedRatings;
      } catch (error) {
        console.error("Decrypt ratings failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fhevmInstance, account, getContract, getSigner]
  );

  const closeActivity = useCallback(
    async (activityId: number) => {
      setIsLoading(true);
      try {
        const contract = await getContract();
        const tx = await contract.closeActivity(activityId);
        await tx.wait();
        
        return true;
      } catch (error) {
        console.error("Close activity failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [getContract]
  );

  return {
    isLoading,
    createActivity,
    submitRating,
    getActivity,
    getCreatorActivities,
    getParticipantActivities,
    hasUserRated,
    decryptRatings,
    closeActivity,
  };
}

