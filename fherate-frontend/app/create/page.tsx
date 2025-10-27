"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../hooks/useWallet";
import { useFHERating } from "../../hooks/useFHERating";
import { Plus, X } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { createActivity, isLoading } = useFHERating();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImageUrl: "",
    dimensions: [""],
    scale: 10,
    endTime: "",
    allowMultiple: false,
  });

  const [error, setError] = useState("");

  const addDimension = () => {
    if (formData.dimensions.length < 10) {
      setFormData({ ...formData, dimensions: [...formData.dimensions, ""] });
    }
  };

  const removeDimension = (index: number) => {
    const newDimensions = formData.dimensions.filter((_, i) => i !== index);
    setFormData({ ...formData, dimensions: newDimensions });
  };

  const updateDimension = (index: number, value: string) => {
    const newDimensions = [...formData.dimensions];
    newDimensions[index] = value;
    setFormData({ ...formData, dimensions: newDimensions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.title.length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    const validDimensions = formData.dimensions.filter((d) => d.trim().length > 0);
    if (validDimensions.length === 0) {
      setError("At least one dimension is required");
      return;
    }

    const endTimeTimestamp = new Date(formData.endTime).getTime() / 1000;
    if (endTimeTimestamp <= Date.now() / 1000) {
      setError("End time must be in the future");
      return;
    }

    try {
      const activityId = await createActivity({
        title: formData.title,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
        dimensions: validDimensions,
        scale: formData.scale,
        endTime: endTimeTimestamp,
        allowMultiple: formData.allowMultiple,
      });

      alert(`Activity created successfully! ID: ${activityId}`);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Failed to create activity");
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Create Rating Activity</h1>
          <p className="text-white/70 mb-8">
            Please connect your wallet to create a rating activity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create Rating Activity</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-200">
              {error}
            </div>
          )}

          <div>
            <label>Activity Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., iPhone 15 Pro Review"
              required
            />
          </div>

          <div>
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're rating..."
              rows={4}
              required
            />
          </div>

          <div>
            <label>Cover Image URL (optional)</label>
            <input
              type="url"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label>Rating Dimensions *</label>
            <div className="space-y-3">
              {formData.dimensions.map((dim, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={dim}
                    onChange={(e) => updateDimension(index, e.target.value)}
                    placeholder={`Dimension ${index + 1}`}
                  />
                  {formData.dimensions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDimension(index)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formData.dimensions.length < 10 && (
              <button
                type="button"
                onClick={addDimension}
                className="mt-3 flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Dimension</span>
              </button>
            )}
          </div>

          <div>
            <label>Rating Scale *</label>
            <select
              value={formData.scale}
              onChange={(e) => setFormData({ ...formData, scale: parseInt(e.target.value) })}
            >
              <option value={5}>1-5</option>
              <option value={10}>1-10</option>
              <option value={100}>1-100</option>
            </select>
          </div>

          <div>
            <label>End Time *</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowMultiple"
              checked={formData.allowMultiple}
              onChange={(e) => setFormData({ ...formData, allowMultiple: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="allowMultiple" className="mb-0">
              Allow multiple ratings per user
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Activity"}
          </button>
        </form>
      </div>
    </div>
  );
}

