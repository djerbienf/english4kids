import React, { useState } from "react";
import { Search, Image as ImageIcon, Music, Video, Plus, Check, X } from "lucide-react";
import { Button } from "../Button";

export interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "audio" | "video";
  url: string;
  size?: string;
  uploadedAt?: string;
}

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "asset-1",
    name: "hero_banner.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600",
    size: "1.2 MB",
    uploadedAt: "2024-01-15",
  },
  {
    id: "asset-2",
    name: "classroom_discussion.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600",
    size: "950 KB",
    uploadedAt: "2024-01-20",
  },
  {
    id: "asset-3",
    name: "greetings_conversation.mp3",
    type: "audio",
    url: "https://actions.google.com/sounds/v1/human_voices/applause.ogg",
    size: "320 KB",
    uploadedAt: "2024-02-01",
  },
  {
    id: "asset-4",
    name: "intro_sample_video.mp4",
    type: "video",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    size: "15 MB",
    uploadedAt: "2024-02-10",
  },
];

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  filterType?: "all" | "image" | "audio" | "video";
  title?: string;
}

export function AssetPickerModal({
  isOpen,
  onClose,
  onSelect,
  filterType = "all",
  title = "Select from Media Library",
}: AssetPickerModalProps) {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<"all" | "image" | "audio" | "video">(filterType);
  const [customUrl, setCustomUrl] = useState("");
  const [assets, setAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem("lms_media_library_assets");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_MEDIA_ASSETS;
  });

  if (!isOpen) return null;

  const filteredAssets = assets.filter((asset) => {
    const matchesType = activeType === "all" || asset.type === activeType;
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.url.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    let guessedType: "image" | "audio" | "video" = "image";
    if (customUrl.match(/\.(mp3|wav|ogg|m4a)$/i)) guessedType = "audio";
    else if (customUrl.match(/\.(mp4|webm|mov)$/i)) guessedType = "video";

    const newAsset: MediaAsset = {
      id: `asset-${Date.now()}`,
      name: customUrl.split("/").pop()?.split("?")[0] || "Custom Media Link",
      type: guessedType,
      url: customUrl.trim(),
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    try {
      localStorage.setItem("lms_media_library_assets", JSON.stringify(updated));
    } catch {
      // ignore
    }
    onSelect(customUrl.trim(), newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 font-['Nunito']">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-primary-light/40 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-primary-light flex items-center justify-between bg-neutral-bg shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              📁
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-dark">{title}</h3>
              <p className="text-xs text-text-secondary">
                Select an uploaded asset or paste a custom URL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-primary-dark p-2 rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-primary-light flex flex-wrap gap-3 items-center justify-between shrink-0 bg-white">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search assets by name or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-primary-light rounded-xl outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-1 bg-neutral-bg p-1 rounded-xl border border-primary-light">
            {(["all", "image", "audio", "video"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeType === t
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-primary-dark"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[220px]">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-text-secondary space-y-2">
              <div className="text-3xl">📭</div>
              <p className="font-bold text-sm">No media assets found</p>
              <p className="text-xs">Add a custom link below or change your search filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset.url, asset);
                    onClose();
                  }}
                  className="group relative border border-primary-light/60 rounded-2xl p-3 bg-neutral-bg hover:bg-primary/5 hover:border-primary cursor-pointer transition-all flex flex-col items-center text-center"
                >
                  <div className="w-full h-24 rounded-xl bg-white border border-primary-light/40 flex items-center justify-center overflow-hidden mb-2">
                    {asset.type === "image" ? (
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : asset.type === "audio" ? (
                      <Music size={32} className="text-primary/70" />
                    ) : (
                      <Video size={32} className="text-primary/70" />
                    )}
                  </div>

                  <p className="text-xs font-bold text-primary-dark truncate w-full">
                    {asset.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-text-secondary uppercase">
                    <span className="bg-white px-1.5 py-0.5 rounded border border-primary-light/40">
                      {asset.type}
                    </span>
                    {asset.size && <span>{asset.size}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Direct URL Input */}
        <form
          onSubmit={handleAddCustomUrl}
          className="p-4 border-t border-primary-light bg-neutral-bg flex items-center gap-2 shrink-0"
        >
          <input
            type="url"
            placeholder="Or enter direct external media URL (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-primary-light rounded-xl outline-none focus:border-primary bg-white"
          />
          <Button
            type="submit"
            disabled={!customUrl.trim()}
            className="px-4 py-2 text-xs font-bold"
          >
            Insert URL
          </Button>
        </form>
      </div>
    </div>
  );
}
