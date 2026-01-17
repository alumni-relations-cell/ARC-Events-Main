import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";

/* ---------- Main Website Pages ---------- */
import Home from "./pages/main/home";                  // ORIGINAL Home Page
import EventList from "./pages/main/EventList";        // New Event Directory (Optional)
import Registration from "./pages/main/registeration"; // New Registration Form
import EventFlow from "./pages/main/EventFlowpage.jsx";     
import PhotoGallery from "./pages/main/memories";      // Memories (Handles both Directory & Specific)
import UserLogin from "./pages/main/userlogin";
import Meetourteam from "./pages/main/meetourteam";
import MyRegistrations from "./pages/main/MyRegistrations";

/* ---------- Layouts ---------- */
import ResponsiveAppBar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";

/* ---------- Auth Guards ---------- */
import UserProtectedRoute from "./components/UserProtectedRoutes";
import AdminProtectedRoute from "./components/ProtectedRoute.jsx";
import { AdminEventProvider } from "./context/AdminEventContext";

/* ---------- Admin Pages ---------- */
import Login from "./pages/Admin/Login.jsx";
import Dashboard from "./pages/Admin/Dashboard.jsx";
import HomeManager from "./pages/Admin/HomeManager.jsx";
import AdminMemories from "./pages/Admin/AdminMemories.jsx";
import AdminRegistrations from "./pages/Admin/Adminregisterations";
import AdminEvents from "./pages/Admin/AdminEvents";
import AdminControllers from "./pages/Admin/AdminControllers";
import AdminSidebar from "./components/AdminSidebar.jsx";

/* ---------- Event Controller ---------- */
import EventControllerDashboard from "./pages/EventController/Dashboard";
import ControllerLogin from "./pages/EventController/Login";
import ControllerSignup from "./pages/EventController/Signup";
import ControllerEventDetails from "./pages/EventController/EventDetails";


/* =========================================
   ADMIN LAYOUT WRAPPER
   ========================================= */
function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 bg-gray-950 text-white min-h-screen overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();

  // Hide navbar and footer on admin and controller routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isControllerRoute = location.pathname.startsWith('/controller');
  const hideNavAndFooter = isAdminRoute || isControllerRoute;

  return (
    <>
      {!hideNavAndFooter && <ResponsiveAppBar />}

      <Routes>

        {/* =========================================
            1. PUBLIC USER ROUTES
           ========================================= */}

        {/* 1. ORIGINAL HOME PAGE (Restored) */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* 2. EVENT DIRECTORY (The new list view) */}
        <Route path="/events" element={<EventList />} />

        {/* 3. STATIC PAGES */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/meetourteam" element={<Meetourteam />} />

        {/* 4. TIMELINE (Two Modes) */}
        <Route path="/eventFlow" element={<EventFlow/>} />             {/* Navbar Link -> Directory */}
        <Route path="/event/:eventSlug/flow" element={<EventFlow />} /> {/* Specific Event */}

        {/* 5. MEMORIES (Two Modes) */}
        <Route path="/memories" element={<PhotoGallery />} />               {/* Navbar Link -> Directory */}
        <Route path="/events/memories" element={<PhotoGallery />} />        {/* Directory Alias */}
        <Route path="/event/:eventSlug/memories" element={<PhotoGallery />} /> {/* Specific Event */}

        {/* 6. REGISTRATION (Protected) */}
        <Route
          path="/event/:eventSlug/register"
          element={
            <UserProtectedRoute>
              <Registration />
            </UserProtectedRoute>
          }
        />
        {/* Legacy redirect: Send /register to the events list so user can pick an event */}
        <Route path="/register" element={<Navigate to="/events" replace />} />

        {/* 7. MY REGISTRATIONS (New Dashboard) */}
        <Route
          path="/my-registrations"
          element={
            <UserProtectedRoute>
              <MyRegistrations />
            </UserProtectedRoute>
          }
        />


        {/* =========================================
            2. ADMIN ROUTES
           ========================================= */}
        <Route path="/admin/login" element={<Login />} />

        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <AdminEventProvider>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="registrations" element={<AdminRegistrations />} />
                    <Route path="memories" element={<AdminMemories />} />
                    {/* <Route path="rooms" element={<AdminRooms />} /> REMOVED */}
                    <Route path="controllers" element={<AdminControllers />} />
                    <Route path="home" element={<HomeManager />} />
                    {/* Fallback for admin */}
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminEventProvider>
            </AdminProtectedRoute>
          }
        />

        {/* 3. EVENT CONTROLLER (STAFF) */}
        <Route path="/controller/login" element={<ControllerLogin />} />
        <Route path="/controller/signup" element={<ControllerSignup />} />
        <Route path="/controller/dashboard" element={<EventControllerDashboard />} />
        <Route path="/controller/events/:eventId" element={<ControllerEventDetails />} />

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {!hideNavAndFooter && <Footer />}
    </>
  );
}

export default App;