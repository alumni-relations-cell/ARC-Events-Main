import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiUser } from "../../lib/apiUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCopy, FaCheck, FaArrowLeft, FaExclamationTriangle, FaSave } from "react-icons/fa";
import { compressImage, formatFileSize, getCompressionRatio } from "../../lib/imageUtils";
import { useFormAutoSave } from "../../hooks/useFormAutoSave";

/* ---------- Helper: normalize Google user ---------- */
function normalizeGoogleUser(anyUser) {
  if (!anyUser) return null;
  const sub = anyUser.sub || anyUser.uid || anyUser.id || anyUser.user_id || anyUser.googleId || null;
  const email = anyUser.email || anyUser.mail || anyUser.user_email || null;
  const name = anyUser.name || anyUser.fullName || anyUser.displayName || "";
  const picture = anyUser.picture || anyUser.photoURL || anyUser.avatar || "";
  if (!sub || !email) return null;
  return { sub, email, name, picture };
}

export default function Registration() {
  const { eventSlug } = useParams();
  const navigate = useNavigate();

  // Auth State
  const authRaw = typeof window !== "undefined" ? localStorage.getItem("app_auth") : null;
  const auth = authRaw ? JSON.parse(authRaw) : null;
  const [googleProfile, setGoogleProfile] = useState(normalizeGoogleUser(auth?.user));

  // Data State
  const [event, setEvent] = useState(null);
  const [serverRecord, setServerRecord] = useState(null);
  const [viewReceipt, setViewReceipt] = useState(null); // For modal

  // Form State
  const [formData, setFormData] = useState({
    name: googleProfile?.name || "",
    batch: "",
    contact: "",
    email: googleProfile?.email || "",
    comingWithFamily: false,
    familyMembers: [],
    receiptFile: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Checking existing reg
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);

  // Form Auto-Save
  const { restore, clearSaved, lastSaved } = useFormAutoSave(
    formData,
    `registration-${eventSlug}`,
    2000
  );

  /* =========================================
     1. FETCH EVENT DETAILS
     ========================================= */
  useEffect(() => {
    if (!eventSlug) return;
    setIsLoadingEvent(true);
    apiUser.get(`/api/events/${eventSlug}`)
      .then(res => {
        setEvent(res.data);
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not load event details.");
      })
      .finally(() => setIsLoadingEvent(false));
  }, [eventSlug]);

  /* =========================================
     2. DYNAMIC PRICING ENGINE
     ========================================= */
  const totalAmount = useMemo(() => {
    if (!event || !event.paid) return 0;

    const base = Number(event.basePrice) || 0;
    if (!formData.comingWithFamily) return base;

    const n = formData.familyMembers?.length || 0;
    const addon = Number(event.addonPricePerMember) || 0;
    return base + (addon * n);
  }, [event, formData.comingWithFamily, formData.familyMembers]);

  /* =========================================
     3. CHECK EXISTING REGISTRATION
     ========================================= */
  const fetchExisting = useCallback(async (sub) => {
    if (!sub || !eventSlug) return;
    try {
      // Backend Route: /api/events/:slug/me
      const res = await apiUser.get(`/api/events/${eventSlug}/me`, {
        headers: { "Authorization": `Bearer ${auth?.token}` }
      });
      setServerRecord(res.data);

      // If found, Redirect to Dashboard
      if (res.data) {
        // Registered: render details view (handled in render)
      }

    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Check Reg Error:", err);
      }
      setServerRecord(null);
    } finally {
      setIsChecking(false);
    }
  }, [eventSlug, auth?.token, navigate]);

  // Auth & Profile Sync
  useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        if (googleProfile?.sub && googleProfile?.email) return;
        const res = await apiUser.get("/api/auth/me").catch(() => null);
        const me = normalizeGoogleUser(res?.data);
        if (!stopped && me) {
          setGoogleProfile(me);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || me.name || "",
            email: prev.email || me.email || "",
          }));
        }
      } finally {
        if (!stopped) setIsLoadingAuth(false);
      }
    })();
    return () => { stopped = true; };
  }, []);

  // Restore auto-saved data on mount
  useEffect(() => {
    const savedData = restore();
    if (savedData && googleProfile) {
      setFormData(prev => ({
        ...prev,
        ...savedData,
        // Don't overwrite Google profile data
        name: savedData.name || prev.name,
        email: savedData.email || prev.email,
        // receiptFile is excluded from auto-save
        receiptFile: null
      }));
      toast.info("📝 Draft restored from previous session");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleProfile]); // Only run when googleProfile is set

  // Trigger Check Existing
  useEffect(() => {
    if (googleProfile?.sub && eventSlug) {
      setIsChecking(true);
      fetchExisting(googleProfile.sub);
    } else {
      setIsChecking(false);
    }
  }, [googleProfile?.sub, fetchExisting, eventSlug]);

  const handleLogout = () => {
    localStorage.removeItem("app_auth");
    window.location.href = "/login";
  };

  /* =========================================
     4. FORM HANDLERS
     ========================================= */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.batch.trim()) newErrors.batch = "Batch is required";

    const phoneRe = /^[0-9]{10}$/;
    if (!formData.contact.trim()) newErrors.contact = "Mobile number is required";
    else if (!phoneRe.test(formData.contact)) newErrors.contact = "Invalid 10-digit number";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRe.test(formData.email)) newErrors.email = "Invalid email address";

    if (formData.comingWithFamily) {
      formData.familyMembers.forEach((m, idx) => {
        if (!m.name?.trim()) newErrors[`family_${idx}_name`] = "Member name is required";
        if (!m.relation?.trim()) newErrors[`family_${idx}_relation`] = "Relation is required";
      });
    }

    if (event?.paid) {
      if (!formData.receiptFile) newErrors.receiptFile = "Please upload payment screenshot";
      else if (!/^image\//.test(formData.receiptFile.type))
        newErrors.receiptFile = "File must be an image (JPG/PNG)";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length) toast.error("Please fix the errors in the form.");
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((s) => ({ ...s, [name]: checked }));
      if (name === "comingWithFamily" && !checked) {
        setFormData((s) => ({ ...s, familyMembers: [] }));
      }
      return;
    }
    if (type === "file") {
      const file = files?.[0] || null;
      if (file) {
        setIsCompressing(true);
        setCompressionInfo(null);
        try {
          const originalSize = file.size;
          const compressedFile = await compressImage(file, {
            quality: 0.85,
            maxWidth: 1920,
            maxHeight: 1920
          });
          const ratio = getCompressionRatio(originalSize, compressedFile.size);

          setFormData((s) => ({ ...s, receiptFile: compressedFile }));
          setCompressionInfo({
            original: formatFileSize(originalSize),
            compressed: formatFileSize(compressedFile.size),
            ratio: ratio
          });
          // toast.success(`✅ Image compressed by ${ratio}%`);
        } catch (error) {
          console.error('Compression failed:', error);
          toast.error('Failed to compress image, using original');
          setFormData((s) => ({ ...s, receiptFile: file }));
        } finally {
          setIsCompressing(false);
        }
      } else {
        setFormData((s) => ({ ...s, receiptFile: null }));
        setCompressionInfo(null);
      }
      setErrors((prev) => ({ ...prev, receiptFile: undefined }));
      return;
    }
    setFormData((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addFamilyMember = () => setFormData((s) => ({ ...s, familyMembers: [...s.familyMembers, { name: "", relation: "" }] }));
  const removeFamilyMember = (idx) => setFormData((s) => ({ ...s, familyMembers: s.familyMembers.filter((_, i) => i !== idx) }));
  const updateFamilyMember = (idx, key, value) => {
    setFormData((s) => {
      const arr = [...s.familyMembers];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...s, familyMembers: arr };
    });
    // Clear specific error
    const errKey = key === "name" ? `family_${idx}_name` : `family_${idx}_relation`;
    if (errors[errKey]) setErrors((prev) => ({ ...prev, [errKey]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!googleProfile?.sub || !googleProfile?.email) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      // Basic Fields
      fd.append("name", formData.name);
      fd.append("batch", formData.batch);
      fd.append("mobile", formData.contact);
      fd.append("email", formData.email);
      fd.append("amount", totalAmount.toString());

      // Family Logic
      fd.append("familyMembers", JSON.stringify(formData.familyMembers || []));

      // Receipt (Only if paid)
      if (event?.paid && formData.receiptFile) {
        fd.append("receipt", formData.receiptFile);
      }

      const headers = auth?.token ? { Authorization: `Bearer ${auth.token}` } : undefined;

      // Submit
      const res = await apiUser.post(`/api/events/${eventSlug}/register`, fd, { headers });

      setServerRecord(res.data);
      toast.success("Registration Submitted Successfully!");

      // Clear auto-saved data after successful submission
      clearSaved();

      // Redirect to My Registrations
      setTimeout(() => navigate("/my-registrations"), 1000);

    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     5. UI HELPERS
     ========================================= */
  const [copied, setCopied] = useState(false);
  const upiId = "9876543210@upi";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* =========================================
     6. RENDER STATES
     ========================================= */

  // Loading
  if (isLoadingAuth || isLoadingEvent || isChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="animate-pulse text-indigo-400 font-medium">Loading Event Details...</div>
      </div>
    );
  }

  // Guard: Event Not Found or Closed
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <FaExclamationTriangle className="text-5xl text-yellow-500 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Event Not Available</h2>
        <p className="text-gray-400 mb-6">This event does not exist or has been removed.</p>
        <Link to="/" className="px-6 py-2 bg-indigo-600 rounded text-white font-bold hover:bg-indigo-700">Go Home</Link>
      </div>
    );
  }

  // Guard: PAUSED (Offline Registration Only)
  if (event.status === "PAUSED") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
          <FaExclamationTriangle className="text-3xl text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Registration Closed</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Registration is officially closed. You can complete registration offline at campus. Please visit the campus registration desk to register.
        </p>
        <Link to="/events" className="px-6 py-2 bg-gray-800 border border-gray-700 rounded text-white font-bold hover:bg-gray-700 transition">View Other Events</Link>
      </div>
    );
  }

  // Guard: CLOSED (Event Over)
  if (event.status === "CLOSED") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <FaExclamationTriangle className="text-3xl text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Event Closed</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          This event is now closed. No new registrations are being accepted.
        </p>
        <Link to="/events" className="px-6 py-2 bg-gray-800 border border-gray-700 rounded text-white font-bold hover:bg-gray-700 transition">View Other Events</Link>
      </div>
    );
  }

  // Guard: DRAFT (Should not be accessible normally)
  if (event.status !== "LIVE") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <FaExclamationTriangle className="text-5xl text-yellow-500 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Event Not Live</h2>
        <p className="text-gray-400 mb-6">This event is not currently accepting public registrations.</p>
        <Link to="/" className="px-6 py-2 bg-indigo-600 rounded text-white font-bold hover:bg-indigo-700">Go Home</Link>
      </div>
    );
  }

  // Guard: Not Logged In
  if (!googleProfile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">You must sign in with Google to register for {event.name}.</p>
          <a href="/login" className="inline-block w-full py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition">
            Sign In with Google
          </a>
        </div>
      </div>
    );
  }

  // State: Already Registered (Redirecting...)
  // State: Already Registered (Show Details)
  if (serverRecord) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-8 relative">
          <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition text-sm"><FaArrowLeft /> Back to Events</Link>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Registration</h2>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${serverRecord.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
              serverRecord.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
              {serverRecord.status}
            </span>
          </div>

          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-sm text-gray-500 uppercase font-bold mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Full Name</p>
                  <p className="text-white font-medium">{serverRecord.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Batch</p>
                  <p className="text-white font-medium">{serverRecord.batch}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Mobile</p>
                  <p className="text-white font-medium">{serverRecord.contact}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white font-medium">{serverRecord.email || serverRecord.oauthEmail}</p>
                </div>
              </div>
            </div>

            {/* Family Info */}
            {serverRecord.familyMembers && serverRecord.familyMembers.length > 0 && (
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-sm text-gray-500 uppercase font-bold mb-4">Family Members</h3>
                <div className="space-y-3">
                  {serverRecord.familyMembers.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-white font-medium">{m.name}</span>
                      <span className="text-gray-400 bg-gray-900 px-2 py-1 rounded">{m.relation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h3 className="text-sm text-gray-500 uppercase font-bold mb-4">Payment</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs">Total Amount</p>
                  <p className="text-2xl font-bold text-green-400">₹{serverRecord.amount}</p>
                </div>
                {serverRecord.receiptUrl && (
                  <button
                    onClick={() => setViewReceipt(serverRecord.receiptUrl)}
                    className="text-indigo-400 text-sm hover:underline"
                  >
                    View Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {viewReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewReceipt(null)}>
            <div className="relative max-w-4xl max-h-[90vh] w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 p-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setViewReceipt(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-red-500/80 text-white rounded-full p-2 transition z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img src={viewReceipt} alt="Receipt" className="w-full h-full object-contain max-h-[85vh] rounded-xl" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // State: New Registration Form
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-6 md:p-10 relative">

        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-4 transition text-sm"><FaArrowLeft /> Back to Events</Link>
          <h1 className="text-3xl font-bold text-white">Register for <span className="text-indigo-500">{event.name}</span></h1>
          <p className="text-gray-400 mt-2 text-sm">Fill in your details to secure your spot.</p>
        </div>

        {/* Auto-Save Indicator */}
        {lastSaved && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg mb-4">
            <FaSave className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">Auto-saved at {lastSaved.toLocaleTimeString()}</span>
            <button
              onClick={() => {
                clearSaved();
                toast.info("Draft cleared");
              }}
              className="ml-auto text-xs text-green-300 hover:text-green-100 underline"
            >
              Clear Draft
            </button>
          </div>
        )}

        {/* User Info Badge */}
        <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl mb-6">
          <img src={googleProfile.picture} alt="Profile" className="w-10 h-10 rounded-full border border-indigo-500/30" />
          <div>
            <p className="text-white text-sm font-medium">Signed in as {googleProfile.name}</p>
            <p className="text-indigo-300 text-xs">{googleProfile.email}</p>
          </div>
          <button onClick={handleLogout} className="ml-auto text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded hover:bg-gray-700 transition">Change</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Full Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full bg-gray-950 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded p-3 text-white focus:border-indigo-500 outline-none transition`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Batch Year <span className="text-red-500">*</span></label>
              <input
                name="batch"
                placeholder="e.g. 2018"
                value={formData.batch}
                onChange={handleChange}
                required
                className={`w-full bg-gray-950 border ${errors.batch ? 'border-red-500' : 'border-gray-700'} rounded p-3 text-white focus:border-indigo-500 outline-none transition`}
              />
              {errors.batch && <p className="text-red-500 text-xs mt-1">{errors.batch}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Mobile Number <span className="text-red-500">*</span></label>
              <input
                name="contact"
                placeholder="10 digit number"
                value={formData.contact}
                onChange={handleChange}
                required
                className={`w-full bg-gray-950 border ${errors.contact ? 'border-red-500' : 'border-gray-700'} rounded p-3 text-white focus:border-indigo-500 outline-none transition`}
              />
              {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Email <span className="text-red-500">*</span></label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-gray-950 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded p-3 text-white focus:border-indigo-500 outline-none transition`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Family Section */}
          {event.familyAllowed && (
            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input type="checkbox" name="comingWithFamily" checked={formData.comingWithFamily} onChange={handleChange} className="w-5 h-5 accent-indigo-500 rounded" />
                <span className="text-white font-medium">I am bringing family members</span>
              </label>

              {formData.comingWithFamily && (
                <div className="space-y-4">
                  {formData.familyMembers.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-start animate-fade-in">
                      <div className="flex-1">
                        <input placeholder="Name" value={m.name} onChange={(e) => updateFamilyMember(idx, "name", e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white" />
                        {errors[`family_${idx}_name`] && <p className="text-red-500 text-xs">{errors[`family_${idx}_name`]}</p>}
                      </div>
                      <div className="w-1/3">
                        <select value={m.relation} onChange={(e) => updateFamilyMember(idx, "relation", e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-sm text-white">
                          <option value="">Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors[`family_${idx}_relation`] && <p className="text-red-500 text-xs">{errors[`family_${idx}_relation`]}</p>}
                      </div>
                      <button type="button" onClick={() => removeFamilyMember(idx)} className="text-red-400 p-2 hover:bg-red-900/20 rounded">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addFamilyMember} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">+ Add Member</button>
                </div>
              )}
            </div>
          )}

          {/* Payment Section */}
          {event.paid && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment Required</h3>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* QR Code */}
                <div className="bg-white p-2 rounded-xl w-32 h-32 flex-shrink-0">
                  {event.paymentQRUrl ? (
                    <img src={event.paymentQRUrl} alt="UPI QR" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center">No QR</div>
                  )}
                </div>

                {/* Amount & UPI */}
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">Total Amount to Pay</p>
                  <p className="text-3xl font-bold text-green-400 mb-4">₹{totalAmount.toLocaleString('en-IN')}</p>

                  <p className="text-xs text-gray-500 mt-2">Scan the QR code using any UPI app (GPay, PhonePe, Paytm).</p>
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Upload Payment Screenshot <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={isCompressing}
                  className={`w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer border ${errors.receiptFile ? 'border-red-500' : 'border-gray-700'} rounded-lg p-2 bg-gray-950 disabled:opacity-50`}
                />
                {errors.receiptFile && <p className="text-red-500 text-xs mt-1">{errors.receiptFile}</p>}

                {/* Compression Progress */}
                {isCompressing && (
                  <div className="mt-2 text-indigo-400 text-xs animate-pulse flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Compressing image...
                  </div>
                )}

                {/* Compression Info */}
                {compressionInfo && (
                  <div className="mt-2 text-xs text-gray-500">
                    Compressed: {compressionInfo.original} → {compressionInfo.compressed} ({compressionInfo.ratio}% smaller)
                  </div>
                )}

                {formData.receiptFile && (
                  <div className="mt-2">
                    <img src={URL.createObjectURL(formData.receiptFile)} alt="Preview" className="h-24 rounded border border-gray-600" />
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing Registration..." : "Confirm Registration"}
          </button>

        </form>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}