import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAdminEvent } from "../context/AdminEventContext";
import { FaBars, FaTimes, FaHome, FaCalendar, FaUsers, FaImages, FaUserShield, FaSignOutAlt, FaLink } from "react-icons/fa";

export default function AdminSidebar() {
  const { events, activeEvent, setActiveEvent } = useAdminEvent();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Show hint on first mobile visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('admin_mobile_hint_seen');
    if (!hasSeenHint && window.innerWidth < 1024) {
      setShowHint(true);
      setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('admin_mobile_hint_seen', 'true');
      }, 4000);
    }
  }, []);

  const link = ({ isActive }) =>
    isActive
      ? "bg-indigo-600 p-3 rounded-lg flex items-center gap-3 transition-all"
      : "p-3 rounded-lg hover:bg-gray-800 flex items-center gap-3 transition-all";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Hamburger Button - Prominent and Always Visible */}
      <button
        onClick={() => {
          setIsMobileMenuOpen(!isMobileMenuOpen);
          setShowHint(false);
        }}
        className="lg:hidden fixed top-4 left-4 z-[9999] bg-indigo-600 text-white p-4 rounded-xl shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
        aria-label="Toggle menu"
        style={{ width: '56px', height: '56px' }}
      >
        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Hint Tooltip - First Visit Only */}
      {showHint && (
        <div className="lg:hidden fixed top-20 left-4 z-[9999] bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-xl animate-bounce max-w-xs">
          <p className="text-sm font-medium">👈 Tap here to access navigation menu</p>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[45] backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[50]
          w-72 bg-gray-900 text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ARC Admin
            </h2>
            {/* Logout button for desktop/mobile in header */}
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 p-2 transition-colors flex items-center gap-2"
              title="Logout"
            >
              <FaSignOutAlt size={20} />
            </button>

            {/* Close button for mobile */}
            <button
              onClick={closeMobileMenu}
              className="lg:hidden text-gray-400 hover:text-white p-2 transition-colors"
              aria-label="Close menu"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Event Selector */}
        <div className="p-4 border-b border-gray-800">
          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
            Active Event
          </label>
          <select
            value={activeEvent?._id || ""}
            onChange={(e) => {
              setActiveEvent(events.find(ev => ev._id === e.target.value));
              closeMobileMenu();
            }}
            className="w-full bg-gray-800 p-3 rounded-lg text-white border border-gray-700 focus:border-indigo-500 focus:outline-none transition-all"
          >
            {events.map(ev => (
              <option key={ev._id} value={ev._id}>{ev.name}</option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1 p-4 overflow-y-auto">
          <NavLink
            to="/admin/dashboard"
            className={link}
            onClick={closeMobileMenu}
          >
            <FaHome size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/events"
            className={link}
            onClick={closeMobileMenu}
          >
            <FaCalendar size={18} />
            <span>Events</span>
          </NavLink>

          <NavLink
            to="/admin/registrations"
            className={link}
            onClick={closeMobileMenu}
          >
            <FaUsers size={18} />
            <span>Registrations</span>
          </NavLink>

          <NavLink
            to="/admin/memories"
            className={link}
            onClick={closeMobileMenu}
          >
            <FaImages size={18} />
            <span>Photos</span>
          </NavLink>

          <NavLink
            to="/admin/controllers"
            className={link}
            onClick={closeMobileMenu}
          >
            <FaUserShield size={18} />
            <span>Controllers</span>
          </NavLink>



          <NavLink
            to="/admin/locks"
            className={link}
            onClick={closeMobileMenu}
          >
            <FaLink size={18} />
            <span>Event Locks</span>
          </NavLink>
        </nav>


      </aside>
    </>
  );
}
