"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "../../../hooks/useWallet";
import { useFHERating } from "../../../hooks/useFHERating";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function StatisticsPage() {
  const params = useParams();
  const activityId = parseInt(params.id as string);
  const { account, isConnected } = useWallet();
  const { getActivity, decryptRatings, closeActivity } = useFHERating();

  const [activity, setActivity] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      if (isNaN(activityId) || !isConnected) return;

      try {
        const data = await getActivity(activityId);
        setActivity(data);

        // Check if user is creator
        if (account && data.creator.toLowerCase() !== account.toLowerCase()) {
          setError("Only the activity creator can view statistics");
        }
      } catch (err) {
        console.error("Failed to load activity:", err);
        setError("Failed to load activity");
      }
    };

    loadActivity();
  }, [activityId, account, isConnected, getActivity]);

  const handleDecrypt = async () => {
    if (!activity) return;

    setIsDecrypting(true);
    setError("");

    try {
      const decryptedData = await decryptRatings(activityId);
      
      // Calculate statistics
      const dimensionStats = activity.dimensions.map((dim: string, index: number) => {
        const scores = decryptedData.map((rating: any) => rating.scores[index]);
        const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
        
        // Calculate distribution
        const distribution: { [key: number]: number } = {};
        scores.forEach((score: number) => {
          distribution[score] = (distribution[score] || 0) + 1;
        });

        return {
          dimension: dim,
          average: avg,
          min: Math.min(...scores),
          max: Math.max(...scores),
          distribution,
          allScores: scores,
        };
      });

      // Prepare chart data
      const barChartData = dimensionStats.map((stat: any) => ({
        name: stat.dimension,
        average: parseFloat(stat.average.toFixed(2)),
        min: stat.min,
        max: stat.max,
      }));

      const radarChartData = dimensionStats.map((stat: any) => ({
        dimension: stat.dimension,
        score: parseFloat(stat.average.toFixed(2)),
      }));

      setStatistics({
        totalRatings: decryptedData.length,
        dimensions: dimensionStats,
        barChartData,
        radarChartData,
        rawData: decryptedData,
      });
    } catch (err) {
      console.error("Decryption failed:", err);
      setError(`Decryption failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleCloseActivity = async () => {
    if (!window.confirm("Are you sure you want to close this activity? This action cannot be undone.")) {
      return;
    }

    setIsClosing(true);
    setError("");

    try {
      await closeActivity(activityId);
      alert("Activity closed successfully!");
      
      // Reload activity data
      const data = await getActivity(activityId);
      setActivity(data);
    } catch (err) {
      console.error("Failed to close activity:", err);
      setError("Failed to close activity");
    } finally {
      setIsClosing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Activity Statistics</h1>
        <p className="text-white/70">Please connect your wallet to view statistics</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Error</h1>
        <div className="card max-w-2xl mx-auto">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/my-creations" className="btn-primary inline-block">
            Back to My Creations
          </Link>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-6">Loading Statistics...</h1>
        <p className="text-white/70">Please wait...</p>
      </div>
    );
  }

  const isActive = activity.active && Date.now() / 1000 < Number(activity.endTime);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Activity Statistics</h1>
          <Link href="/my-creations" className="btn-secondary">
            Back to My Creations
          </Link>
        </div>

        {/* Activity Info Card */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">{activity.title}</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-white/60">Status:</span>{" "}
              <span className={isActive ? "text-green-400" : "text-red-400"}>
                {isActive ? "Active" : "Ended"}
              </span>
            </div>
            <div>
              <span className="text-white/60">Participants:</span>{" "}
              <span className="text-white">{activity.participantCount.toString()}</span>
            </div>
            <div>
              <span className="text-white/60">Scale:</span>{" "}
              <span className="text-white">1-{activity.scale.toString()}</span>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            {!statistics && activity.participantCount > 0 && (
              <button
                onClick={handleDecrypt}
                disabled={isDecrypting}
                className="btn-primary"
              >
                {isDecrypting ? "Decrypting..." : "🔓 Decrypt & View Statistics"}
              </button>
            )}
            
            {activity.participantCount === 0 && (
              <p className="text-white/60">No ratings yet</p>
            )}
            
            {isActive && (
              <button
                onClick={handleCloseActivity}
                disabled={isClosing}
                className="px-6 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {isClosing ? "Closing..." : "Close Activity"}
              </button>
            )}
          </div>
        </div>

        {/* Statistics Display */}
        {statistics && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-white/60 text-sm mb-2">Total Ratings</h3>
                <p className="text-3xl font-bold">{statistics.totalRatings}</p>
              </div>
              <div className="card">
                <h3 className="text-white/60 text-sm mb-2">Dimensions</h3>
                <p className="text-3xl font-bold">{activity.dimensions.length}</p>
              </div>
              <div className="card">
                <h3 className="text-white/60 text-sm mb-2">Overall Average</h3>
                <p className="text-3xl font-bold">
                  {(
                    statistics.dimensions.reduce((sum: number, d: any) => sum + d.average, 0) /
                    statistics.dimensions.length
                  ).toFixed(2)}
                  <span className="text-lg text-white/60">/{activity.scale.toString()}</span>
                </p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Average Scores by Dimension</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" domain={[0, Number(activity.scale)]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="average" fill="#A855F7" name="Average" />
                  <Bar dataKey="min" fill="#7C3AED" name="Min" />
                  <Bar dataKey="max" fill="#6366F1" name="Max" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Multi-Dimensional Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={statistics.radarChartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="dimension" stroke="rgba(255,255,255,0.6)" />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.4)" domain={[0, Number(activity.scale)]} />
                  <Radar
                    name="Average Score"
                    dataKey="score"
                    stroke="#A855F7"
                    fill="#A855F7"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Statistics */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Detailed Statistics</h3>
              <div className="space-y-4">
                {statistics.dimensions.map((dimStat: any, index: number) => (
                  <div key={index} className="border-b border-white/10 pb-4 last:border-0">
                    <h4 className="font-bold text-lg mb-2">{dimStat.dimension}</h4>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Average:</span>{" "}
                        <span className="text-white font-semibold">{dimStat.average.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Min:</span>{" "}
                        <span className="text-white">{dimStat.min}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Max:</span>{" "}
                        <span className="text-white">{dimStat.max}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Range:</span>{" "}
                        <span className="text-white">{dimStat.max - dimStat.min}</span>
                      </div>
                    </div>
                    
                    {/* Score Distribution */}
                    <div className="mt-3">
                      <p className="text-white/60 text-sm mb-2">Distribution:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(dimStat.distribution as { [key: string]: number })
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([score, count]) => (
                            <span
                              key={score}
                              className="px-3 py-1 rounded-lg bg-white/10 text-sm"
                            >
                              Score {score}: {count} ({((count / statistics.totalRatings) * 100).toFixed(0)}%)
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Data Table */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">All Ratings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="text-left py-3 px-2 text-white/60">Rater</th>
                      {activity.dimensions.map((dim: string, index: number) => (
                        <th key={index} className="text-left py-3 px-2 text-white/60">
                          {dim}
                        </th>
                      ))}
                      <th className="text-left py-3 px-2 text-white/60">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.rawData.map((rating: any, index: number) => (
                      <tr key={index} className="border-b border-white/10">
                        <td className="py-3 px-2 font-mono text-xs">
                          {rating.rater.slice(0, 6)}...{rating.rater.slice(-4)}
                        </td>
                        {rating.scores.map((score: number, scoreIndex: number) => (
                          <td key={scoreIndex} className="py-3 px-2 font-semibold">
                            {score}
                          </td>
                        ))}
                        <td className="py-3 px-2 text-white/60">
                          {new Date(rating.timestamp * 1000).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

