"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "../../hooks/useWallet";
import { useFHERating } from "../../hooks/useFHERating";

export default function MyRatingsPage() {
  const { account, isConnected } = useWallet();
  const { getParticipantActivities, getActivity } = useFHERating();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!account) return;
      
      try {
        const activityIds = await getParticipantActivities(account);
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
  }, [account, isConnected, getParticipantActivities, getActivity]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">My Ratings</h1>
        <p className="text-white/70">Please connect your wallet to view your ratings</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">My Ratings</h1>

      {loading ? (
        <div className="text-center text-white/70">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="card text-center">
          <p className="text-white/70 mb-4">You haven't rated any activities yet</p>
          <Link href="/" className="btn-primary inline-block">
            Browse Activities
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
                <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                <p className="text-white/70 mb-4 line-clamp-2">{activity.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-white/60">
                    <span>{activity.participantCount.toString()} participants</span>
                    <span className={isActive ? "text-green-400" : "text-red-400"}>
                      {isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                  <div className="text-white/50 text-xs">
                    Ends: {endDate.toLocaleDateString()} {endDate.toLocaleTimeString()}
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

