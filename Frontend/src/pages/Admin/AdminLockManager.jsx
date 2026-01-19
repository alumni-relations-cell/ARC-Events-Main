import React, { useState, useEffect } from "react";
import { apiAdmin } from "../../lib/apiAdmin";
import { useAdminEvent } from "../../context/AdminEventContext";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import {
    ContentCopy,
    Delete,
    Link as LinkIcon,
    CheckCircle,
    Cancel,
    AccessTime,
} from "@mui/icons-material";

export default function AdminLockManager() {
    const { events, loading: eventsLoading } = useAdminEvent();
    const [locks, setLocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Form state
    const [selectedEventId, setSelectedEventId] = useState("");


    // UI state
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [generatedUrl, setGeneratedUrl] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Fetch locks
    const fetchLocks = async () => {
        try {
            const res = await apiAdmin.get("/api/locks");
            setLocks(res.data || []);
        } catch (err) {
            console.error("Failed to fetch locks:", err);
            showSnackbar("Failed to load locks", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocks();
    }, []);

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleGenerate = async () => {
        if (!selectedEventId) {
            showSnackbar("Please select an event", "error");
            return;
        }

        setGenerating(true);
        try {
            const res = await apiAdmin.post("/api/locks/generate", {
                eventId: selectedEventId,
                eventId: selectedEventId,
                // expiresInDays: parseInt(expiresInDays) || 30, // Default to 30 on backend if needed, or remove
                // maxUsage: maxUsage ? parseInt(maxUsage) : null,
            });

            if (res.data.success) {
                setGeneratedUrl(res.data.url);
                showSnackbar("Lock link generated successfully!");
                fetchLocks(); // Refresh list

                // Reset form
                setSelectedEventId("");
                setSelectedEventId("");
                // setExpiresInDays("30");
                // setMaxUsage("");
            }
        } catch (err) {
            console.error("Failed to generate lock:", err);
            showSnackbar(err.response?.data?.message || "Failed to generate lock", "error");
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (url) => {
        navigator.clipboard.writeText(url);
        showSnackbar("Link copied to clipboard!");
    };

    const handleRevoke = async (lockId) => {
        try {
            await apiAdmin.delete(`/api/locks/${lockId}`);
            showSnackbar("Lock revoked successfully!");
            fetchLocks(); // Refresh list
            setConfirmDelete(null);
        } catch (err) {
            console.error("Failed to revoke lock:", err);
            showSnackbar("Failed to revoke lock", "error");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading || eventsLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "white" }}>
                Event Lock Links
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
                Lock links transform the entire platform into a single-event microsite. Users accessing via lock links
                will only see and interact with the locked event.
            </Alert>

            {/* Generation Form */}
            <Card sx={{ mb: 4, bgcolor: "grey.900", color: "white" }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Generate New Lock Link
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: "grey.400" }}>Select Event</InputLabel>
                            <Select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                label="Select Event"
                                sx={{ bgcolor: "grey.800", color: "white" }}
                            >
                                {events.map((event) => (
                                    <MenuItem key={event._id} value={event._id}>
                                        {event.name} ({event.slug})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>



                        <Button
                            variant="contained"
                            onClick={handleGenerate}
                            disabled={generating}
                            startIcon={<LinkIcon />}
                            sx={{
                                bgcolor: "primary.main",
                                "&:hover": { bgcolor: "primary.dark" },
                                py: 1.5,
                            }}
                        >
                            {generating ? "Generating..." : "Generate Lock Link"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Generated URL Display */}
            {generatedUrl && (
                <Alert
                    severity="success"
                    action={
                        <Button color="inherit" size="small" onClick={() => setGeneratedUrl(null)}>
                            DISMISS
                        </Button>
                    }
                    sx={{ mb: 4 }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Lock Link Generated Successfully!
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                bgcolor: "rgba(0,0,0,0.2)",
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                flex: 1,
                            }}
                        >
                            {generatedUrl}
                        </Typography>
                        <IconButton size="small" onClick={() => handleCopy(generatedUrl)}>
                            <ContentCopy fontSize="small" />
                        </IconButton>
                    </Box>
                </Alert>
            )}

            {/* Active Locks Table */}
            <Card sx={{ bgcolor: "grey.900" }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "white" }}>
                        Active Lock Links ({locks.length})
                    </Typography>

                    <TableContainer component={Paper} sx={{ bgcolor: "grey.800" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: "grey.400", fontWeight: 600 }}>Event</TableCell>
                                    <TableCell sx={{ color: "grey.400", fontWeight: 600 }}>Created</TableCell>
                                    <TableCell sx={{ color: "grey.400", fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ color: "grey.400", fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {locks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ color: "grey.500", py: 4 }}>
                                            No lock links created yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    locks.map((lock) => (
                                        <TableRow key={lock.id}>
                                            <TableCell sx={{ color: "white" }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {lock.eventName}
                                                </Typography>
                                                <Typography variant="caption" color="grey.500">
                                                    /{lock.eventSlug}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: "grey.400", fontSize: "0.85rem" }}>
                                                {formatDate(lock.createdAt)}
                                            </TableCell>

                                            <TableCell>
                                                {lock.isValid ? (
                                                    <Chip
                                                        icon={<CheckCircle />}
                                                        label="Active"
                                                        size="small"
                                                        color="success"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        icon={<Cancel />}
                                                        label="Expired"
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", gap: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCopy(`${window.location.origin}/lock/${lock.token}`)}
                                                        sx={{ color: "primary.main" }}
                                                    >
                                                        <ContentCopy fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setConfirmDelete(lock)}
                                                        sx={{ color: "error.main" }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog
                open={Boolean(confirmDelete)}
                onClose={() => setConfirmDelete(null)}
                PaperProps={{ sx: { bgcolor: "grey.900", color: "white" } }}
            >
                <DialogTitle>Revoke Lock Link?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to revoke the lock link for{" "}
                        <strong>{confirmDelete?.eventName}</strong>? This link will immediately stop working.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
                    <Button
                        onClick={() => handleRevoke(confirmDelete.id)}
                        color="error"
                        variant="contained"
                    >
                        Revoke
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
