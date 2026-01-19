import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const EventLockContext = createContext();

const LOCK_STORAGE_KEY = "event_lock_data";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const EventLockProvider = ({ children }) => {
    const [lockState, setLockState] = useState(() => {
        // Lazy initialization - read from storage immediately on mount
        try {
            const stored = sessionStorage.getItem(LOCK_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    isLocked: true,
                    eventData: parsed.eventData,
                    token: parsed.token,
                    loading: false,
                };
            }
        } catch (err) {
            console.error("Failed to load lock from storage:", err);
        }
        // Default state
        return {
            isLocked: false,
            eventData: null,
            token: null,
            loading: false,
        };
    });

    // Removed useEffect for loading storage - handled in initialization

    // Activate lock by verifying token with backend
    const activateLock = useCallback(async (token) => {
        try {
            setLockState(prev => ({ ...prev, loading: true }));

            const url = `${API_BASE_URL}/api/locks/verify/${token}`;
            console.log("🔐 Activating lock with token:", token);
            console.log("🌐 API URL:", url);
            console.log("🌐 API_BASE_URL:", API_BASE_URL);

            const response = await axios.get(url);

            console.log("✅ Verification response:", response.data);

            if (response.data.success) {
                const lockData = {
                    eventData: response.data.event,
                    token: response.data.token,
                };

                // Store in sessionStorage
                sessionStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockData));

                setLockState({
                    isLocked: true,
                    eventData: response.data.event,
                    token: response.data.token,
                    loading: false,
                });

                console.log("✅ Lock activated successfully for event:", response.data.event.slug);
                return { success: true, event: response.data.event };
            } else {
                console.log("❌ Verification failed:", response.data.message);
                setLockState({
                    isLocked: false,
                    eventData: null,
                    token: null,
                    loading: false,
                });
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error("❌ Lock activation error:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            setLockState({
                isLocked: false,
                eventData: null,
                token: null,
                loading: false,
            });
            return {
                success: false,
                message: err.response?.data?.message || "Failed to verify lock token",
            };
        }
    }, []);

    // Clear lock state
    const clearLock = useCallback(() => {
        sessionStorage.removeItem(LOCK_STORAGE_KEY);
        setLockState({
            isLocked: false,
            eventData: null,
            token: null,
            loading: false,
        });
    }, []);

    // Check if a route is allowed in locked mode
    const isRouteAllowed = useCallback((path) => {
        if (!lockState.isLocked) return true;

        const lockedSlug = lockState.eventData?.slug;

        // Always allow these routes (even in locked mode)
        const alwaysAllowed = [
            "/",
            "/home",
            "/login",
            "/my-registrations",
            `/event/${lockedSlug}`,
        ];

        if (alwaysAllowed.some(allowed => path === allowed || path.startsWith(`${allowed}/`))) {
            return true;
        }

        // Special check for exact matches if needed, though startsWith covers most

        // Block these routes in locked mode
        const blockedRoutes = [
            "/events",
            "/eventFlow",
            "/memories",
            "/meetourteam",
        ];

        if (blockedRoutes.some(blocked => path === blocked)) {
            return false;
        }

        // Block access to other event slugs
        if (path.startsWith("/event/") && !path.startsWith(`/event/${lockedSlug}`)) {
            return false;
        }

        return true;
    }, [lockState.isLocked, lockState.eventData?.slug]);

    const value = useMemo(() => ({
        isLocked: lockState.isLocked,
        eventData: lockState.eventData,
        token: lockState.token,
        loading: lockState.loading,
        activateLock,
        clearLock,
        isRouteAllowed,
    }), [lockState, activateLock, clearLock, isRouteAllowed]);

    return (
        <EventLockContext.Provider value={value}>
            {children}
        </EventLockContext.Provider>
    );
};

export const useEventLock = () => {
    const context = useContext(EventLockContext);
    if (context === undefined) {
        throw new Error("useEventLock must be used within an EventLockProvider");
    }
    return context;
};
