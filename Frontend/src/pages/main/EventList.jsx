import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUser } from "../../lib/apiUser";
import { FaCalendarAlt, FaTicketAlt, FaClock, FaImages, FaArrowRight } from "react-icons/fa";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only LIVE and visible events
    apiUser.get("/api/events/ongoing")
      .then(res => {
        const data = res.data;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to fetch events", err);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#ca0002] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#ca0002] font-medium animate-pulse">Loading ARC Events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12 pt-24 relative overflow-hidden">

      {/* Background Ambience - Light & Subtle */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gray-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-serif text-gray-900">
            ARC <span className="text-[#8B0000]">Events</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join us for our upcoming alumni gatherings, celebrations, and reunions.
            Connect, celebrate, and create new memories.
          </p>
        </div>

        {/* Empty State */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[24px] border border-gray-200 border-dashed shadow-sm">
            <FaCalendarAlt className="text-6xl text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-400">No events found</h3>
            <p className="text-gray-500 mt-2">Check back later for upcoming gatherings.</p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(ev => (
              <div
                key={ev._id}
                className="group flex flex-col bg-white rounded-[24px] overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                {/* Poster Image */}
                <div className="h-64 bg-gray-100 relative overflow-hidden">
                  {ev.posterUrl ? (
                    <img
                      src={ev.posterUrl}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                      <FaCalendarAlt className="text-5xl opacity-50" />
                    </div>
                  )}

                  {/* Wrapper Gradient (Subtle) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border shadow-sm ${ev.status === 'LIVE' ? 'bg-white/90 border-white text-green-700' :
                    ev.status === 'PAUSED' ? 'bg-white/90 border-white text-orange-600' :
                      'bg-white/90 border-white text-red-600'
                    }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${ev.status === 'LIVE' ? 'bg-green-500' :
                      ev.status === 'PAUSED' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}></div>
                    <span className="text-xs font-bold tracking-wide uppercase">
                      {ev.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#ca0002] transition-colors font-serif">
                      {ev.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">
                      {ev.description || "Join us for this special occasion. Click details to learn more."}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    {/* Primary Action: Register */}
                    <Link
                      to={`/event/${ev.slug}/register`}
                      className="flex items-center justify-center gap-2 w-full bg-[#ca0002] hover:bg-[#a00002] text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <FaTicketAlt /> Register Now
                    </Link>

                    {/* Secondary Actions: Flow & Memories */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/event/${ev.slug}/flow`}
                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#ca0002] py-3 rounded-xl text-sm font-bold transition border border-gray-100 hover:border-gray-200"
                      >
                        <FaClock size={14} /> Timeline
                      </Link>
                      <Link
                        to={`/event/${ev.slug}/memories`}
                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#ca0002] py-3 rounded-xl text-sm font-bold transition border border-gray-100 hover:border-gray-200"
                      >
                        <FaImages size={14} /> Gallery
                      </Link>
                    </div>
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