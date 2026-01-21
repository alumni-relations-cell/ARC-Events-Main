import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventLock } from "../context/EventLockContext";

export default function LockEntry() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { activateLock } = useEventLock();

    useEffect(() => {
        const verifyAndActivate = async () => {
            if (!token) {
                navigate("/", { replace: true });
                return;
            }

            // Activate lock (stores in sessionStorage)
            await activateLock(token);

            // Redirect immediately to home - lock state will persist
            navigate("/", { replace: true });
        };

        verifyAndActivate();
    }, [token, activateLock, navigate]);

    // Minimal loading to prevent black screen - matches site background
    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                width: "40px",
                height: "40px",
                border: "3px solid rgba(0,0,0,0.1)",
                borderTopColor: "#ca0002",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
