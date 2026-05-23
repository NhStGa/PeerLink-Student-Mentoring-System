import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Grid, Card, Typography, Button, Container, Box, 
    List, ListItem, ListItemButton, ListItemAvatar, ListItemText, 
    Avatar, Divider, Dialog, DialogTitle, DialogContent, DialogActions, 
    Chip, Stack, IconButton, Paper, Badge, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; 
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function StudentDashboard({ auth, activeMentors = [], mentorSchedules = [], upcomingSessions = [], pendingReviewsCount = 0 }) {
    
    // --- Mentor Profile Modal State ---
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);

    const handleOpenModal = (mentor) => { 
        document.activeElement?.blur();
        setSelectedMentor(mentor); 
        setOpenModal(true); 
    };
    const handleCloseModal = () => { setOpenModal(false); setTimeout(() => setSelectedMentor(null), 200); };

    const confirmTerminate = () => {
        router.patch(route('student.relationships.terminate', selectedMentor.relationship_id), {}, {
            onSuccess: () => { setTerminateDialogOpen(false); handleCloseModal(); }
        });
    };

    // --- Calendar State & Date Helpers ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate today's date as a string (YYYY-MM-DD) for calendar filtering
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDayClick = (dateStr) => { 
        document.activeElement?.blur();
        setSelectedDate(dateStr); 
        setScheduleModalOpen(true); 
    };

    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);

    const handleOpenSessionDetails = (session) => {
        document.activeElement?.blur();
        setSelectedSession(session);
        setSessionDetailsOpen(true);
    };

    const handleCloseSessionDetails = () => {
        setSessionDetailsOpen(false);
        setTimeout(() => setSelectedSession(null), 200);
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

    // Filter schedules for the popup modal
    const selectedDateSchedules = selectedDate ? mentorSchedules.filter(s => s.available_date === selectedDate) : [];

    // --- SESSION FILTERS ---
    const pendingOffSchedRequests = upcomingSessions.filter(s => s.is_custom && s.status === 'Pending');
    const scheduledSessions = upcomingSessions.filter(s => s.status === 'Scheduled' || s.status === 'Approved');
    const pastAndRejectedSessions = upcomingSessions.filter(s => 
        ['Completed', 'Cancelled', 'No Show'].includes(s.status) || 
        (s.is_custom && s.status === 'Rejected')
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Student Dashboard" />

            <Container maxWidth="xl" sx={{ py: 2 }}>
                
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Welcome, {auth.user.fname || auth.user.name}! 
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Ready to learn something new today? Check in with your mentors or find a new one.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    
                    {/* ROW 1: Top Widgets */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: 350, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Badge badgeContent={pendingReviewsCount} color="error" sx={{ '& .MuiBadge-badge': { right: -6, top: 4 } }}>
                                    <Link href={route('student.mentors.index')} style={{ textDecoration: 'none' }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ '&:hover': { textDecoration: 'underline' }, cursor: 'pointer', pr: 1 }}>
                                            My Mentors
                                        </Typography>
                                    </Link>
                                </Badge>
                                <Button component={Link} href={route('student.mentorship.index')} variant="contained" startIcon={<EmailIcon />} size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
                                    Applications
                                </Button>
                            </Box>
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {activeMentors.length > 0 ? (
                                    activeMentors.map((mentor) => (
                                        <div key={mentor.id}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => handleOpenModal(mentor)} sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                    <ListItemAvatar>
                                                        <Avatar src={mentor.avatar_url} sx={{  bgcolor: 'primary.main', width: 40, height: 40, mr: 1 }}>{mentor.name.charAt(0)}</Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={<Typography variant="subtitle1" fontWeight="bold">{mentor.name}</Typography>}
                                                        secondary={
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                <SchoolIcon sx={{ fontSize: 14, mr: 0.5 }} /> {mentor.program}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="subtitle1" color="text.secondary">You don't have any mentors yet.</Typography></Box>
                                )}
                            </List>
                            <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
                                <Button component={Link} href={route('student.find-mentor')} variant="outlined" startIcon={<SearchIcon />} fullWidth sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}>
                                    Find a New Mentor
                                </Button>
                            </Box>
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
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">No Pending Requests</Typography>
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
                                        <Typography variant="body2" color="text.secondary" fontStyle="italic">No Upcoming Sessions</Typography>
                                    </Box>
                                )}
                            </List>
                        </Card>
                    </Grid>

                    {/* ROW 2: Scheduling Row */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ height: 650, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">My Calendar</Typography>
                                <Button component={Link} href={route('student.sessions.create')} variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
                                    Book A Session Now
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
                                        
                                        // CHECK IF DATE IS IN THE PAST
                                        const isPast = formattedCellDate < todayStr;

                                        // If past, force empty arrays. If present/future, map the schedules!
                                        const daySchedules = isPast ? [] : mentorSchedules.filter(s => s.available_date === formattedCellDate);
                                        const dayApprovedSessions = isPast ? [] : scheduledSessions.filter(s => s.session_date === formattedCellDate);
                                        const dayPendingCustomSessions = isPast ? [] : pendingOffSchedRequests.filter(s => s.session_date === formattedCellDate);

                                        const isToday = new Date().getDate() === dateNum && new Date().getMonth() === month && new Date().getFullYear() === year;

                                        return (
                                            <Paper 
                                                key={dateNum} 
                                                variant="outlined" 
                                                // Only make it clickable if it's not in the past
                                                onClick={() => !isPast && handleDayClick(formattedCellDate)}
                                                sx={{ 
                                                    minHeight: 85, p: 1, pb: 1.5, 
                                                    bgcolor: isToday ? '#fff8e1' : (isPast ? '#f8fafc' : '#ffffff'), 
                                                    borderColor: isToday ? '#ffe082' : 'divider',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                    cursor: isPast ? 'default' : 'pointer', 
                                                    transition: 'all 0.2s', position: 'relative',
                                                    '&:hover': { bgcolor: isPast ? '#f8fafc' : '#f1f5f9', borderColor: isPast ? 'divider' : 'primary.light' },
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

                    {/* Session Bookings with fixed height 650 */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ height: 650, display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    Session Bookings
                                </Typography>
                                <Button 
                                    component={Link} 
                                    href={route('student.sessions.index')} 
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
                                    pastAndRejectedSessions.slice(0, 8).map((session) => ( // Only show top 8 recent ones here
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

            {/* --- MODALS --- */}

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
                                                <Typography variant="caption" color="text.secondary" display="block">Mentor</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedSession.mentor?.fname} {selectedSession.mentor?.lname}</Typography>
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

                        {(selectedSession.status === 'Scheduled' || selectedSession.status === 'Approved' || (!!selectedSession.is_custom && selectedSession.status === 'Pending')) && (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    component={Link} 
                                    href={route('student.sessions.cancel', selectedSession.session_id)}
                                    color="error" 
                                    variant="outlined" 
                                    sx={{ fontWeight: 'bold', borderRadius: 2 }}
                                >
                                    {selectedSession.status === 'Pending' ? 'Cancel Request' : 'Cancel Session'}
                                </Button>
                            </DialogActions>
                        )}
                    </>
                )}
            </Dialog>

            {/* MENTOR AVAILABILITY MODAL */}
            <Dialog open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} maxWidth="sm" fullWidth scroll="paper">
                <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <EventAvailableIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Available Sessions: {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setScheduleModalOpen(false)} sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent dividers sx={{ p: 0 }}>
                    <TableContainer>
                        <Table size="medium">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Mentor</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Capacity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedDateSchedules.length > 0 ? (
                                    selectedDateSchedules.map((row) => (
                                        <TableRow key={row.availability_id}>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {row.mentor?.fname} {row.mentor?.lname}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                {formatTime(row.start_time)} - {formatTime(row.end_time)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip label={`${row.max_booking} limit`} size="small" variant="outlined" color="info" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mb: 1 }}>
                                                No regular schedules found for this date.
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                You can still click 'Book A Session Now' to send an Off-Schedule request!
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>

                <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        component={Link} 
                        // Pass the selectedDate as a URL parameter
                        href={route('student.sessions.create', { date: selectedDate })}
                        variant="contained" color="success" startIcon={<AddCircleOutlineIcon />} 
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                    >
                        Book A Session Now
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MENTOR PROFILE MODAL */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth scroll="paper">
                {selectedMentor && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    src={selectedMentor.avatar_url}
                                    sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.8rem' }}
                                    >
                                    {selectedMentor.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h5" fontWeight="bold">{selectedMentor.name}</Typography>
                                        <VerifiedIcon color="success" sx={{ fontSize: 20 }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {selectedMentor.program} • {selectedMentor.year_level}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={handleCloseModal} sx={{ color: 'text.secondary', mt: -1, mr: -1 }}><CloseIcon /></IconButton>
                        </DialogTitle>
                        <DialogContent dividers sx={{ p: 4 }}>
                            <Stack spacing={4}>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom>About Your Mentor</Typography>
                                    <Typography variant="body1" fontStyle="italic">"{selectedMentor.bio}"</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><AutoAwesomeIcon sx={{ fontSize: 18, mr: 0.5 }} /> Mastered Skills</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedMentor.skills.length > 0 ? selectedMentor.skills.sort((a, b) => b.rating - a.rating).map((skill, idx) => <Chip key={idx} label={`${skill.name} (${skill.rating}/5)`} color="primary" variant="outlined" />) : <Typography variant="body2" color="text.secondary">No skills recorded.</Typography>}
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        
                    </>
                )}
            </Dialog>
        </AuthenticatedLayout>
    );
}