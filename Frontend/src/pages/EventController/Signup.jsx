import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, User, CheckCircle, Calendar } from "lucide-react";
import { apiController } from "../../lib/apiController";

export default function ControllerSignup() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        requestedEvent: ""
    });
    const [err, setErr] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        apiController.get("/api/events/ongoing")
            .then(res => setEvents(Array.isArray(res.data) ? res.data : []))
            .catch(() => setEvents([]));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setErr("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            return setErr("Passwords do not match");
        }

        setLoading(true);

        try {
            await apiController.post("/api/controller/auth/signup", {
                username: formData.username,
                password: formData.password,
                requestedEvent: formData.requestedEvent
            });

            setSuccess("Account created! Request sent to admin.");
            setTimeout(() => navigate("/controller/login"), 3000);

        } catch (error) {
            setErr(error.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
                <div className="w-full max-w-[900px] min-h-[500px] bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center text-center order-2 md:order-1">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful</h2>
                        <p className="text-gray-500 mb-8">{success}</p>
                        <Link to="/controller/login" className="text-indigo-600 font-bold hover:underline">
                            Go to Login
                        </Link>
                    </div>
                    <div className="w-full md:w-1/2 h-48 md:h-auto relative bg-gray-100 order-1 md:order-2">
                        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
            {/* Main Card */}
            <div className="w-full max-w-[900px] md:min-h-[500px] bg-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden">

                {/* Left Side: Signup Content */}
                <div className="w-full md:w-1/2 p-10 sm:p-12 flex flex-col justify-center order-2 md:order-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Controller Registration
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Create an account to manage events
                    </p>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {err && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
                                {err}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Confirm</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition placeholder-gray-400"
                                        placeholder="Confirm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Event (Optional)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <select
                                    name="requestedEvent"
                                    value={formData.requestedEvent || ""}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
                                >
                                    <option value="">-- I don't know yet --</option>
                                    {events.map(ev => (
                                        <option key={ev._id} value={ev._id}>{ev.name}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Which event will you manage?</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ca0002] hover:bg-[#8B0000] text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-md hover:shadow-lg mt-4"
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Already have an account?{" "}
                        <Link to="/controller/login" className="text-[#ca0002] font-semibold hover:underline">
                            Login here
                        </Link>
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