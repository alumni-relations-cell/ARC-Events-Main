import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUser } from "../../lib/apiUser";
import {
  Ticket, Calendar, Clock, CheckCircle, XCircle,
  AlertCircle, ArrowRight, Loader, User, Mail, Plus
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Modal State
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    // 1. Get Local Profile
    const auth = JSON.parse(localStorage.getItem("app_auth") || "{}");
    const user = auth?.user || {};
    // Normalize user info
    setProfile({
      name: user.name || user.fullName || user.displayName || "User",
      email: user.email || "No Email",
      picture: user.picture || user.photoURL || null
    });

    // 2. Fetch Registrations
    apiUser.get("/api/events/registrations/mine")
      .then(res => setRegistrations(res.data || []))
      .catch(err => {
        console.error(err);
        setError("Failed to load your registrations.");
      })
      .finally(() => setLoading(false));

    // 3. Listen for logout from other tabs/navbar
    const checkAuth = () => {
      const currentAuth = localStorage.getItem("app_auth");
      if (!currentAuth) {
        window.location.href = "/";
      }
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("app_auth");
    window.location.href = "/";
  };

  // Helper for status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return { icon: <CheckCircle size={16} />, style: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'REJECTED':
        return { icon: <XCircle size={16} />, style: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default:
        return { icon: <Clock size={16} />, style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <Loader className="w-10 h-10 text-[#ca0002] animate-spin" />
        <p className="text-[#ca0002] font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background Ambience - Subtle Light Gradient */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-100 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* PROFILE CARD */}
        <div className="bg-white border border-gray-200 rounded-[24px] p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden flex-shrink-0">
            {profile?.picture ? (
              <img src={profile.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#8B0000] flex items-center justify-center text-white text-3xl font-bold">
                {profile?.name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-1 font-serif">{profile?.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-medium">
              <Mail size={16} className="text-[#ca0002]" /> {profile?.email}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm mt-2">
              <FaGoogle className="text-blue-500" /> Connected Account
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[150px]">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase font-bold mb-1 tracking-wider">Total Events</p>
              <p className="text-3xl font-bold text-[#8B0000]">{registrations.length}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white hover:bg-red-50 text-gray-600 hover:text-[#ca0002] rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border border-gray-200 hover:border-[#ca0002]"
            >
              Log Out
            </button>
          </div>
        </div>


        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 font-serif">
            <Ticket className="text-[#ca0002]" /> My Registrations
          </h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Empty State */}
        {!error && registrations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No Registrations Found</h3>
            <p className="text-gray-500 mt-2">You haven't registered for any upcoming events yet.</p>
          </div>
        ) : (
          /* Registration List */
          <div className="grid gap-4">
            {registrations.map(reg => {
              const { icon, style } = getStatusStyle(reg.status);
              // Override style for light mode if needed or keep default utility classes if generic enough.
              // Let's redefine styled helper function locally or inline if the previous one assumes dark mode colors.
              // The previous `getStatusStyle` used `text-green-400`, which might be too light on white.
              // I will adjust the call or styles below.

              // New light mode styles:
              let statusClass = "bg-gray-100 text-gray-500 border-gray-200";
              let statusIcon = <Clock size={16} />;

              if (reg.status === 'APPROVED') {
                statusClass = "bg-green-50 text-green-700 border-green-200";
                statusIcon = <CheckCircle size={16} />;
              } else if (reg.status === 'REJECTED') {
                statusClass = "bg-red-50 text-red-700 border-red-200";
                statusIcon = <XCircle size={16} />;
              }

              return (
                <div
                  key={reg._id}
                  onClick={() => setSelectedReg(reg)}
                  className="group bg-white border border-gray-100 p-6 rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-lg hover:border-gray-200 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#ca0002] transition-colors">
                        {reg.event?.name || "Event Name Unavailable"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" /> {new Date(reg.createdAt).toLocaleDateString()}
                      </span>
                      <span className="hidden md:inline text-gray-300">|</span>
                      <span>Batch: {reg.batch}</span>
                      {reg.amount > 0 && (
                        <>
                          <span className="hidden md:inline text-gray-300">|</span>
                          <span className="text-green-600 font-bold">Paid: ₹{reg.amount}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-bold text-xs uppercase tracking-wider ${statusClass}`}>
                    {statusIcon} {reg.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReg(null)}>
          <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 font-serif">{selectedReg.event?.name}</h3>
                <p className="text-gray-500 text-sm mt-1">Registration Details</p>
              </div>
              <button onClick={() => setSelectedReg(null)} className="text-gray-400 hover:text-[#ca0002] transition">
                <XCircle size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex justify-between items-center ${selectedReg.status === 'APPROVED' ? "bg-green-50 border-green-100 text-green-700" :
                selectedReg.status === 'REJECTED' ? "bg-red-50 border-red-100 text-red-700" :
                  "bg-gray-50 border-gray-200 text-gray-600"
                }`}>
                <span className="font-bold flex items-center gap-2">
                  {selectedReg.status === 'APPROVED' ? <CheckCircle size={20} /> :
                    selectedReg.status === 'REJECTED' ? <XCircle size={20} /> : <Clock size={20} />}
                  Application Status
                </span>
                <span className="font-mono font-bold">{selectedReg.status}</span>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Name</span>
                  <span className="text-gray-900 font-medium">{selectedReg.name}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Batch</span>
                  <span className="text-gray-900 font-medium">{selectedReg.batch}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Mobile</span>
                  <span className="text-gray-900 font-medium">{selectedReg.contact || selectedReg.mobile}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Email</span>
                  <span className="text-gray-900 font-medium break-all">{selectedReg.email}</span>
                </div>
              </div>

              {/* Family Info */}
              {selectedReg.familyMembers && selectedReg.familyMembers.length > 0 && (
                <div>
                  <h4 className="text-gray-900 font-bold mb-3 border-b border-gray-100 pb-2">Family Members ({selectedReg.familyMembers.length})</h4>
                  <div className="space-y-2">
                    {selectedReg.familyMembers.map((m, i) => (
                      <div key={i} className="flex justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-gray-800 font-medium">{m.name}</span>
                        <span className="text-[#8B0000] text-sm font-semibold">{m.relation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {selectedReg.amount > 0 && (
                <div>
                  <h4 className="text-gray-900 font-bold mb-3 border-b border-gray-100 pb-2">Payment Info</h4>
                  <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                    <span className="text-green-800 font-medium">Total Amount Paid</span>
                    <span className="text-xl font-bold text-green-700">₹{selectedReg.amount}</span>
                  </div>
                  {/* Receipt logic same as before, simplified visual */}
                  {selectedReg.receipt && (
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      * Payment receipt on file.
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}