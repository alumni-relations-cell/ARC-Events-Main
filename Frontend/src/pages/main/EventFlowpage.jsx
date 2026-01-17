import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUser } from "../../lib/apiUser";
import { ArrowLeft, Calendar, Clock, AlertCircle } from "lucide-react";

/* =========================================
   1. SNOW OVERLAY (Visuals)
   ========================================= */
function SnowOverlay({ density = 140 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const count = Math.min(density, 150);
    particlesRef.current = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      r: 0.8 + Math.random() * 2.2,
      spdY: 0.35 + Math.random() * 0.9,
      spdX: -0.3 + Math.random() * 0.6,
      sway: Math.random() * 2 * Math.PI,
      swayAmp: 0.6 + Math.random() * 1.0,
      alpha: 0.65 + Math.random() * 0.35,
    }));

    const ctx = canvas.getContext("2d");
    const step = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        p.sway += 0.01;
        p.y += p.spdY;
        p.x += p.spdX + Math.sin(p.sway) * p.swayAmp * 0.2;
        if (p.y > height) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(step);
    };

    resize();
    rafRef.current = requestAnimationFrame(step);
    window.addEventListener("resize", resize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 w-full h-full opacity-60 z-0" />;
}

/* =========================================
   2. TIMELINE VIEW (Specific Event)
   ========================================= */
const TimelineView = ({ eventData, onBack }) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const flowData = eventData?.flow || [];

  // Scroll Spy Logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container || flowData.length === 0) return;

    const handleScroll = () => {
      const containerCenter = container.scrollTop + container.clientHeight / 2;
      const children = container.children;
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childCenter = child.offsetTop + child.clientHeight / 2;
        const distance = Math.abs(childCenter - containerCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      setActiveIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 100);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [flowData]);

  return (
    <div className="relative h-screen overflow-hidden bg-gray-950">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <SnowOverlay density={120} />

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 pt-24 bg-gradient-to-b from-gray-900 via-gray-900/90 to-transparent flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition border border-white/10 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white shadow-black drop-shadow-lg">
            {eventData.name}
          </h1>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-widest mt-1">
            <Clock size={14} /> Official Timeline
          </div>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="relative z-10 h-full overflow-y-auto pt-48 pb-32 px-4 space-y-32 scroll-smooth no-scrollbar snap-y snap-mandatory"
      >
        {flowData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p className="text-xl">Timeline details coming soon.</p>
          </div>
        ) : (
          flowData.map((item, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={i}
                className={`snap-center max-w-2xl mx-auto transition-all duration-700 ease-out 
                  ${isActive ? "opacity-100 scale-100" : "opacity-30 scale-90 blur-[2px]"}`}
              >
                <div
                  className={`relative p-8 rounded-2xl border-l-4 backdrop-blur-xl transition-all duration-500
                    ${isActive
                      ? "bg-gray-800/80 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
                      : "bg-gray-900/40 border-gray-700"
                    }`}
                >
                  <div className="flex gap-5">
                    {/* Icon Column */}
                    <div
                      className={`mt-1 p-3 rounded-xl h-fit shrink-0 transition-colors duration-500
                        ${isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-gray-800 text-gray-600"}`}
                    >
                      <Clock size={24} />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h3
                          className={`text-xl font-bold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-400"
                            }`}
                        >
                          {item.title}
                        </h3>
                        <span
                          className={`text-xs font-mono px-2 py-1 rounded w-fit border whitespace-nowrap
                            ${isActive
                              ? "bg-cyan-900/30 text-cyan-200 border-cyan-500/30"
                              : "bg-black/40 text-gray-500 border-white/5"
                            }`}
                        >
                          {item.date}
                        </span>
                      </div>
                      <p
                        className={`leading-relaxed text-base transition-colors duration-300 ${isActive ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        {item.desc || "Details to be announced."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

/* =========================================
   3. MAIN CONTROLLER (Handles Routing)
   ========================================= */
export default function EventFlow() {
  const { eventSlug } = useParams();
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Directory (If no slug)
  useEffect(() => {
    if (!eventSlug) {
      setLoading(true);
      setError(null);
      apiUser
        .get("/api/events/ongoing")
        .then((res) => {
          const data = res.data;
          setEventsList(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load events directory.");
          setEventsList([]);
        })
        .finally(() => setLoading(false));
    }
  }, [eventSlug]);

  // 2. Fetch Specific Flow (If Slug exists)
  useEffect(() => {
    if (eventSlug) {
      setLoading(true);
      setError(null);

      // Note: Make sure this endpoint exists in your backend! 
      // It should return { name: "...", flow: [...] }
      apiUser
        .get(`/api/events/${eventSlug}/flow`) // <--- Ensure backend has this route
        .then((res) => {
          if (!res.data) throw new Error("No data returned");
          setSelectedEvent(res.data);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          setError("Could not load timeline for this event.");
          // REMOVED THE AUTOMATIC REDIRECT HERE TO PREVENT LOOPS
        })
        .finally(() => setLoading(false));
    } else {
      setSelectedEvent(null);
    }
  }, [eventSlug]);

  // Handler for navigation
  const handleSelectEvent = (ev) => {
    if (ev && ev.slug) {
      navigate(`/event/${ev.slug}/flow`);
    } else {
      console.error("Event missing slug:", ev);
    }
  };

  // Handler for going back to list
  const handleBack = () => navigate("/events");

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-cyan-400 font-bold animate-pulse">Loading Timeline...</div>
      </div>
    );
  }

  // --- ERROR STATE (Prevents Loops) ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Something went wrong</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
        >
          Back to Events List
        </button>
      </div>
    );
  }

  // --- TIMELINE VIEW ---
  if (eventSlug && selectedEvent) {
    return <TimelineView eventData={selectedEvent} onBack={handleBack} />;
  }

  // --- DIRECTORY VIEW ---
  return (
    <div className="min-h-screen bg-gray-950 p-6 md:p-12 pt-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Event Schedules</h1>
        <p className="text-gray-400 mb-12 max-w-2xl text-lg">
          Select an event to view its detailed timeline and itinerary.
        </p>

        {eventsList.length === 0 ? (
          <div className="p-16 text-center border border-gray-800 border-dashed rounded-2xl bg-gray-900/50">
            <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsList.map((ev) => (
              <div
                key={ev._id}
                onClick={() => handleSelectEvent(ev)}
                className="group relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden cursor-pointer hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
              >
                <div className="h-56 bg-gray-800 relative overflow-hidden">
                  {ev.posterUrl ? (
                    <img
                      src={ev.posterUrl}
                      alt={ev.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="text-gray-700 w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />

                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={12} /> View Timeline
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}