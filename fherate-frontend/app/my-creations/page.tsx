"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "../../hooks/useWallet";
import { useFHERating } from "../../hooks/useFHERating";

export default function MyCreationsPage() {
  const { account, isConnected } = useWallet();
  const { getCreatorActivities, getActivity } = useFHERating();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!account) return;
      
      try {
        const activityIds = await getCreatorActivities(account);
        const activityData = await Promise.all(
          activityIds.map((id: bigint) => getActivity(Number(id)))
        );
        setActivities(activityData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isConnected) {
      loadActivities();
    }
  }, [account, isConnected, getCreatorActivities, getActivity]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">My Creations</h1>
        <p className="text-white/70">Please connect your wallet to view your creations</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">My Creations</h1>
        <Link href="/create" className="btn-primary">
          Create New Activity
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-white/70">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="card text-center">
          <p className="text-white/70 mb-4">You haven't created any activities yet</p>
          <Link href="/create" className="btn-primary inline-block">
            Create Your First Activity
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => {
            const isActive = activity.active && Date.now() / 1000 < Number(activity.endTime);
            const endDate = new Date(Number(activity.endTime) * 1000);
            
            return (
              <div key={activity.id.toString()} className="card">
                <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{activity.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>{activity.participantCount.toString()} participants</span>
                    <span className={isActive ? "text-green-400" : "text-red-400"}>
                      {isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <div className="text-white/50 text-xs">
                    Ends: {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/activity/${activity.id}`}
                    className="flex-1 text-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                  >
                    View
                  </Link>
                  <Link
                    href={`/statistics/${activity.id}`}
                    className="flex-1 text-center px-4 py-2 rounded-lg bg-primary hover:opacity-80 transition-opacity text-sm"
                  >
                    Statistics
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

