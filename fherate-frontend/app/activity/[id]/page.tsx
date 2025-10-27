"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useFHERating } from "../../../hooks/useFHERating";

export default function ActivityPage() {
  const params = useParams();
  const { account, isConnected } = useWallet();
  const { getActivity, submitRating, hasUserRated, isLoading } = useFHERating();

  const [activity, setActivity] = useState<any>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [hasRated, setHasRated] = useState(false);
  const [error, setError] = useState("");

  const activityId = parseInt(params.id as string);

  useEffect(() => {
    const loadActivity = async () => {
      if (isNaN(activityId)) {
        setError("Invalid activity ID");
        return;
      }

      try {
        console.log("Loading activity:", activityId);
        const data = await getActivity(activityId);
        console.log("Activity data:", data);
        
        setActivity(data);
        
        // Convert scale to number
        const scaleNum = Number(data.scale);
        setScores(new Array(data.dimensions.length).fill(Math.floor(scaleNum / 2)));
        
        if (account) {
          const rated = await hasUserRated(activityId, account);
          setHasRated(rated);
        }
      } catch (err) {
        console.error("Failed to load activity:", err);
        setError(`Failed to load activity: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    if (!isNaN(activityId)) {
      loadActivity();
    }
  }, [activityId, account, getActivity, hasUserRated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await submitRating(activityId, scores);
      alert("Rating submitted successfully!");
      setHasRated(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit rating");
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Activity Details</h1>
        <p className="text-white/70">Please connect your wallet to participate</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Error</h1>
        <div className="card max-w-2xl mx-auto">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/browse" className="btn-primary inline-block">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Loading Activity...</h1>
        <p className="text-white/70">Activity ID: {activityId}</p>
        <p className="text-white/70 mt-2">Please wait...</p>
      </div>
    );
  }

  const isActive = activity.active && Date.now() / 1000 < activity.endTime;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="card mb-8">
          <h1 className="text-4xl font-bold mb-4">{activity.title}</h1>
          <p className="text-white/70 mb-4">{activity.description}</p>
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <span>Participants: {activity.participantCount.toString()}</span>
            <span>Scale: 1-{activity.scale.toString()}</span>
            <span className={isActive ? "text-green-400" : "text-red-400"}>
              {isActive ? "Active" : "Ended"}
            </span>
          </div>
        </div>

        {hasRated && !activity.allowMultiple ? (
          <div className="card text-center">
            <p className="text-white/70">You have already rated this activity</p>
          </div>
        ) : !isActive ? (
          <div className="card text-center">
            <p className="text-white/70">This activity has ended</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-2xl font-bold mb-6">Submit Your Rating</h2>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-200 mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {activity.dimensions.map((dim: string, index: number) => (
                <div key={index}>
                  <label className="flex justify-between">
                    <span>{dim}</span>
                    <span className="font-bold text-primary">{scores[index]}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={activity.scale.toString()}
                    value={scores[index]}
                    onChange={(e) => {
                      const newScores = [...scores];
                      newScores[index] = parseInt(e.target.value);
                      setScores(newScores);
                    }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-8 disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Encrypted Rating"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

