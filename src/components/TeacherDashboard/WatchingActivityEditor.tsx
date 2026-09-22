import React, { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../Button";
import { AssetPickerModal } from "./AssetPickerModal";

interface WatchingActivityEditorProps {
  activity: any;
  updateActivityField: (activityId: number, field: string | Record<string, any>, value?: any) => void;
}

export function WatchingActivityEditor({ activity, updateActivityField }: WatchingActivityEditorProps) {
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-[14px] font-medium text-text-primary mb-1">
          Video URL (YouTube, MP4)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={activity.videoUrl || ""}
            onChange={(e) =>
              updateActivityField(
                activity.id,
                "videoUrl",
                e.target.value,
              )
            }
            className="flex-1 bg-white border border-primary-light rounded-lg p-2 text-[14px]"
            placeholder="https://... (e.g. YouTube URL or direct MP4/WebM)"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAssetPicker(true)}
            className="text-xs px-3 border-primary-light bg-white flex items-center gap-1.5"
          >
            <FolderOpen size={14} /> Media
          </Button>
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-[14px] font-medium text-text-primary mb-1">
          Video Title
        </label>
        <input
          type="text"
          value={activity.videoTitle || ""}
          onChange={(e) =>
            updateActivityField(
              activity.id,
              "videoTitle",
              e.target.value,
            )
          }
          className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
          placeholder="e.g. French Cafe Dialogue"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[14px] font-medium text-text-primary mb-1">
          Description / Instructions
        </label>
        <textarea
          value={activity.videoDesc || ""}
          onChange={(e) =>
            updateActivityField(
              activity.id,
              "videoDesc",
              e.target.value,
            )
          }
          className="w-full bg-white border border-primary-light rounded-lg p-2 text-[14px]"
          rows={2}
          placeholder="Instructions for students while watching..."
        />
      </div>

      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        filterType="video"
        title="Select Video Resource"
        onSelect={(url) => updateActivityField(activity.id, "videoUrl", url)}
      />
    </div>
  );
}
