import { useEffect, useState } from "react";
import { apiAdmin } from "../../lib/apiAdmin";
import { toast } from "react-toastify";
import { useAdminEvent } from "../../context/AdminEventContext";
import FilePicker from "../../components/FilePicker";
import { FaEdit, FaPlus, FaTimes, FaImage, FaTrash, FaQrcode } from "react-icons/fa";

export default function AdminEvents() {
  const { fetchEvents } = useAdminEvent();
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Local Previews
  const [posterPreview, setPosterPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);

  const emptyForm = {
    name: "", slug: "", description: "",
    status: "DRAFT", isHidden: false,
    paid: false, basePrice: 0, familyAllowed: false, addonPricePerMember: 0,
    flow: [], posterUrl: "", paymentQRUrl: ""
  };

  const [form, setForm] = useState(emptyForm);

  const [isFormVisible, setIsFormVisible] = useState(false);

  /* =========================================
     1. LOAD DATA
     ========================================= */
  const loadList = async () => {
    try {
      const res = await apiAdmin.get("/api/admin/events");
      setEvents(Array.isArray(res.data) ? res.data : []);
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error("Could not load events");
    }
  };

  useEffect(() => { loadList(); }, []);

  /* =========================================
     2. DELETE HANDLER
     ========================================= */
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (prompt("Type CONFIRM to delete this event permanently:") !== "CONFIRM") return;

    try {
      await apiAdmin.delete(`/api/admin/events/${id}`);
      toast.success("Event deleted");
      setEvents(prev => prev.filter(ev => ev._id !== id));
      if (editingId === id) handleReset();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* =========================================
     3. UPLOAD HANDLER
     ========================================= */
  const handleUpload = async (type, file) => {
    if (!file) return;
    if (!editingId) {
      return toast.warning("Please Click 'Create Event' first to save details before uploading.");
    }

    // Preview instantly
    const objectUrl = URL.createObjectURL(file);
    if (type === "poster") setPosterPreview(objectUrl);
    else setQrPreview(objectUrl);

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await apiAdmin.post(`/api/admin/events/${editingId}/${type}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUrl = type === "poster" ? res.data.posterUrl : res.data.paymentQRUrl;

      // Update Form State
      setForm(prev => ({
        ...prev,
        [type === "poster" ? "posterUrl" : "paymentQRUrl"]: newUrl
      }));

      // Update List State (Instant Reflection)
      setEvents(prev => prev.map(ev =>
        ev._id === editingId
          ? { ...ev, [type === "poster" ? "posterUrl" : "paymentQRUrl"]: newUrl }
          : ev
      ));

      toast.success(`${type === "poster" ? "Poster" : "QR"} uploaded!`);
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Upload failed");
    }
  };

  /* =========================================
     4. SAVE (Create / Update)
     ========================================= */
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.slug) return toast.warning("Name and Slug are required");

      // Filter out system fields
      const { _id, createdAt, updatedAt, __v, createdBy, ...rest } = form;
      const payload = { ...rest };

      if (editingId) {
        // UPDATE
        const res = await apiAdmin.patch(`/api/admin/events/${editingId}`, payload);
        toast.success("Event updated");

        // Update local list
        setEvents(prev => prev.map(ev => ev._id === editingId ? res.data : ev));
        setForm(res.data); // Sync form with server response
      } else {
        // CREATE
        const res = await apiAdmin.post("/api/admin/events", payload);
        toast.success("Event created! Now you can upload assets.");

        setEditingId(res.data._id);
        setForm(res.data);
        setEvents(prev => [res.data, ...prev]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  /* =========================================
     5. HELPER ACTIONS
     ========================================= */
  const handleEditClick = (ev) => {
    setEditingId(ev._id);
    setForm({
      ...ev,
      paid: ev.paid || false,
      familyAllowed: ev.familyAllowed || false,
      basePrice: ev.basePrice || 0,
      addonPricePerMember: ev.addonPricePerMember || 0,
      flow: ev.flow || []
    });
    setPosterPreview(ev.posterUrl);
    setQrPreview(ev.paymentQRUrl);
    setIsFormVisible(true);
    // setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPosterPreview(null);
    setQrPreview(null);
    setIsFormVisible(true);
    // setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 100);
  };

  const handleReset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPosterPreview(null);
    setQrPreview(null);
    setIsFormVisible(false); // Hide form on reset/cancel
  };

  // Safe State Updates for Nested Objects
  const addFlow = () => setForm(prev => ({ ...prev, flow: [...prev.flow, { title: "", date: "", desc: "" }] }));
  const removeFlow = (idx) => setForm(prev => ({ ...prev, flow: prev.flow.filter((_, i) => i !== idx) }));

  const updateFlow = (idx, field, val) => {
    setForm(prev => {
      const newFlow = [...prev.flow];
      newFlow[idx][field] = val;
      return { ...prev, flow: newFlow };
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Manager</h1>
          <p className="text-gray-400 mt-1">Create, edit, and manage ARC events.</p>
        </div>
        {!isFormVisible && (
          <button
            onClick={handleCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <FaPlus /> Create New
          </button>
        )}
      </div>

      {/* LIST SECTION: Existing Events (MOVED TO TOP) */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-indigo-500">Existing Events ({events.length})</h3>

        {events.length === 0 && (
          <div className="text-center p-12 bg-gray-900 border border-gray-800 border-dashed rounded-xl">
            <p className="text-gray-500">No events found. Click "Create New" to start.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(ev => (
            <div
              key={ev._id}
              onClick={() => handleEditClick(ev)}
              className={`group relative bg-gray-900 rounded-xl overflow-hidden border cursor-pointer hover:shadow-2xl transition-all duration-300 ${editingId === ev._id && isFormVisible ? "border-orange-500 ring-2 ring-orange-500/50" : "border-gray-800 hover:border-indigo-500"}`}
            >
              <button
                onClick={(e) => handleDelete(e, ev._id)}
                className="absolute top-2 right-2 z-20 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all shadow-lg transform hover:scale-110"
                title="Permanently Delete Event"
              >
                <FaTrash size={12} />
              </button>

              <span className={`absolute top-2 left-2 z-10 text-[10px] px-2 py-1 rounded font-bold shadow-sm ${ev.status === "LIVE" ? "bg-green-500 text-black" : "bg-gray-700 text-white"}`}>
                {ev.status}
              </span>

              <div className="h-40 bg-gray-800 relative w-full overflow-hidden">
                <img
                  src={ev.posterUrl || "https://placehold.co/400x300?text=No+Poster"}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-105"
                  alt={ev.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
                />
              </div>

              <div className="p-4">
                <h4 className="font-bold text-white truncate mb-1">{ev.name}</h4>
                <p className="text-xs text-gray-500 font-mono mb-3">{ev.slug}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ev.paid ? 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10' : 'border-green-500/30 text-green-300 bg-green-500/10'}`}>
                    {ev.paid ? "PAID" : "FREE"}
                  </span>
                  {ev.isHidden && <span className="text-[10px] text-red-400 px-1 border border-red-500/30 bg-red-500/10 rounded">HIDDEN</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDITOR SECTION (CONDITIONAL) */}
      {isFormVisible && (
        <div className={`mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300 animate-fade-in ${editingId ? 'ring-1 ring-orange-500' : 'ring-1 ring-green-600'}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${editingId ? "bg-orange-500" : "bg-green-500"}`}></div>

          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              {editingId ? <FaEdit className="text-orange-500" /> : <FaPlus className="text-green-500" />}
              {editingId ? "Editing Event" : "Create New Event"}
              {editingId && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded font-normal ml-2">{form.name}</span>}
            </h2>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-sm bg-gray-800 px-3 py-1.5 rounded hover:bg-gray-700 transition"
            >
              <FaTimes /> Close Form
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Text Fields */}
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Event Name</label>
                  <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 text-white rounded p-3 mt-1 outline-none focus:border-indigo-500" placeholder="Event Title" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Slug (URL)</label>
                  <input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 text-white rounded p-3 mt-1 outline-none focus:border-indigo-500" placeholder="event-slug" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 text-white rounded p-3 mt-1 h-24 outline-none focus:border-indigo-500" />
              </div>

              {/* Timeline Editor */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-400 uppercase">Event Timeline</label>
                  <button onClick={addFlow} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition">+ Add Activity</button>
                </div>
                <div className="space-y-2">
                  {form.flow.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <input placeholder="Time (e.g. 10:00 AM)" value={item.date} onChange={e => updateFlow(idx, "date", e.target.value)} className="w-1/4 bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white" />
                      <input placeholder="Activity Title" value={item.title} onChange={e => updateFlow(idx, "title", e.target.value)} className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white" />
                      <button onClick={() => removeFlow(idx)} className="text-red-500 p-2 hover:bg-red-900/20 rounded"><FaTimes /></button>
                    </div>
                  ))}
                  {form.flow.length === 0 && <p className="text-gray-600 text-sm italic">No timeline items added.</p>}
                </div>
              </div>
            </div>

            {/* RIGHT: Settings & Assets */}
            <div className="space-y-6">

              {/* Status Panel */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))} className="w-full bg-gray-900 border border-gray-600 text-white rounded p-2 mt-1 mb-3 cursor-pointer">
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="LIVE">Live (Active)</option>
                  <option value="PAUSED">Paused</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-700/50 rounded">
                  <input type="checkbox" checked={form.isHidden} onChange={e => setForm(prev => ({ ...prev, isHidden: e.target.checked }))} />
                  <span className="text-sm text-gray-300">Hide from Public Page</span>
                </label>
              </div>

              {/* Pricing Panel (Fixed Toggle) */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <label className="flex items-center gap-2 cursor-pointer mb-2 select-none">
                  <input
                    type="checkbox"
                    checked={form.paid}
                    onChange={e => setForm(prev => ({ ...prev, paid: e.target.checked }))}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  <span className="font-bold text-white">Paid Event</span>
                </label>

                {form.paid && (
                  <div className="space-y-3 pl-4 border-l-2 border-indigo-500 ml-1 mt-2 animate-fade-in">
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Base Price</span>
                      <input type="number" value={form.basePrice} onChange={e => setForm(prev => ({ ...prev, basePrice: Number(e.target.value) }))} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm" />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-300 mt-2 cursor-pointer">
                      <input type="checkbox" checked={form.familyAllowed} onChange={e => setForm(prev => ({ ...prev, familyAllowed: e.target.checked }))} />
                      Allow Family Members
                    </label>

                    {form.familyAllowed && (
                      <div>
                        <span className="text-xs text-gray-400 block mb-1 mt-2">Add-on Price (per person)</span>
                        <input type="number" value={form.addonPricePerMember} onChange={e => setForm(prev => ({ ...prev, addonPricePerMember: Number(e.target.value) }))} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-white text-sm" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assets Panel (Disabled until ID exists) */}
              <div className={`p-4 rounded-lg border transition-opacity ${editingId ? "bg-gray-800 border-gray-700" : "bg-gray-800/50 border-gray-700 opacity-50 pointer-events-none"}`}>
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><FaImage /> Assets</p>
                {!editingId && <p className="text-xs text-yellow-500 mb-2">Create event to upload assets.</p>}

                {/* Poster */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-300">Event Poster</span>
                  </div>
                  {posterPreview ? (
                    <img src={posterPreview} className="w-full h-32 object-cover rounded mb-2 border border-gray-600" alt="Poster" />
                  ) : (
                    <div className="w-full h-32 bg-gray-900 rounded mb-2 flex items-center justify-center text-gray-700 text-xs border border-gray-800">No Image</div>
                  )}
                  <FilePicker label={posterPreview ? "Change Poster" : "Upload Poster"} onChange={(e) => handleUpload("poster", e.target.files[0])} />
                </div>

                {/* QR (Only if Paid) */}
                {form.paid && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-300">Payment QR</span>
                    </div>
                    {qrPreview ? (
                      <img src={qrPreview} className="w-24 h-24 object-contain bg-white rounded mb-2 border border-gray-600" alt="QR" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-900 rounded mb-2 flex items-center justify-center text-gray-700 text-xs border border-gray-800">No QR</div>
                    )}
                    <FilePicker label={qrPreview ? "Change QR" : "Upload QR"} onChange={(e) => handleUpload("qr", e.target.files[0])} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={handleReset} className="flex-1 py-3 rounded-lg font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg transition transform active:scale-95 ${editingId ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}>
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}