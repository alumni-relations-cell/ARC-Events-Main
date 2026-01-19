import { useEffect, useState } from "react";
import { apiAdmin } from "../../lib/apiAdmin";
import { useAdminEvent } from "../../context/AdminEventContext";
import { toast } from "react-toastify";
import { UserCheck, UserX, Shield, Calendar } from "lucide-react";

export default function AdminControllers() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [rejected, setRejected] = useState([]);
  const { events } = useAdminEvent();
  const [selections, setSelections] = useState({});

  const loadData = async () => {
    try {
      const [pRes, aRes, rRes] = await Promise.all([
        apiAdmin.get("/api/admin/controllers/pending"),
        apiAdmin.get("/api/admin/controllers"),
        apiAdmin.get("/api/admin/controllers/rejected")
      ]);
      setPending(pRes.data);
      setActive(aRes.data);
      setRejected(rRes.data);
    } catch {
      // Silent fail
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id, overrideEvents = null) => {
    const assigned = overrideEvents || selections[id] || [];

    try {
      await apiAdmin.post(`/api/admin/controllers/${id}/approve`, { events: assigned });
      toast.success("Controller approved successfully!");
      loadData();
      setSelections({});
    } catch {
      toast.error("Approval failed.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this controller request?")) return;
    try {
      await apiAdmin.post(`/api/admin/controllers/${id}/reject`);
      toast.success("Controller rejected");
      loadData();
    } catch {
      toast.error("Failed to reject.");
    }
  };

  const handleRevert = async (id) => {
    try {
      await apiAdmin.post(`/api/admin/controllers/${id}/revert`);
      toast.success("Reverted to pending");
      loadData();
    } catch {
      toast.error("Failed to revert.");
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke access for this controller?")) return;
    try {
      await apiAdmin.post(`/api/admin/controllers/${id}/revoke`);
      toast.success("Access revoked");
      loadData();
    } catch {
      toast.error("Failed to revoke.");
    }
  };

  const toggleEvent = (controllerId, eventId) => {
    const current = selections[controllerId] || [];
    const newSelection = current.includes(eventId)
      ? current.filter(id => id !== eventId)
      : [...current, eventId];
    setSelections({ ...selections, [controllerId]: newSelection });
  };

  const handleUpdateEvents = async (controllerId) => {
    try {
      await apiAdmin.post(`/api/admin/controllers/${controllerId}/approve`, {
        events: selections[controllerId] || [],
        replace: true
      });
      toast.success("Events updated successfully!");
      loadData();
      setSelections({ ...selections, editing: null });
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-indigo-500" />
        <h1 className="text-3xl font-bold text-white">Controller Management</h1>
      </div>

      {/* PENDING REQUESTS */}
      <section>
        <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
          <UserCheck className="h-5 w-5" /> Pending Approvals ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="bg-gray-900/50 p-8 rounded-xl border border-dashed border-gray-800 text-gray-500 text-center">
            No pending requests
          </div>
        ) : (
          <div className="grid gap-6">
            {pending.map(c => {
              const requestedIds = c.requestedEvents?.map(e => e._id) || [];
              const selectedEvents = selections[c._id] || requestedIds;

              return (
                <div key={c._id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Applicant Info */}
                    <div className="lg:w-1/3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Applicant</p>
                      <p className="text-2xl font-bold text-white mb-2">@{c.username}</p>

                      {c.requestedEvents?.length > 0 && (
                        <div className="mt-4 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                          <p className="text-xs text-yellow-300 font-bold mb-2">Requested Events:</p>
                          <div className="space-y-1">
                            {c.requestedEvents.map(re => (
                              <div key={re._id} className="text-xs text-yellow-200 flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {re.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Event Selection */}
                    <div className="lg:w-2/3">
                      <p className="text-sm font-bold text-gray-300 mb-3">Assign Event Access</p>
                      <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {events.map(ev => {
                            const isSelected = selectedEvents.includes(ev._id);
                            const isRequested = requestedIds.includes(ev._id);

                            return (
                              <label
                                key={ev._id}
                                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected
                                  ? 'bg-indigo-600/20 border-2 border-indigo-500'
                                  : 'bg-gray-900 border-2 border-gray-800 hover:border-gray-700'
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleEvent(c._id, ev._id)}
                                  className="mt-1 h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                    {ev.name}
                                    {isRequested && <span className="ml-2 text-xs text-yellow-400">★</span>}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(ev.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-gray-500">
                          {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReject(c._id)}
                            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2.5 rounded-lg font-bold border border-red-900/50 transition flex items-center gap-2"
                          >
                            <UserX className="h-4 w-4" /> Reject
                          </button>
                          <button
                            onClick={() => handleApprove(c._id, selectedEvents)}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                          >
                            <UserCheck className="h-4 w-4" /> Approve Controller
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* REJECTED REQUESTS */}
      <section>
        <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
          <UserX className="h-5 w-5" /> Rejected Requests ({rejected.length})
        </h2>

        {rejected.length > 0 && (
          <div className="grid gap-6">
            {rejected.map(c => (
              <div key={c._id} className="bg-gray-900/50 p-6 rounded-xl border border-red-900/30 opacity-70 hover:opacity-100 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-red-400 uppercase tracking-wider font-bold mb-1">Rejected Applicant</p>
                    <p className="text-xl font-bold text-gray-400">@{c.username}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested: {c.requestedEvents?.map(e => e.name).join(", ") || "None"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevert(c._id)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-bold border border-gray-700 transition flex items-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" /> Revert to Pending
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTIVE CONTROLLERS */}
      <section>
        <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" /> Active Controllers ({active.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {active.map(c => {
            const isEditing = selections.editing === c._id;
            const currentEventIds = c.approvedEvents?.map(e => e._id) || [];
            const selectedEvents = selections[c._id] || currentEventIds;

            return (
              <div key={c._id} className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow hover:border-gray-700 transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white">@{c.username}</h3>
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <span className="h-2 w-2 bg-green-400 rounded-full"></span> Active
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setSelections({ ...selections, editing: null });
                        } else {
                          setSelections({ ...selections, [c._id]: currentEventIds, editing: c._id });
                        }
                      }}
                      className={`p-2 rounded transition ${isEditing
                        ? 'bg-gray-700 text-gray-300'
                        : 'text-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20'
                        }`}
                      title={isEditing ? "Cancel" : "Edit Events"}
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRevoke(c._id)}
                      className="text-red-400 bg-red-400/10 p-2 rounded hover:bg-red-400/20 transition"
                      title="Revoke Access"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="bg-gray-950 p-3 rounded-lg border border-indigo-500/50">
                    <p className="text-xs font-bold mb-3 text-indigo-300">Update Event Access</p>
                    <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                      {events.map(ev => {
                        const isSelected = selectedEvents.includes(ev._id);

                        return (
                          <label
                            key={ev._id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${isSelected ? 'bg-indigo-600/20' : 'bg-gray-900 hover:bg-gray-800'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleEvent(c._id, ev._id)}
                              className="h-3.5 w-3.5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={`text-xs ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>
                              {ev.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-gray-800">
                      <button
                        onClick={() => setSelections({ ...selections, editing: null })}
                        className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded hover:bg-gray-800 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateEvents(c._id)}
                        className="text-xs bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-500 font-medium transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Assigned Events</p>
                    {c.approvedEvents && c.approvedEvents.length > 0 ? (
                      <div className="space-y-1.5">
                        {c.approvedEvents.map(e => (
                          <div key={e._id} className="bg-indigo-900/30 text-indigo-300 px-3 py-1.5 rounded text-xs border border-indigo-500/30 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {e.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 italic">No events assigned</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}