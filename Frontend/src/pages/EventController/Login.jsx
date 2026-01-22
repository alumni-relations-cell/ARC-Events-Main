import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiController } from "../../lib/apiController";
import { ArrowRight, Lock, User } from "lucide-react";

export default function ControllerLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const res = await apiController.post("/api/controller/auth/login", {
                username,
                password
            });

            const data = res.data;

            // Save token
            localStorage.setItem("controllerToken", data.token);
            localStorage.setItem("controllerUser", data.username);

            navigate("/controller/dashboard");
        } catch (error) {
            setErr(error.response?.data?.message || error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
            {/* Main Card */}
            <div className="w-full max-w-[900px] min-h-[500px] md:h-[500px] bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                
                {/* Left Side: Login Content */}
                <div className="w-full md:w-1/2 p-10 sm:p-14 flex flex-col justify-center order-2 md:order-1 relative">
                    <div className="w-full">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Controller Portal
                        </h1>
                        <p className="text-sm text-gray-500 mb-8">
                            Sign in to manage your events
                        </p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {err && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                                    {err}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400"
                                        placeholder="Enter your username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#ca0002] hover:bg-[#8B000] text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-4"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-xs text-gray-500">
                            Don't have an account?{" "}
                            <Link to="/controller/signup" className="text-[#ca0002] font-semibold hover:underline">
                                Register here
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="w-full md:w-1/2 h-48 md:h-auto relative bg-gray-100 order-1 md:order-2">
                    <img
                        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                        alt="Campus"
                        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.9]"
                    />
                    <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
                </div>

            </div>
        </div>
    );
}