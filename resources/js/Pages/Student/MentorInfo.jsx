import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Paper, Grid, Avatar, 
    Chip, Divider, Button, Rating, Card, CardContent, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReviewsIcon from '@mui/icons-material/Reviews';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 1. IMPORT THE CAROUSEL COMPONENT
import ImageCarouselModal from '@/Components/ImageCarouselModal';

export default function MentorInfo({ auth, mentor, reviews = [] }) {
    
    const avgRating = mentor.my_rating ? Number(mentor.my_rating).toFixed(1) : '0.0';

    const [visibleReviews, setVisibleReviews] = useState(5);

    // 2. ADD STATE FOR THE CAROUSEL
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [activeImages, setActiveImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleLoadMore = () => {
        setVisibleReviews(prev => prev + 5);
    };

    // Helper function to open the modal with the correct images
    const handleOpenCarousel = (images, clickedIndex) => {
        setActiveImages(images);
        setActiveIndex(clickedIndex);
        setCarouselOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${mentor.name} - Mentor Profile`} />

            {/* 3. RENDER THE CAROUSEL COMPONENT */}
            <ImageCarouselModal 
                open={carouselOpen} 
                onClose={() => setCarouselOpen(false)} 
                images={activeImages} 
                initialIndex={activeIndex} 
            />

            <Container maxWidth="lg" sx={{ py: 6 }}>
                
                {/* Back Navigation */}
                <Box sx={{ mb: 4 }}>
                    <Link href={route('student.find-mentor')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', ml: -1 }}>
                            Back to Find Mentors
                        </Button>
                    </Link>
                </Box>

                <Grid container spacing={4}>
                    {/* LEFT COLUMN: Profile Overview */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, textAlign: 'center', position: 'sticky', top: 24 }}>
                            <Avatar 
                                src={mentor.avatar_url}
                                sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem', mx: 'auto', mb: 2 }}
                                >
                                {mentor.name.charAt(0)}
                            </Avatar>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {mentor.name}
                                </Typography>
                                <VerifiedIcon color="success" />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {mentor.program} • {mentor.year_level}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fff8e1', py: 1, borderRadius: 2, mb: 4 }}>
                                <Rating value={Number(mentor.my_rating)} precision={0.5} readOnly size="small" sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {avgRating}/5 ({reviews.length} Reviews)
                                </Typography>
                            </Box>

                            {/* DYNAMIC ACTION BUTTON */}
                            {mentor.mentorship_status === 'Pending' ? (
                                <Button 
                                    component={Link} href={route('student.mentorship.index')}
                                    variant="outlined" size="large" fullWidth startIcon={<AccessTimeFilledIcon />} 
                                    sx={{ textTransform: 'none', borderRadius: 2, borderColor: 'warning.main', color: 'warning.main', '&:hover': { bgcolor: '#fff3e0' } }}
                                >
                                    View Application
                                </Button>
                            ) : mentor.mentorship_status === 'Approved' || mentor.mentorship_status === 'Active' ? (
                                <Chip 
                                    icon={<CheckCircleIcon />} label="My Mentor" color="success" 
                                    sx={{ width: '100%', py: 2.5, borderRadius: 2, fontSize: '1rem', fontWeight: 'bold' }} 
                                />
                            ) : (
                                <Button 
                                    component={Link} href={route('student.mentorship.apply', mentor.id)}
                                    variant="contained" size="large" fullWidth startIcon={<EmailIcon />} 
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    Request Mentorship
                                </Button>
                            )}
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Details & Reviews */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        
                        {/* Bio Section */}
                        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                                About Me
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', whiteSpace: 'pre-line' }}>
                                "{mentor.bio}"
                            </Typography>
                        </Paper>

                        {/* Skills Section */}
                        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, mb: 4 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <AutoAwesomeIcon sx={{ mr: 1 }} /> Mastered Skills
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {mentor.skills.length > 0 ? (
                                    mentor.skills.sort((a, b) => b.rating - a.rating).map(skill => (
                                        <Chip 
                                            key={skill.id} 
                                            label={`${skill.name} (${skill.rating}/5)`} 
                                            color="primary" variant="outlined"
                                            sx={{ px: 1, py: 2.5, borderRadius: 2, fontWeight: 'medium' }}
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No skills assessed yet.</Typography>
                                )}
                            </Box>
                        </Paper>

                        {/* Reviews Section */}
                        <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <ReviewsIcon sx={{ mr: 1 }} /> Student Reviews
                        </Typography>

                        {reviews.length > 0 ? (
                            <Stack spacing={3}>
                                {reviews.slice(0, visibleReviews).map(review => (
                                    <Card key={review.review_id} sx={{ borderRadius: 3, boxShadow: 2 }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Avatar 
                                                        src={review.student?.avatar_url}
                                                        sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}
                                                        >
                                                        {review.student?.fname?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {review.student?.fname} {review.student?.lname}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            
                                            <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                                            
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {review.review_text || <span style={{ fontStyle: 'italic', color: 'gray' }}>No text provided.</span>}
                                            </Typography>

                                            {/* Review Images */}
                                            {review.images && review.images.length > 0 && (
                                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                    {review.images.slice(0, 3).map((img, idx) => (
                                                        <Box 
                                                            key={img.revimage_id} 
                                                            // UPDATED: Made the box clickable to open the carousel
                                                            onClick={() => handleOpenCarousel(review.images, idx)}
                                                            sx={{ 
                                                                position: 'relative', 
                                                                width: 80, height: 80, 
                                                                borderRadius: 2, overflow: 'hidden', 
                                                                border: '1px solid #e2e8f0',
                                                                cursor: 'pointer', // Show hand cursor
                                                                '&:hover': { opacity: 0.8 } // Small hover effect
                                                            }}
                                                        >
                                                            <img src={`/storage/${img.image_path}`} alt="review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            {idx === 2 && review.images.length > 3 && (
                                                                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                                    +{review.images.length - 3}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Load More Button */}
                                {visibleReviews < reviews.length && (
                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Button 
                                            variant="outlined" 
                                            color="primary" 
                                            onClick={handleLoadMore}
                                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                        >
                                            Load More Reviews
                                        </Button>
                                    </Box>
                                )}
                            </Stack>
                        ) : (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '2px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
                                <Typography variant="h6" color="text.secondary" fontStyle="italic">
                                    No Reviews Yet for this Mentor.
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    Become their mentee and be the first to leave one!
                                </Typography>
                            </Paper>
                        )}
                        
                    </Grid>
                </Grid>
            </Container>
        </AuthenticatedLayout>
    );
}