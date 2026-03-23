import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Button, Paper, Grid, 
    List, ListItem, ListItemButton, Chip, Divider, 
    Avatar, Stack 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function AllSessions({ auth, sessions = [] }) {
    
    // Auto-select the first session in the list if there is one
    const [selectedSession, setSelectedSession] = useState(sessions.length > 0 ? sessions[0] : null);

    // --- Helpers ---
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedH = h % 12 || 12;
        return `${formattedH}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status) => {
        if (status === 'Scheduled' || status === 'Approved' || status === 'Completed') return 'success';
        if (status === 'Cancelled' || status === 'Rejected' || status === 'No Show') return 'error';
        return 'warning'; 
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="All Mentor Sessions" />

            <Container maxWidth="xl" sx={{ pt: 3, pb: 6, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
                
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Link href={route('mentor.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        Mentoring History
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage your past session logs.
                    </Typography>
                </Box>

                {/* Main Content Area */}
                <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
                    
                    {/* LEFT COLUMN: Scrollable Session List */}
                    <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ height: '100%' }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                    Session Log
                                </Typography>
                            </Box>
                            
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <div key={session.session_id}>
                                            <ListItem disablePadding>
                                                <ListItemButton 
                                                    selected={selectedSession?.session_id === session.session_id}
                                                    onClick={() => setSelectedSession(session)}
                                                    sx={{ 
                                                        py: 2, px: 2.5, 
                                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                                        '&.Mui-selected': { bgcolor: '#e3f2fd', borderLeft: '4px solid', borderColor: 'primary.main' },
                                                        '&.Mui-selected:hover': { bgcolor: '#bbdefb' },
                                                        opacity: (session.status === 'Cancelled' || session.status === 'Rejected') ? 0.7 : 1
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                                        <Typography 
                                                            variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: '65%', textDecoration: (session.status === 'Cancelled' || session.status === 'Rejected') ? 'line-through' : 'none' }}
                                                        >
                                                            {session.topic_title}
                                                        </Typography>
                                                        <Chip 
                                                            label={session.status} 
                                                            size="small" 
                                                            color={getStatusColor(session.status)} 
                                                            sx={{ height: 20, fontSize: '0.65rem' }} 
                                                        />
                                                    </Box>
                                                    
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CalendarMonthIcon sx={{ fontSize: 14 }} /> {formatDate(session.session_date)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                                        Student: {session.student?.fname} {session.student?.lname}
                                                    </Typography>
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                            No session records found.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Session Details View */}
                    <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ height: '100%' }}>
                        <Paper sx={{ height: '100%', borderRadius: 3, boxShadow: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            {selectedSession ? (
                                <>
                                    {/* Detail Header */}
                                    <Box sx={{ p: 4, bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography 
                                                variant="h4" fontWeight="bold" color="primary.main" gutterBottom
                                                sx={{ textDecoration: (selectedSession.status === 'Cancelled' || selectedSession.status === 'Rejected') ? 'line-through' : 'none' }}
                                            >
                                                {selectedSession.topic_title}
                                            </Typography>
                                            <Chip 
                                                label={`Status: ${selectedSession.status}`} 
                                                color={getStatusColor(selectedSession.status)} 
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                            {!!selectedSession.is_custom && (
                                                <Chip label="Off-Schedule Request" size="small" color="info" variant="outlined" sx={{ fontWeight: 'bold', ml: 1 }} />
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Detail Body */}
                                    <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
                                        <Stack spacing={4}>
                                            
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold" gutterBottom>
                                                    Topic Description
                                                </Typography>
                                                <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
                                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                        {selectedSession.topic_description}
                                                    </Typography>
                                                </Paper>
                                            </Box>

                                            <Grid container spacing={3}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}><MenuBookIcon /></Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block" textTransform="uppercase" fontWeight="bold">Related Skill</Typography>
                                                            <Typography variant="body1" fontWeight="bold">{selectedSession.skill?.skill_name || 'N/A'}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}><VerifiedIcon /></Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block" textTransform="uppercase" fontWeight="bold">Student</Typography>
                                                            <Typography variant="body1" fontWeight="bold">{selectedSession.student?.fname} {selectedSession.student?.lname}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}><AccessTimeIcon /></Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block" textTransform="uppercase" fontWeight="bold">Schedule</Typography>
                                                            <Typography variant="body1" fontWeight="bold">
                                                                {formatDate(selectedSession.session_date)}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary" display="block">
                                                                {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}><LocationOnIcon /></Avatar>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary" display="block" textTransform="uppercase" fontWeight="bold">Location</Typography>
                                                            <Typography variant="body1" fontWeight="bold">{selectedSession.location}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            {/* Reason Blocks for Cancelled/Rejected */}
                                            {selectedSession.status === 'Cancelled' && (
                                                <Box sx={{ p: 3, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #fecdd3' }}>
                                                    <Typography variant="subtitle2" color="error.main" fontWeight="bold" textTransform="uppercase" gutterBottom>
                                                        Reason for Cancellation
                                                    </Typography>
                                                    <Typography variant="body1" color="error.dark">
                                                        {selectedSession.status_description || "No explanation provided."}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {selectedSession.status === 'Rejected' && (
                                                <Box sx={{ p: 3, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #fecdd3' }}>
                                                    <Typography variant="subtitle2" color="error.main" fontWeight="bold" textTransform="uppercase" gutterBottom>
                                                        Reason for Rejection
                                                    </Typography>
                                                    <Typography variant="body1" color="error.dark">
                                                        {selectedSession.status_description || "No explanation provided."}
                                                    </Typography>
                                                </Box>
                                            )}

                                        </Stack>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#fafafa' }}>
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#e2e8f0', mb: 2 }}>
                                        <MenuBookIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
                                    </Avatar>
                                    <Typography variant="h5" color="text.secondary" fontWeight="bold">
                                        No Session Selected
                                    </Typography>
                                    <Typography variant="body1" color="text.disabled" sx={{ mt: 1 }}>
                                        Select a session from the list on the left to view its details.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </AuthenticatedLayout>
    );
}