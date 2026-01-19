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
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Loading ARC Events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12 pt-24 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              ARC Events
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join us for our upcoming alumni gatherings, celebrations, and reunions.
            Connect, celebrate, and create new memories.
          </p>
        </div>

        {/* Empty State */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed backdrop-blur-sm">
            <FaCalendarAlt className="text-6xl text-gray-700 mb-6" />
            <h3 className="text-2xl font-bold text-gray-300">No events found</h3>
            <p className="text-gray-500 mt-2">Check back later for upcoming gatherings.</p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(ev => (
              <div
                key={ev._id}
                className="group flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                {/* Poster Image */}
                <div className="h-56 bg-gray-800 relative overflow-hidden">
                  {ev.posterUrl ? (
                    <img
                      src={ev.posterUrl}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-700">
                      <FaCalendarAlt className="text-5xl opacity-50" />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>

                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border ${ev.status === 'LIVE' ? 'bg-green-500/10 border-green-500/20' :
                    ev.status === 'PAUSED' ? 'bg-orange-500/10 border-orange-500/20' :
                      'bg-red-500/10 border-red-500/20'
                    }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${ev.status === 'LIVE' ? 'bg-green-500' :
                      ev.status === 'PAUSED' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}></div>
                    <span className={`text-xs font-bold tracking-wide uppercase ${ev.status === 'LIVE' ? 'text-green-400' :
                      ev.status === 'PAUSED' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                      {ev.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {ev.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {ev.description || "Join us for this special occasion. Click details to learn more."}
                    </p>
                  </div>

                  <div className="mt-auto space-y-4">
                    {/* Primary Action: Register */}
                    <Link
                      to={`/event/${ev.slug}/register`}
                      className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-600/25 active:scale-95"
                    >
                      <FaTicketAlt /> Register Now
                    </Link>

                    {/* Secondary Actions: Flow & Memories */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/event/${ev.slug}/flow`}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition border border-gray-700 hover:border-gray-600"
                      >
                        <FaClock size={14} /> Timeline
                      </Link>
                      <Link
                        to={`/event/${ev.slug}/memories`}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition border border-gray-700 hover:border-gray-600"
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