import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEventLock } from "../context/EventLockContext";

/* -------- Base pages -------- */
const basePages = [
  { name: "Home", path: "" },
  { name: "Memories", path: "memories" },
  { name: "Events", path: "events" },
  { name: "My Registrations", path: "my-registrations" },
];

/* Read user from localStorage */
function getAuthUser() {
  try {
    const raw = localStorage.getItem("app_auth");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export default function ResponsiveAppBar() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const { eventSlug } = useParams();
  const isEventMode = Boolean(eventSlug);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState(() => getAuthUser());
  const scrollYRef = React.useRef(0);

  const toggleMobileMenu = () => setMobileOpen((s) => !s);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "app_auth") setUser(getAuthUser());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    setUser(getAuthUser());
  }, [location.pathname]);

  // Scroll lock for mobile menu
  React.useEffect(() => {
    if (mobileOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
    } else {
      const saved = scrollYRef.current;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      window.scrollTo(0, saved);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [mobileOpen]);

  const firstName = user?.name ? user.name.split(" ")[0] : null;
  const greeting = user ? `Welcome ${firstName}` : "Welcome User";
  const avatarSrc = user?.picture || "";
  const showDefaultIcon = !avatarSrc;
  const appBarHeight = 64;

  const { isLocked, eventData } = useEventLock();

  /* Build pages dynamically based on lock state */
  const pages = React.useMemo(() => {
    // In locked mode, show event-specific navigation
    if (isLocked && eventData?.slug) {
      const lockedEventSlug = eventData.slug;
      return [
        { name: "Home", path: "/" },
        { name: "Memories", path: `/event/${lockedEventSlug}/memories` },
        { name: "Timeline", path: `/event/${lockedEventSlug}/flow` },
        { name: "Register", path: `/event/${lockedEventSlug}/register` },
      ];
    }

    // Normal mode - existing logic
    return basePages.map((p) => {
      if (p.path === "my-registrations" || p.path === "events") {
        return { ...p, path: `/${p.path}` };
      }

      if (isEventMode) {
        return { ...p, path: `/event/${eventSlug}/${p.path}`.replace(/\/$/, "") };
      }

      return { ...p, path: `/${p.path}` };
    });
  }, [isEventMode, eventSlug, isLocked, eventData]);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "10px 30px 40px #ca0002)",
          zIndex: theme.zIndex.appBar,
          borderBottom: "4px solid #ca0002 ",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between", minHeight: 80 }}>

            {/* LEFT: LOGOS */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
              {/* TI Logo - Placeholder as requested */}
              <img
                src="/assets/ti-logo.png"
                alt="TI Logo"
                style={{ height: 50, display: "block" }}
              />

              {/* ARC / TSLAS Logo */}
              <img
                src="/assets/arc-logo.png"
                alt="ARC Logo"
                style={{ height: 55, display: "block" }}
              />
            </Box>

            {/* RIGHT: NAVIGATION & USER */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>

              {/* Desktop Menu */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
                {pages.map((page) => (
                  <Link key={page.name} to={page.path} style={{ textDecoration: "none" }}>
                    <Typography
                      sx={{
                        color: "#333",
                        fontFamily: "sans-serif",
                        fontWeight: location.pathname === page.path ? 700 : 500,
                        fontSize: "0.85rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        cursor: "pointer",
                        "&:hover": { color: "#E85427" }, // Orange hover from logo
                        ...(location.pathname === page.path && { color: "#E85427" })
                      }}
                    >
                      {page.name}
                    </Typography>
                  </Link>
                ))}
              </Box>

              {/* User Greeting (Styled for White BG) */}
              <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 3, pl: 2, borderLeft: "1px solid #eee" }}>
                {user ? (
                  <>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#333" }}>
                        Welcome, {firstName}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => {
                        localStorage.removeItem("app_auth");
                        setUser(null);
                        window.dispatchEvent(new Event("storage"));
                      }}
                      size="small"
                      sx={{ color: "#d32f2f" }}
                    >
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#333", textTransform: "uppercase" }}>
                      Login
                    </Typography>
                  </Link>
                )}
              </Box>

              {/* Mobile Menu Icon */}
              <IconButton
                onClick={toggleMobileMenu}
                aria-expanded={mobileOpen}
                aria-label="open mobile menu"
                sx={{ display: { xs: "flex", md: "none" }, color: "#333" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu */}
      <Paper
        elevation={4}
        square
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          height: "auto",
          maxHeight: "360px",
          zIndex: theme.zIndex.appBar - 1,
          backgroundColor: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(8px)",
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          alignItems: "center",
          px: 2,
          pt: `100x`, // To clear the taller navbar
          pb: 4,
          gap: 2,
          transform: mobileOpen ? "translateY(0)" : "translateY(-100%)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "transform 280ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease",
          overflowY: "auto",
          borderBottom: "1px solid #ddd",
        }}
      >
        {pages.map((page) => (
          <Link
            key={page.name}
            to={page.path}
            style={{ textDecoration: "none", width: "100%", textAlign: "center" }}
            onClick={() => setMobileOpen(false)}
          >
            <Typography
              sx={{
                color: location.pathname === page.path ? "#E85427" : "#333",
                fontFamily: "sans-serif",
                fontWeight: location.pathname === page.path ? 700 : 500,
                textTransform: "uppercase",
                py: 1.5,
                borderBottom: "1px solid #f0f0f0",
                "&:hover": { color: "#E85427" },
              }}
            >
              {page.name}
            </Typography>
          </Link>
        ))}

        {/* Mobile User Actions */}
        {user ? (
          <Button
            onClick={() => {
              localStorage.removeItem("app_auth");
              setUser(null);
              window.dispatchEvent(new Event("storage"));
              setMobileOpen(false);
            }}
            sx={{ color: "#d32f2f", mt: 2 }}
          >
            LOGOUT ({firstName})
          </Button>
        ) : (
          <Link to="/login" onClick={() => setMobileOpen(false)} style={{ textDecoration: "none", marginTop: 16 }}>
            <Button variant="outlined" sx={{ color: "#333", borderColor: "#333" }}>
              LOGIN
            </Button>
          </Link>
        )}
      </Paper>
    </>
  );
}
