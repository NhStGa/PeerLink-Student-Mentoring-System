import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Paper, Avatar, 
    Button, Divider, Rating, Grid, List, ListItem, 
    ListItemButton, Chip, Dialog, DialogTitle, 
    DialogContent, IconButton, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';

// 1. IMPORT THE CAROUSEL COMPONENT
import ImageCarouselModal from '@/Components/ImageCarouselModal';

export default function ReviewInfo({ auth, review, pastSessions = [] }) {
    
    // --- Session Modal State ---
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);

    // 2. ADD CAROUSEL STATE
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [activeImages, setActiveImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleOpenSessionDetails = (session) => {
        document.activeElement?.blur();
        setSelectedSession(session);
        setSessionDetailsOpen(true);
    };

    const handleCloseSessionDetails = () => {
        setSessionDetailsOpen(false);
        setTimeout(() => setSelectedSession(null), 200);
    };

    // Helper function to open the carousel
    const handleOpenCarousel = (images, clickedIndex) => {
        setActiveImages(images);
        setActiveIndex(clickedIndex);
        setCarouselOpen(true);
    };

    // --- Helpers ---
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const getStatusColor = (status) => {
        if (status === 'Completed') return 'success';
        if (status === 'Cancelled' || status === 'Rejected' || status === 'No Show') return 'error';
        return 'default'; 
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Review" />

            {/* 3. RENDER THE CAROUSEL COMPONENT */}
            <ImageCarouselModal 
                open={carouselOpen} 
                onClose={() => setCarouselOpen(false)} 
                images={activeImages} 
                initialIndex={activeIndex} 
            />

            <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh' }}>
                
                {/* Back Navigation */}
                <Box sx={{ mb: 4 }}>
                    <Link href={route('student.mentors.index')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', ml: -1 }}>
                            Back to Mentors Roster
                        </Button>
                    </Link>
                </Box>

                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3 }}>
                    
                    {/* Header with EDIT Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <RateReviewIcon color="primary" fontSize="large" />
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                                My Feedback
                            </Typography>
                        </Box>
                        
                        <Button 
                            component={Link} 
                            href={route('student.reviews.edit', { review: review.review_id, source: 'review_info' })}
                            variant="contained" 
                            startIcon={<EditIcon />}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                        >
                            Edit Review
                        </Button>
                    </Box>

                    {/* Mentor Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mb: 4 }}>
                        <Avatar 
                            src={review.mentor?.avatar_url}
                            sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '2rem' }}
                            >
                            {review.mentor?.fname?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {review.mentor?.fname} {review.mentor?.lname}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> 
                                {review.mentor?.student_profile?.program?.name || 'Mentor Program'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Submitted on: {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Star Rating */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom>
                            Overall Rating
                        </Typography>
                        <Rating value={review.rating} readOnly size="large" sx={{ fontSize: '3rem' }} />
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Written Review */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Written Review
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#fafafa', borderRadius: 2 }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                {review.review_text || <span style={{ fontStyle: 'italic', color: 'gray' }}>You did not leave a written comment.</span>}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Attached Images */}
                    {review.images && review.images.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Attached Highlights
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {review.images.map((img, idx) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={img.revimage_id}>
                                        <Box 
                                            // UPDATED: Added onClick to open carousel and pointer styles
                                            onClick={() => handleOpenCarousel(review.images, idx)}
                                            sx={{ 
                                                width: '100%', 
                                                paddingTop: '100%', 
                                                position: 'relative', 
                                                borderRadius: 2, 
                                                overflow: 'hidden', 
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 1,
                                                cursor: 'pointer',
                                                '&:hover': { opacity: 0.8 }
                                            }}
                                        >
                                            <img 
                                                src={`/storage/${img.image_path}`} 
                                                alt="Review Highlight" 
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    <Divider sx={{ mb: 4 }} />

                    {/* PAST SESSIONS SECTION */}
                    <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
                        Past Sessions with {review.mentor?.fname}
                    </Typography>

                    <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: '#fff' }}>
                        <List disablePadding>
                            {pastSessions.length > 0 ? (
                                pastSessions.map((session) => (
                                    <div key={session.session_id}>
                                        <ListItem disablePadding>
                                            <ListItemButton 
                                                onClick={() => handleOpenSessionDetails(session)}
                                                sx={{ 
                                                    py: 2, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', 
                                                    '&:hover': { bgcolor: '#f1f5f9' },
                                                    opacity: (session.status === 'Cancelled' || session.status === 'Rejected') ? 0.7 : 1
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                                    <Typography 
                                                        variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '70%', textDecoration: (session.status === 'Cancelled' || session.status === 'Rejected') ? 'line-through' : 'none' }}
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
                                                    <CalendarMonthIcon sx={{ fontSize: 16 }} /> {formatDate(session.session_date)}
                                                </Typography>
                                            </ListItemButton>
                                        </ListItem>
                                        <Divider />
                                    </div>
                                ))
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary" fontStyle="italic">
                                        No past sessions found.
                                    </Typography>
                                </Box>
                            )}
                        </List>
                    </Paper>

                </Paper>
            </Container>

            {/* SESSION DETAILS MODAL */}
            <Dialog open={sessionDetailsOpen} onClose={handleCloseSessionDetails} maxWidth="sm" fullWidth scroll="paper">
                {selectedSession && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography 
                                    variant="h5" fontWeight="bold" color="primary.main" gutterBottom
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

                                {/* Reason Blocks for Cancelled/Rejected */}
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
                    </>
                )}
            </Dialog>

        </AuthenticatedLayout>
    );
}