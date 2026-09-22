import React, { useState, memo, useRef, useEffect } from "react";
import { Button } from "../Button";
import { 
  FolderPlus, Search, Copy, Trash2, Image as ImageIcon, 
  Music, Video, Check, Link as LinkIcon, Upload
} from "lucide-react";
import { DEFAULT_MEDIA_ASSETS, MediaAsset } from "./AssetPickerModal";

export const AssetManagerTab = memo(function AssetManagerTab() {
  const [assets, setAssets] = useState<MediaAsset[]>(() => {
    try {
      const saved = localStorage.getItem("lms_media_library_assets");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_MEDIA_ASSETS;
  });

  const [filter, setFilter] = useState<"all" | "image" | "audio" | "video">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState<"image" | "audio" | "video">("image");
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lms_media_library_assets", JSON.stringify(assets));
    } catch {
      // ignore
    }
  }, [assets]);

  const filteredAssets = assets.filter(
    (asset) =>
      (filter === "all" || asset.type === filter) &&
      (asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.url.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: "image" | "audio" | "video" = "image";
    if (file.type.startsWith("audio/")) type = "audio";
    else if (file.type.startsWith("video/")) type = "video";

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;

      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      const newAsset: MediaAsset = {
        id: `asset-${Date.now()}`,
        name: file.name,
        type,
        url: base64Url,
        size: sizeStr,
        uploadedAt: new Date().toISOString().split("T")[0],
      };

      setAssets((prev) => [newAsset, ...prev]);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetUrl.trim()) return;

    const newAsset: MediaAsset = {
      id: `asset-${Date.now()}`,
      name: newAssetName.trim() || newAssetUrl.split("/").pop()?.split("?")[0] || "Online Media Asset",
      type: newAssetType,
      url: newAssetUrl.trim(),
      uploadedAt: new Date().toISOString().split("T")[0],
    };

    setAssets((prev) => [newAsset, ...prev]);
    setNewAssetUrl("");
    setNewAssetName("");
    setShowAddUrlModal(false);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCopyLink = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6 font-['Nunito']">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-2xl border border-primary-light shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
            <span>📁</span> Media Library & Assets
          </h2>
          <p className="text-text-secondary text-xs mt-1">
            Store and organize illustrations, audio pronunciation clips, and videos for your lessons.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,audio/*,video/*"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => setShowAddUrlModal(true)}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <LinkIcon size={14} /> Add URL Link
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Upload size={14} /> Upload Local File
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-bg p-4 rounded-xl border border-primary-light/60">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-primary-light">
          {(["all", "image", "audio", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                filter === type
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-primary-dark"
              }`}
            >
              {type === "all" ? "All Media" : `${type}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search assets by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-primary-light rounded-xl outline-none focus:border-primary bg-white"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center p-12 bg-neutral-bg rounded-2xl border border-dashed border-primary-light space-y-3">
          <div className="text-4xl text-text-secondary">📭</div>
          <h3 className="text-base font-bold text-primary-dark">
            No media assets found
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You haven't uploaded any {filter !== "all" ? filter : ""} assets matching your search criteria yet.
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="text-xs font-bold mt-2"
          >
            Upload New Asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white border border-primary-light rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col"
            >
              {/* Media Preview Box */}
              <div className="h-36 bg-neutral-bg flex items-center justify-center relative border-b border-primary-light/40 overflow-hidden">
                {asset.type === "image" ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : asset.type === "audio" ? (
                  <div className="flex flex-col items-center gap-1.5 text-primary">
                    <Music size={36} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Audio Clip</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-primary">
                    <Video size={36} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Video Clip</span>
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                  <button
                    onClick={() => handleCopyLink(asset)}
                    className="p-2 bg-white text-primary rounded-xl shadow hover:bg-primary hover:text-white transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 bg-white text-red-500 rounded-xl shadow hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4
                    className="font-bold text-xs text-primary-dark truncate"
                    title={asset.name}
                  >
                    {asset.name}
                  </h4>
                  <div className="flex justify-between items-center text-[10px] text-text-secondary mt-1.5">
                    <span className="uppercase font-extrabold bg-neutral-bg px-2 py-0.5 rounded-md border border-primary-light/50">
                      {asset.type}
                    </span>
                    {asset.size && <span>{asset.size}</span>}
                  </div>
                </div>

                {asset.uploadedAt && (
                  <div className="text-[10px] text-text-secondary border-t border-primary-light/30 pt-2">
                    Added: {asset.uploadedAt}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddUrl}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-primary-light space-y-4"
          >
            <div className="flex items-center justify-between border-b border-primary-light pb-3">
              <h3 className="text-base font-bold text-primary-dark flex items-center gap-2">
                <LinkIcon size={18} className="text-primary" /> Add Media URL
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUrlModal(false)}
                className="text-text-secondary hover:text-primary-dark"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Media Type
                </label>
                <select
                  value={newAssetType}
                  onChange={(e) => setNewAssetType(e.target.value as any)}
                  className="w-full border border-primary-light rounded-xl p-2 text-xs outline-none bg-white font-medium"
                >
                  <option value="image">Image (JPG, PNG, WebP)</option>
                  <option value="audio">Audio (MP3, WAV, OGG)</option>
                  <option value="video">Video (MP4, WebM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Asset Title / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lesson 1 Conversation"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full border border-primary-light rounded-xl p-2 text-xs outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Direct Media URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/audio.mp3"
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  className="w-full border border-primary-light rounded-xl p-2 text-xs outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-primary-light">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddUrlModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs font-bold">
                Save to Library
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
});
