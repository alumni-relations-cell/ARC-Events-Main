// src/pages/auth/Login.jsx
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { apiUser } from "../../lib/apiUser";
import { useMemo } from "react";

function LoginInner() {
  const navigate = useNavigate();

  const handleAuthResponse = async (credential) => {
    try {
      const { data } = await apiUser.post("/api/auth/google", { id_token: credential });
      // data = { token, user: { name, email, picture, ... } }
      localStorage.setItem("app_auth", JSON.stringify(data));
      navigate("/register", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Google sign-in failed");
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-[900px] min-h-[500px] md:h-[500px] bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden">

        {/* Left Side: Login Content */}
        <div className="w-full md:w-1/2 p-10 sm:p-14 flex flex-col justify-center order-2 md:order-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-500 mb-10">
            Please login with your google account to continue.
          </p>

          {!clientId ? (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              Missing VITE_GOOGLE_CLIENT_ID in .env
            </div>
          ) : (
            <div className="w-full">
              {/* Google Login Wrapper to customize width/size if possible, or just standard */}
              <div className="flex justify-start">
                <GoogleLogin
                  onSuccess={(resp) => handleAuthResponse(resp.credential)}
                  onError={() => alert("Google sign-in failed")}
                  useOneTap
                  size="large"
                  theme="outline"
                  width="300"
                  logo_alignment="left"
                  shape="rectangular"
                />
              </div>
            </div>
          )}

          <div className="mt-8 text-xs text-gray-400">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="w-full md:w-1/2 h-48 md:h-auto relative bg-gray-100 order-1 md:order-2">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
            alt="Thapar Campus"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Optional Overlay to match image tone if needed, but clean image is usually better */}
        </div>

      </div>
    </div>
  );
}

export default function Login() {
  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID, []);
  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <LoginInner />
    </GoogleOAuthProvider>
  );
}
