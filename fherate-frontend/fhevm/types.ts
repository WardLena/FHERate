import type { Eip1193Provider } from "ethers";

export type EIP712Type = {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    UserDecryptRequestVerification: Array<{ name: string; type: string }>;
  };
  primaryType: string;
  message: {
    publicKey: string;
    contractAddresses: string[];
    startTimestamp: number;
    durationDays: number;
  };
};

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EncryptedInputBuilder = {
  add8: (value: number) => EncryptedInputBuilder;
  add16: (value: number) => EncryptedInputBuilder;
  add32: (value: number) => EncryptedInputBuilder;
  add64: (value: bigint) => EncryptedInputBuilder;
  add128: (value: bigint) => EncryptedInputBuilder;
  add256: (value: bigint) => EncryptedInputBuilder;
  addBool: (value: boolean) => EncryptedInputBuilder;
  addAddress: (value: string) => EncryptedInputBuilder;
  encrypt: () => Promise<{ handles: string[]; inputProof: string }>;
};

export type FhevmInstance = {
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInputBuilder;
  getPublicKey: () => string;
  getPublicParams: (len: number) => string;
  userDecrypt: (
    handles: Array<{ handle: string; contractAddress: string }>,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: string[],
    userAddress: string,
    startTimestamp: number,
    durationDays: number
  ) => Promise<Record<string, bigint>>;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (publicKey: string, contractAddresses: string[], startTimestamp: number, durationDays: number) => EIP712Type;
};

export type FhevmInstanceConfig = {
  network: Eip1193Provider | string;
  aclContractAddress: string;
  kmsVerifierContractAddress: string;
  publicKey?: string;
  publicParams?: string;
};

export type FhevmRelayerSDKType = {
  initSDK: (options?: any) => Promise<boolean>;
  createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
  SepoliaConfig: FhevmInstanceConfig;
  __initialized__?: boolean;
};

export type FhevmWindowType = {
  relayerSDK: FhevmRelayerSDKType;
};

