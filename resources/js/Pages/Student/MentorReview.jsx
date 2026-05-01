import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Paper, TextField, Button, 
    Stack, Avatar, Divider, Rating, IconButton, Dialog, 
    DialogTitle, DialogContent, DialogActions, List, 
    ListItem, ListItemButton, Chip, Grid, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';

// 1. IMPORT THE CAROUSEL COMPONENT
import ImageCarouselModal from '@/Components/ImageCarouselModal';

export default function MentorReview({ auth, mentor, relationshipId, relationship = null, pastSessions = [], existingReview = null, source = 'profile' }) {
    
    const isEditMode = !!existingReview;
    const isAlreadyEnded = relationship?.status === 'Terminated' || relationship?.status === 'Completed';
    
    const [confirmModalOpen, setConfirmModalOpen] = useState(false); 
    const [updateModalOpen, setUpdateModalOpen] = useState(false);   

    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);

    // File size validation state
    const [imageError, setImageError] = useState('');

    // 2. ADD CAROUSEL STATE
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [activeImages, setActiveImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        relationship_id: relationshipId || relationship?.relationship_id || '',
        rating: existingReview ? existingReview.rating : 0,
        review_text: existingReview ? existingReview.review_text : '',
        images: [], 
        _method: isEditMode ? 'put' : 'post', 
    });

    let backUrl = route('student.dashboard');
    let backText = 'Cancel & Return to Dashboard';

    if (isEditMode) {
        if (source === 'review_info') {
            backUrl = route('student.reviews.info', existingReview.review_id);
            backText = 'Cancel Edit & Return to Review';
        } else {
            backUrl = route('profile.show');
            backText = 'Cancel Edit & Return to Profile';
        }
    } else if (isAlreadyEnded) {
        backUrl = route('student.mentors.index');
        backText = 'Cancel & Return to Mentor Roster';
    }

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const getStatusColor = (status) => {
        if (status === 'Completed') return 'success';
        if (status === 'Cancelled' || status === 'Rejected' || status === 'No Show') return 'error';
        return 'default'; 
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        let validFiles = [];
        let hasLargeFile = false;

        files.forEach(file => {
            if (file.size > 2 * 1024 * 1024) { 
                hasLargeFile = true;
            } else {
                validFiles.push(file);
            }
        });

        if (hasLargeFile) {
            setImageError('One or more selected images exceeded the 2MB limit and were removed. Please choose smaller images.');
        } else {
            setImageError('');
        }

        setData('images', [...data.images, ...validFiles]);
    };

    const removeFile = (indexToRemove) => {
        setData('images', data.images.filter((_, index) => index !== indexToRemove));
        setImageError(''); 
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) setUpdateModalOpen(true);
        else setConfirmModalOpen(true);
    };

    const submitFinalReview = () => {
        setImageError(''); 
        if (isEditMode) {
            post(route('student.reviews.update', { review: existingReview.review_id, source: source }), {
                onSuccess: () => setUpdateModalOpen(false),
                onError: () => setUpdateModalOpen(false) 
            });
        } else {
            post(route('student.reviews.store', mentor.id), {
                onSuccess: () => setConfirmModalOpen(false),
                onError: () => setConfirmModalOpen(false) 
            }); 
        }
    };

    const handleOpenSessionDetails = (session) => { document.activeElement?.blur(); setSelectedSession(session); setSessionDetailsOpen(true); };
    const handleCloseSessionDetails = () => { setSessionDetailsOpen(false); setTimeout(() => setSelectedSession(null), 200); };

    // Helper function to open the modal
    const handleOpenCarousel = (images, clickedIndex) => {
        setActiveImages(images);
        setActiveIndex(clickedIndex);
        setCarouselOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={isEditMode ? "Edit Mentor Review" : "Review Your Mentor"} />

            {/* 3. RENDER THE CAROUSEL COMPONENT */}
            <ImageCarouselModal 
                open={carouselOpen} 
                onClose={() => setCarouselOpen(false)} 
                images={activeImages} 
                initialIndex={activeIndex} 
            />

            <Container maxWidth="md" sx={{ py: 2 }}>
                
                <Box sx={{ mb: 4 }}>
                    <Link href={backUrl}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            {backText}
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {isEditMode ? "Update Your Review" : "Leave a Review"}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isEditMode 
                            ? "Update your past feedback for this mentor." 
                            : isAlreadyEnded 
                                ? "Please share your experience with this mentor."
                                : "Please share your experience to finalize your mentorship termination!"
                        }
                    </Typography>
                </Box>

                {Object.keys(errors).length > 0 && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                        <strong>Submission Failed. Please fix the following errors:</strong>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                            {Object.values(errors).map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3, mb: 6 }}>
                    <form onSubmit={handlePreSubmit}>
                        <Stack spacing={4}>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Avatar 
                                    src={mentor.avatar_url}
                                    sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
                                    >
                                    {mentor.fname ? mentor.fname.charAt(0) : 'M'}
                                </Avatar>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h5" fontWeight="bold">
                                            {mentor.fname} {mentor.lname}
                                        </Typography>
                                        <VerifiedIcon color="success" fontSize="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {mentor.mentor_profile?.program || 'Mentor Program'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    How would you rate your mentorship experience?
                                </Typography>
                                <Rating
                                    name="mentor-rating"
                                    value={data.rating}
                                    onChange={(event, newValue) => setData('rating', newValue)}
                                    size="large"
                                    sx={{ fontSize: '3rem', mt: 1 }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Written Review
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    placeholder="What did you learn? What could be improved? Be honest and constructive!"
                                    value={data.review_text}
                                    onChange={(e) => setData('review_text', e.target.value)}
                                    error={!!errors.review_text}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                />
                            </Box>

                            <Box>
                                {isEditMode && existingReview.images?.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>Previously Uploaded Images</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            {/* UPDATED: Made these previously uploaded images clickable */}
                                            {existingReview.images.map((img, idx) => (
                                                <Box 
                                                    key={img.revimage_id} 
                                                    onClick={() => handleOpenCarousel(existingReview.images, idx)}
                                                    sx={{ 
                                                        width: 100, height: 100, borderRadius: 2, overflow: 'hidden', 
                                                        border: '1px solid #e2e8f0', boxShadow: 1,
                                                        cursor: 'pointer', '&:hover': { opacity: 0.8 }
                                                    }}
                                                >
                                                    <img src={`/storage/${img.image_path}`} alt="past upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    {isEditMode ? "Attach New Proof or Highlights (Optional)" : "Attach Proof or Highlights (Optional)"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Did you build a cool project together? Upload screenshots of your success! <strong>(Max 2MB per image)</strong>
                                </Typography>
                                
                                {imageError && (
                                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                                        {imageError}
                                    </Alert>
                                )}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ borderRadius: 2, textTransform: 'none', py: 1.5, borderStyle: 'dashed', borderWidth: 2 }}
                                    fullWidth
                                >
                                    Upload {isEditMode ? "New " : ""}Images
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                                </Button>

                                {data.images.length > 0 && (
                                    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {data.images.map((file, index) => {
                                            const objectUrl = URL.createObjectURL(file);
                                            return (
                                                <Box key={index} sx={{ position: 'relative', width: 120, height: 120, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 1 }}>
                                                    <img 
                                                        src={objectUrl} 
                                                        alt={`preview-${index}`} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        onLoad={() => URL.revokeObjectURL(objectUrl)} 
                                                    />
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => removeFile(index)}
                                                        sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fee2e2', color: 'error.main' } }}
                                                    >
                                                        <CloseIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                )}
                                {errors.images && <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>{errors.images}</Typography>}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large"
                                    startIcon={isEditMode ? <SaveIcon /> : <SendIcon />}
                                    disabled={processing || data.rating === 0} 
                                    sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    {isEditMode 
                                        ? (relationship?.status === 'Active' ? "Update & Terminate" : "Update Review") 
                                        : (isAlreadyEnded ? "Submit Review" : "Finalize Termination")}
                                </Button>
                            </Box>

                        </Stack>
                    </form>
                </Paper>

                {/* PAST SESSIONS SECTION */}
                <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
                    Past Sessions with {mentor.fname}
                </Typography>

                <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden', bgcolor: '#fff' }}>
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

            </Container>

            {/* --- MODALS --- */}
            <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isAlreadyEnded ? 'primary.main' : 'error.main', fontWeight: 'bold' }}>
                    {isAlreadyEnded ? <InfoIcon /> : <WarningAmberIcon />} {isAlreadyEnded ? 'Confirm Submission' : 'Confirm Termination'}
                </DialogTitle>
                <DialogContent dividers>
                    {isAlreadyEnded ? (
                        <Typography variant="body1">
                            Are you sure you want to submit this review for <strong>{mentor.fname}</strong>? 
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Are you absolutely sure you want to submit this review and terminate your mentorship with <strong>{mentor.fname}</strong>? 
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Once terminated, you will no longer be able to book sessions with this mentor unless you reapply.
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
                    <Button onClick={() => setConfirmModalOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
                        Go Back
                    </Button>
                    <Button 
                        onClick={submitFinalReview} 
                        variant="contained" 
                        color={isAlreadyEnded ? 'primary' : 'error'} 
                        disabled={processing}
                        sx={{ fontWeight: 'bold' }}
                    >
                        {isAlreadyEnded ? 'Submit Review' : 'Yes, Terminate Mentorship'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold' }}>
                    <InfoIcon /> Confirm Review Update
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1">
                        Are you sure you want to save these changes to your review for <strong>{mentor.fname}</strong>? 
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
                    <Button onClick={() => setUpdateModalOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={submitFinalReview} 
                        variant="contained" 
                        color="primary" 
                        disabled={processing}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

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
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <Avatar sx={{ bgcolor: 'primary.light' }}><MenuBookIcon /></Avatar>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Related Skill</Typography>
                                                <Typography variant="body2" fontWeight="bold">{selectedSession.skill?.skill_name || 'N/A'}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
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

                                    <Grid item xs={12} sm={6}>
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
                    </>
                )}
            </Dialog>

        </AuthenticatedLayout>
    );
}