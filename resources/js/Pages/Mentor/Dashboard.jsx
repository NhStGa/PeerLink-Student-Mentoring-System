import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Grid, Card, 
    Button, Badge, List, ListItem, ListItemButton, ListItemAvatar, 
    ListItemText, Avatar, Dialog, DialogTitle, DialogContent, 
    DialogActions, Chip, Divider, Stack, IconButton, Paper, TextField
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import SchoolIcon from '@mui/icons-material/School';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import EventBusyIcon from '@mui/icons-material/EventBusy';

export default function MentorDashboard({ auth, activeMentees = [], pendingRequestsCount = 0, schedules = [], upcomingSessions = [] }) {
    
    // --- Mentee Profile Modal State ---
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false); 

    const handleOpenModal = (mentee) => { 
        document.activeElement?.blur();
        setSelectedMentee(mentee); 
        setOpenModal(true); 
    };
    const handleCloseModal = () => { setOpenModal(false); setTimeout(() => setSelectedMentee(null), 200); };

    const confirmTerminate = () => {
        router.patch(route('mentor.relationships.terminate', selectedMentee.relationship_id), {}, {
            onSuccess: () => { setTerminateDialogOpen(false); handleCloseModal(); }
        });
    };

    const confirmComplete = () => {
        router.patch(route('mentor.relationships.complete', selectedMentee.relationship_id), {}, {
            onSuccess: () => { setCompleteDialogOpen(false); handleCloseModal(); }
        });
    };

    // --- Calendar State ---
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // --- Session Details & Actions Modal State ---
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
    
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [completeConfirmOpen, setCompleteConfirmOpen] = useState(false);
    const [noShowConfirmOpen, setNoShowConfirmOpen] = useState(false);

    const handleOpenSessionDetails = (session) => {
        document.activeElement?.blur();
        setSelectedSession(session);
        setSessionDetailsOpen(true);
    };

    const handleCloseSessionDetails = () => {
        setSessionDetailsOpen(false);
        setTimeout(() => setSelectedSession(null), 200);
    };

    const handleApproveSession = () => {
        router.patch(route('mentor.sessions.approve', selectedSession.session_id), {}, {
            onSuccess: () => handleCloseSessionDetails()
        });
    };

    const handleRejectSession = () => {
        router.patch(route('mentor.sessions.reject', selectedSession.session_id), { status_description: rejectReason }, {
            onSuccess: () => {
                setRejectDialogOpen(false);
                setRejectReason('');
                handleCloseSessionDetails();
            }
        });
    };

    const handleUpdateSessionStatus = (status, description = null) => {
        router.patch(route('mentor.sessions.update-status', selectedSession.session_id), {
            status: status,
            status_description: description
        }, {
            onSuccess: () => {
                setCancelDialogOpen(false);
                setCompleteConfirmOpen(false);
                setNoShowConfirmOpen(false);
                setCancelReason('');
                handleCloseSessionDetails();
            }
        });
    };

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

    const pendingOffSchedRequests = upcomingSessions.filter(s => s.is_custom && s.status === 'Pending');
    const scheduledSessions = upcomingSessions.filter(s => s.status === 'Scheduled' || s.status === 'Approved');
    const pastAndRejectedSessions = upcomingSessions.filter(s => 
        ['Completed', 'Cancelled', 'No Show'].includes(s.status) || 
        (s.is_custom && s.status === 'Rejected')
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mentor Dashboard" />

            <Container maxWidth="xl" sx={{ py: 2 }}>
                
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Mentor Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Welcome back, {auth.user.fname}! Here is an overview of your active mentoring sessions.
                        </Typography>
                    </Box>

                    <Box sx={{ 
                        bgcolor: '#e3f2fd', px: 3, py: 1.5, borderRadius: 3, 
                        border: '1px solid', borderColor: '#90caf9', textAlign: 'right',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={0.5}>
                            Active Relationships
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary.main" lineHeight={1} sx={{ mt: 0.5 }}>
                            {activeMentees.length}/5
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: 350, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                {/* FIXED: Made the label a clickable link to the new page! */}
                                <Link href={route('mentor.mentees.index')} style={{ textDecoration: 'none' }}>
                                    <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ '&:hover': { textDecoration: 'underline' }, cursor: 'pointer' }}>
                                        My Mentees
                                    </Typography>
                                </Link>
                                <Badge badgeContent={pendingRequestsCount} color="error" sx={{ '& .MuiBadge-badge': { right: -3, top: 3 } }}>
                                    <Button component={Link} href={route('mentor.requests.index')} variant="contained" startIcon={<InboxIcon />} size="small" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
                                        Applicants
                                    </Button>
                                </Badge>
                            </Box>
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {activeMentees.length > 0 ? (
                                    activeMentees.map((mentee) => (
                                        <div key={mentee.id}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => handleOpenModal(mentee)} sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                    <ListItemAvatar>
                                                        <Avatar 
                                                            src={mentee.avatar_url}
                                                            sx={{ bgcolor: 'primary.main', width: 40, height: 40, mr: 1 }}
                                                            >
                                                            {mentee.name.charAt(0)}</Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={<Typography variant="subtitle1" fontWeight="bold">{mentee.name}</Typography>}
                                                        secondary={
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} /> {mentee.program}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="subtitle1" color="text.secondary" gutterBottom>No active mentees yet.</Typography></Box>
                                )}
                            </List>
                        </Card>
                    </Grid>

                    {/* Pending Off-Sched Requests */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: 350, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" fontWeight="bold" color="warning.main">Off-Sched Requests</Typography>
                            </Box>
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {pendingOffSchedRequests.length > 0 ? (
                                    pendingOffSchedRequests.map((session) => (
                                        <div key={session.session_id}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => handleOpenSessionDetails(session)} sx={{ py: 2, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>
                                                            {session.topic_title}
                                                        </Typography>
                                                        <Chip label={session.status} size="small" color={getStatusColor(session.status)} sx={{ height: 20, fontSize: '0.65rem' }} />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        Student: {session.student?.fname} {session.student?.lname}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        <MoreTimeIcon sx={{ fontSize: 16 }} /> {formatDate(session.session_date)}
                                                    </Typography>
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">No pending requests from mentees.</Typography>
                                    </Box>
                                )}
                            </List>
                        </Card>
                    </Grid>

                    {/* Upcoming Scheduled Sessions */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: 350, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" fontWeight="bold" color="success.main">Upcoming Sessions</Typography>
                            </Box>
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {scheduledSessions.length > 0 ? (
                                    scheduledSessions.map((session) => (
                                        <div key={session.session_id}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => handleOpenSessionDetails(session)} sx={{ py: 2, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: '70%' }}>
                                                            {session.topic_title}
                                                        </Typography>
                                                        <Chip label={session.status} size="small" color={getStatusColor(session.status)} sx={{ height: 20, fontSize: '0.65rem' }} />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        Student: {session.student?.fname} {session.student?.lname}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 16 }} /> {formatDate(session.session_date)} • {formatTime(session.start_time)}
                                                    </Typography>
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">No upcoming sessions.</Typography>
                                    </Box>
                                )}
                            </List>
                        </Card>
                    </Grid>

                    {/* ROW 2: Scheduling Row */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ height: 730, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">My Schedule</Typography>
                                <Button component={Link} href={route('mentor.schedule.create')} variant="contained" startIcon={<AddIcon />} size="small" sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
                                    Manage Booking Schedule
                                </Button>
                            </Box>
                            
                            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <IconButton onClick={handlePrevMonth} size="small" sx={{ border: '1px solid #e0e0e0' }}><ChevronLeftIcon /></IconButton>
                                    <Typography variant="h6" fontWeight="bold">{monthName}</Typography>
                                    <IconButton onClick={handleNextMonth} size="small" sx={{ border: '1px solid #e0e0e0' }}><ChevronRightIcon /></IconButton>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                                    {daysOfWeek.map(day => (<Typography key={day} align="center" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>{day}</Typography>))}
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', gap: 1, flexGrow: 1 }}>
                                    {Array.from({ length: firstDayOfMonth }).map((_, index) => <Box key={`empty-${index}`} sx={{ p: 1 }} />)}

                                    {Array.from({ length: daysInMonth }).map((_, index) => {
                                        const dateNum = index + 1;
                                        const formattedCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                                        
                                        const isPast = formattedCellDate < todayStr;

                                        const daySchedules = isPast ? [] : schedules.filter(s => s.available_date === formattedCellDate);
                                        const dayApprovedSessions = isPast ? [] : scheduledSessions.filter(s => s.session_date === formattedCellDate);
                                        const dayPendingCustomSessions = isPast ? [] : pendingOffSchedRequests.filter(s => s.session_date === formattedCellDate);

                                        const isToday = new Date().getDate() === dateNum && new Date().getMonth() === month && new Date().getFullYear() === year;

                                        return (
                                            <Paper 
                                                key={dateNum} variant="outlined" 
                                                sx={{ 
                                                    minHeight: 85, p: 1, pb: 1.5, 
                                                    bgcolor: isToday ? '#fff8e1' : (isPast ? '#f8fafc' : '#ffffff'), 
                                                    borderColor: isToday ? '#ffe082' : 'divider',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                    transition: 'all 0.2s', position: 'relative',
                                                    opacity: isPast ? 0.6 : 1 
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight="bold" sx={{ color: isToday ? 'primary.main' : 'text.secondary', mb: 0.5 }}>{dateNum}</Typography>
                                                
                                                {daySchedules.length > 0 && (
                                                    <Chip label={`${daySchedules.length} slot${daySchedules.length > 1 ? 's' : ''}`} color="primary" size="small" sx={{ fontSize: '0.65rem', height: 20, mt: 'auto', fontWeight: 'bold' }} />
                                                )}

                                                <Box sx={{ display: 'flex', gap: 0.5, position: 'absolute', bottom: 4 }}>
                                                    {dayApprovedSessions.length > 0 && (
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                                    )}
                                                    {dayPendingCustomSessions.length > 0 && (
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: 730, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    Session Bookings
                                </Typography>
                                <Button 
                                    component={Link} 
                                    href={route('mentor.sessions.index')} 
                                    variant="outlined" 
                                    endIcon={<OpenInNewIcon />}
                                    size="small" 
                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', bgcolor: 'white' }}
                                >
                                    View All
                                </Button>
                            </Box>

                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {pastAndRejectedSessions.length > 0 ? (
                                    pastAndRejectedSessions.slice(0, 8).map((session) => (
                                        <div key={session.session_id}>
                                            <ListItem disablePadding>
                                                <ListItemButton 
                                                    onClick={() => handleOpenSessionDetails(session)}
                                                    sx={{ 
                                                        py: 2, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', 
                                                        '&:hover': { bgcolor: '#f1f5f9' },
                                                        opacity: session.status === 'Cancelled' ? 0.7 : 1
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                                        <Typography 
                                                            variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '70%', textDecoration: session.status === 'Cancelled' ? 'line-through' : 'none' }}
                                                        >
                                                            {session.topic_title}
                                                        </Typography>
                                                        <Chip 
                                                            label={session.status} 
                                                            size="small" 
                                                            color={getStatusColor(session.status)} 
                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                        />
                                                    </Box>
                                                    
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 16 }} /> {formatDate(session.session_date)} • {formatTime(session.start_time)}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        <LocationOnIcon sx={{ fontSize: 16 }} /> {session.location}
                                                    </Typography>
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            No past session records.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Card>
                    </Grid>

                </Grid>
            </Container>

            {/* --- MODALS BELOW --- */}

            {/* SESSION DETAILS MODAL */}
            <Dialog open={sessionDetailsOpen} onClose={handleCloseSessionDetails} maxWidth="sm" fullWidth scroll="paper">
                {selectedSession && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography 
                                    variant="h5" fontWeight="bold" color="primary.main" gutterBottom
                                    sx={{ textDecoration: selectedSession.status === 'Cancelled' ? 'line-through' : 'none' }}
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
                            <IconButton onClick={handleCloseSessionDetails} sx={{ color: 'text.secondary' }}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        
                        <DialogContent dividers sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold" gutterBottom>
                                        Topic Description
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                                        <Typography variant="body1">
                                            {selectedSession.topic_description}
                                        </Typography>
                                    </Paper>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'primary.light' }}><MenuBookIcon /></Avatar>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Related Skill</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedSession.skill?.skill_name || 'N/A'}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'success.light' }}><VerifiedIcon /></Avatar>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Student</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedSession.student?.fname} {selectedSession.student?.lname}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'info.light' }}><AccessTimeIcon /></Avatar>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Schedule</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {formatDate(selectedSession.session_date)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'warning.light' }}><LocationOnIcon /></Avatar>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Location</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedSession.location}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {selectedSession.status === 'Cancelled' && (
                                    <Box sx={{ mt: 3, p: 2, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #fecdd3' }}>
                                        <Typography variant="subtitle2" color="error.main" fontWeight="bold" gutterBottom>
                                            Reason for Cancellation
                                        </Typography>
                                        <Typography variant="body2" color="error.dark">
                                            {selectedSession.status_description || "No explanation provided."}
                                        </Typography>
                                    </Box>
                                )}

                                {selectedSession.status === 'Rejected' && (
                                    <Box sx={{ mt: 3, p: 2, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #fecdd3' }}>
                                        <Typography variant="subtitle2" color="error.main" fontWeight="bold" gutterBottom>
                                            Reason for Rejection
                                        </Typography>
                                        <Typography variant="body2" color="error.dark">
                                            {selectedSession.status_description || "No explanation provided."}
                                        </Typography>
                                    </Box>
                                )}

                            </Stack>
                        </DialogContent>

                        {/* MENTOR ACTION BUTTONS: Approve/Reject for PENDING Custom Requests */}
                        {(!!selectedSession.is_custom && selectedSession.status === 'Pending') && (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'space-between' }}>
                                <Button 
                                    onClick={() => setRejectDialogOpen(true)}
                                    color="error" 
                                    variant="outlined" 
                                    startIcon={<CancelIcon />}
                                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                >
                                    Reject Request
                                </Button>
                                <Button 
                                    onClick={handleApproveSession}
                                    color="success" 
                                    variant="contained" 
                                    startIcon={<CheckCircleIcon />}
                                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                >
                                    Approve Session
                                </Button>
                            </DialogActions>
                        )}

                        {/* MENTOR ACTION BUTTONS: Update Active/Scheduled Sessions */}
                        {(selectedSession.status === 'Scheduled' || selectedSession.status === 'Approved') && (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                                <Button 
                                    onClick={() => setNoShowConfirmOpen(true)}
                                    color="warning" 
                                    variant="outlined" 
                                    startIcon={<PersonOffIcon />}
                                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                >
                                    No Show
                                </Button>
                                <Button 
                                    onClick={() => setCancelDialogOpen(true)}
                                    color="error" 
                                    variant="outlined" 
                                    startIcon={<EventBusyIcon />}
                                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                >
                                    Cancel Session
                                </Button>
                                <Button 
                                    onClick={() => setCompleteConfirmOpen(true)}
                                    color="success" 
                                    variant="contained" 
                                    startIcon={<TaskAltIcon />}
                                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                >
                                    Mark Completed
                                </Button>
                            </DialogActions>
                        )}
                    </>
                )}
            </Dialog>

            {/* --- STATUS UPDATE CONFIRMATION MODALS --- */}
            <Dialog open={completeConfirmOpen} onClose={() => setCompleteConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="success.main">Complete Session?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to mark this session with <strong>{selectedSession?.student?.fname}</strong> as Completed?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCompleteConfirmOpen(false)} color="inherit">Back</Button>
                    <Button onClick={() => handleUpdateSessionStatus('Completed')} variant="contained" color="success">Yes, Complete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={noShowConfirmOpen} onClose={() => setNoShowConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="warning.main">Mark as No Show?</DialogTitle>
                <DialogContent>
                    <Typography>Did <strong>{selectedSession?.student?.fname}</strong> fail to attend this session? This will record a "No Show" on their history.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setNoShowConfirmOpen(false)} color="inherit">Back</Button>
                    <Button onClick={() => handleUpdateSessionStatus('No Show')} variant="contained" color="warning">Confirm No Show</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold" color="error.main">Cancel Session</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        Please provide a brief reason for cancelling this scheduled session. This will be shared with the student.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason for Cancellation"
                        placeholder="e.g., I have a sudden emergency, I need to reschedule..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCancelDialogOpen(false)} color="inherit">Go Back</Button>
                    <Button 
                        onClick={() => handleUpdateSessionStatus('Cancelled', cancelReason)} 
                        variant="contained" 
                        color="error"
                        disabled={cancelReason.trim().length < 5}
                    >
                        Confirm Cancellation
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold" color="error.main">Reject Off-Schedule Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        Please provide a brief reason for rejecting this session request. This will be shared with the student.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason for Rejection"
                        placeholder="e.g., I have a conflicting class, I need a break that afternoon..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRejectDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleRejectSession} 
                        variant="contained" 
                        color="error"
                        disabled={rejectReason.trim().length < 5}
                    >
                        Confirm Rejection
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MENTEE PROFILE MODALS */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth scroll="paper">
                {selectedMentee && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                    src={selectedMentee.avatar_url}
                                    sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.8rem' }}
                                    >
                                    {selectedMentee.name.charAt(0)}</Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{selectedMentee.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {selectedMentee.program} • {selectedMentee.year_level}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={handleCloseModal} sx={{ color: 'text.secondary', mt: -1, mr: -1 }}><CloseIcon /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: 4 }}>
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom>Mentee Bio</Typography>
                                    <Typography variant="body1" fontStyle="italic">"{selectedMentee.bio}"</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><AutoAwesomeIcon sx={{ fontSize: 18, mr: 0.5 }} /> Current Skills</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedMentee.skills.length > 0 ? selectedMentee.skills.sort((a, b) => b.rating - a.rating).map((skill, idx) => <Chip key={idx} label={`${skill.name} (${skill.rating}/5)`} color="info" variant="outlined" />) : <Typography variant="body2" color="text.secondary">No skills recorded.</Typography>}
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        {/* ONLY Show actions if they are Active */}
                        {selectedMentee.status === 'Active' && (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setTerminateDialogOpen(true)} color="error" variant="outlined" startIcon={<PersonRemoveIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>Terminate</Button>
                                <Button onClick={() => setCompleteDialogOpen(true)} color="success" variant="contained" startIcon={<TaskAltIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>Mark Completed</Button>
                            </DialogActions>
                        )}
                    </>
                )}
            </Dialog>

            <Dialog open={terminateDialogOpen} onClose={() => setTerminateDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error.main">Terminate Mentorship?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to terminate your mentorship with <strong>{selectedMentee?.name}</strong>?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setTerminateDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmTerminate} variant="contained" color="error">Yes, Terminate</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="success.main">Complete Mentorship?</DialogTitle>
                <DialogContent>
                    <Typography>Congratulations! Are you ready to officially graduate <strong>{selectedMentee?.name}</strong>?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCompleteDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmComplete} variant="contained" color="success">Yes, Complete Mentorship</Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}