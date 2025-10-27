"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "../../hooks/useWallet";
import { useFHERating } from "../../hooks/useFHERating";

export default function BrowsePage() {
  const { chainId } = useWallet();
  const { getActivity } = useFHERating();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    const loadActivities = async () => {
      if (!chainId) return;

      try {
        // Get contract to fetch activity count
        const { Contract } = await import("ethers");
        const { FHERatingContractABI } = await import("../../abi/FHERatingContractABI");
        const { FHERatingContractAddresses } = await import("../../abi/FHERatingContractAddresses");
        
        const addressInfo = FHERatingContractAddresses[chainId.toString() as keyof typeof FHERatingContractAddresses];
        if (!addressInfo) {
          console.error("Contract not deployed on this chain");
          setLoading(false);
          return;
        }

        // Use window.ethereum as provider to read
        if (!window.ethereum) {
          setLoading(false);
          return;
        }

        const { BrowserProvider } = await import("ethers");
        const provider = new BrowserProvider(window.ethereum as any);
        const contract = new Contract(addressInfo.address, FHERatingContractABI.abi, provider);
        
        const count = await contract.getActivityCount();
        const countNum = Number(count);
        setActivityCount(countNum);

        if (countNum === 0) {
          setLoading(false);
          return;
        }

        // Load all activities
        const activityPromises = [];
        for (let i = 0; i < countNum; i++) {
          activityPromises.push(getActivity(i));
        }
        
        const activityData = await Promise.all(activityPromises);
        setActivities(activityData);
      } catch (err) {
        console.error("Failed to load activities:", err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [chainId, getActivity]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-8">Browse Activities</h1>
        <p className="text-white/70">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Browse Activities</h1>
        <Link href="/create" className="btn-primary">
          Create New Activity
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="card text-center">
          <p className="text-white/70 mb-4">
            {activityCount === 0 
              ? "No activities yet. Be the first to create one!" 
              : "Failed to load activities. Please try again."}
          </p>
          <Link href="/create" className="btn-primary inline-block">
            Create First Activity
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const isActive = activity.active && Date.now() / 1000 < Number(activity.endTime);
            const endDate = new Date(Number(activity.endTime) * 1000);
            
            return (
              <Link
                key={activity.id.toString()}
                href={`/activity/${activity.id}`}
                className="card"
              >
                {activity.coverImageUrl && (
                  <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-white/5">
                    <img 
                      src={activity.coverImageUrl} 
                      alt={activity.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{activity.description}</p>
                
                <div className="space-y-2 text-sm text-white/60">
                  <div className="flex items-center justify-between">
                    <span>{activity.participantCount.toString()} participants</span>
                    <span className={isActive ? "text-green-400" : "text-red-400"}>
                      {isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>{activity.dimensions.length} dimensions</span>
                    <span>Scale: 1-{activity.scale.toString()}</span>
                  </div>
                  
                  <div className="text-white/50">
                    Ends: {endDate.toLocaleDateString()}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

