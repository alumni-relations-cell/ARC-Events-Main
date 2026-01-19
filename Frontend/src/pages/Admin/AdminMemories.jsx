import { useEffect, useState } from "react";
import { useAdminEvent } from "../../context/AdminEventContext";
import { apiAdmin } from "../../lib/apiAdmin";
import { api } from "../../lib/api"; // For global images endpoint
import { compressImage } from "../../lib/imageUtils";
import { toast } from "react-toastify";

const TABS = { EVENT: "EVENT", GLOBAL: "GLOBAL" };
const GLOBAL_CATS = {
  home_announcement: "🏠 Announcements",
  home_memories: "🏠 Memories",
  memories_page: "🖼️ Memories Page"
};

export default function AdminMemories() {
  const { activeEvent } = useAdminEvent();
  const [tab, setTab] = useState(TABS.EVENT);

  // Event Gallery State
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Global Gallery State
  const [globalImages, setGlobalImages] = useState([]);
  const [globalCat, setGlobalCat] = useState("home_announcement");

  // --- EVENT GALLERY FUNCTIONS ---
  const loadEventPhotos = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const res = await apiAdmin.get(`/api/admin/events/${activeEvent._id}/photos`);
      setImages(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const uploadEventPhoto = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file, { quality: 0.85 });
      const form = new FormData();
      form.append("image", compressedFile);
      await apiAdmin.post(`/api/admin/events/${activeEvent._id}/photos`, form);
      setFile(null);
      document.getElementById("event-upload").value = "";
      loadEventPhotos();
      toast.success("Photo uploaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload photo");
    }
    finally { setUploading(false); }
  };

  const deleteEventPhoto = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await apiAdmin.delete(`/api/admin/events/${activeEvent._id}/photos/${id}`);
      loadEventPhotos();
    } catch (e) { }
  };

  // --- GLOBAL GALLERY FUNCTIONS ---
  const loadGlobalPhotos = async () => {
    setLoading(true);
    try {
      const res = await apiAdmin.get("/api/admin/images", { params: { category: globalCat } });
      setGlobalImages(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const uploadGlobalPhoto = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file, { quality: 0.85 });
      const form = new FormData();
      form.append("image", compressedFile);
      form.append("category", globalCat);
      await apiAdmin.post("/api/admin/images/upload", form);
      setFile(null);
      document.getElementById("global-upload").value = "";
      loadGlobalPhotos();
      toast.success("Photo uploaded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to upload photo");
    }
    finally { setUploading(false); }
  };

  const deleteGlobalPhoto = async (id) => {
    if (!window.confirm("Delete Global Photo?")) return;
    try {
      await apiAdmin.delete(`/api/admin/images/${id}`);
      loadGlobalPhotos();
    } catch (e) { }
  };

  // Effects
  useEffect(() => {
    if (tab === TABS.EVENT) loadEventPhotos();
    else loadGlobalPhotos();
  }, [tab, activeEvent, globalCat]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Gallery Manager</h2>

        {/* Tabs */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setTab(TABS.EVENT)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === TABS.EVENT ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Event Photos
          </button>
          <button
            onClick={() => setTab(TABS.GLOBAL)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === TABS.GLOBAL ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Home/Global Photos
          </button>
        </div>
      </div>

      {/* EVENT MODE */}
      {tab === TABS.EVENT && (
        !activeEvent ? <div className="text-gray-500 text-center py-10">Select an event from sidebar first.</div> :
          <div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Add Photo to {activeEvent.name}</label>
                <input
                  id="event-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2 bg-gray-950 p-1 rounded border border-gray-700"
                />
              </div>
              <button onClick={uploadEventPhoto} disabled={!file || uploading} className="bg-indigo-600 px-6 py-2.5 rounded-lg font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            <GalleryGrid images={images} onDelete={deleteEventPhoto} loading={loading} />
          </div>
      )}

      {/* GLOBAL MODE */}
      {tab === TABS.GLOBAL && (
        <div>
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 space-y-4">
            {/* Category Selector */}
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Category</label>
              <div className="flex gap-2">
                {Object.entries(GLOBAL_CATS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setGlobalCat(key)}
                    className={`px-3 py-1.5 rounded text-sm border ${globalCat === key ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-4 pt-4 border-t border-gray-800">
              <div className="flex-1">
                <input
                  id="global-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:bg-indigo-600 file:text-white file:border-0 file:rounded-full file:px-4 file:py-2 bg-gray-950 p-1 rounded border border-gray-700"
                />
              </div>
              <button onClick={uploadGlobalPhoto} disabled={!file || uploading} className="bg-purple-600 px-6 py-2.5 rounded-lg font-bold text-white hover:bg-purple-500 disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload Global"}
              </button>
            </div>
          </div>
          <GalleryGrid images={globalImages} onDelete={deleteGlobalPhoto} loading={loading} />
        </div>
      )}
    </div>
  );
}

function GalleryGrid({ images, onDelete, loading }) {
  if (loading) return <div className="text-center py-10 text-gray-500">Loading...</div>;
  if (images.length === 0) return <div className="text-center py-10 text-gray-600 italic">No photos found.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {images.map(img => (
        <div key={img._id} className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 transition hover:scale-[1.02]">
          <img src={img.url} className="w-full h-48 object-cover" alt="Gallery" />
          <div className="absolute inset-x-0 bottom-0 p-4 flex justify-end bg-gradient-to-t from-black/80 via-transparent">
            <button
              onClick={() => onDelete(img._id)}
              className="bg-red-600 text-white p-2 rounded-lg shadow hover:bg-red-700"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}