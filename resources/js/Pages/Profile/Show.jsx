import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Card, CardContent, Typography, Button, Avatar, 
    Divider, Box, Chip, Paper, Tabs, Tab, Stack, Rating 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import RateReviewIcon from '@mui/icons-material/RateReview';

// 1. IMPORT THE CAROUSEL COMPONENT
import ImageCarouselModal from '@/Components/ImageCarouselModal';

export default function Show({ auth, studentProfile, mentorProfile, applicationStatus, mySkills = [], myReviews = [], mentorRatings = [] }) {
    const user = auth.user;

    // Tab State
    const [tabIndex, setTabIndex] = useState(0);

    // 2. ADD CAROUSEL STATE
    const [carouselOpen, setCarouselOpen] = useState(false);
    const [activeImages, setActiveImages] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const getSkillColor = (rating) => {
        if (rating >= 4) return 'success';
        if (rating === 3) return 'primary';
        return 'default';
    };

    // Helper function to open the modal
    const handleOpenCarousel = (images, clickedIndex) => {
        setActiveImages(images);
        setActiveIndex(clickedIndex);
        setCarouselOpen(true);
    };

    return (
        <AuthenticatedLayout user={user}>
            <Head title="My Profile" />

            {/* 3. RENDER THE CAROUSEL COMPONENT */}
            <ImageCarouselModal 
                open={carouselOpen} 
                onClose={() => setCarouselOpen(false)} 
                images={activeImages} 
                initialIndex={activeIndex} 
            />

            {/* UPDATED CONTAINER STYLING: minHeight 110vh */}
            <Container 
                maxWidth="md" 
                sx={{ 
                    minHeight: '110vh', 
                    display: 'flex',
                    flexDirection: 'column',
                    py: 6 
                }}
            >
                {/* UPDATED CARD STYLING: Removed overflowY to allow natural growing */}
                <Card sx={{ 
                    flexGrow: 1, 
                    borderRadius: 4, 
                    boxShadow: 3, 
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <CardContent sx={{ p: 5, flexGrow: 1 }}>
                        
                        {/* SECTION 1: HEADER */}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: 'flex-start' }}>
                            <Avatar 
                                src={user.avatar_url}
                                sx={{ width: 120, height: 120, bgcolor: '#1976d2', fontSize: '3rem' }}
                            >
                                {user.fname[0]}{user.lname[0]}
                            </Avatar>

                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                    {user.fname} {user.mi ? `${user.mi}.` : ''} {user.lname}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 1 }}>
                                        <SchoolIcon fontSize="small" />
                                        <Typography variant="body2" fontWeight="500">
                                            {studentProfile?.student_number || 'No Student No.'}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary">
                                        {studentProfile?.program?.name || 'Program Not Set'} 
                                        {studentProfile?.year_level ? ` • ${studentProfile.year_level}` : ''}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
                                <Chip 
                                    label={user.role.toUpperCase()} 
                                    color="primary" 
                                    sx={{ fontWeight: 'bold' }} 
                                />

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {studentProfile?.year_level === '4th Year' && user.role === 'student' && (
                                        <>
                                            {applicationStatus === 'pending' ? (
                                                <Button 
                                                    variant="contained" 
                                                    color="warning" 
                                                    disabled 
                                                    size="small"
                                                    sx={{ '&.Mui-disabled': { bgcolor: '#fff3e0', color: '#ef6c00', border: '1px solid #ff9800'} }}
                                                >
                                                    Under Review
                                                </Button>
                                            ) : (
                                                <Link href={route('mentor.apply')}>
                                                    <Button variant="contained" color="secondary" size="small">
                                                        Apply Mentor
                                                    </Button>
                                                </Link>
                                            )}
                                        </>
                                    )}

                                    <Link href={route('profile.edit')}>
                                        <Button variant="outlined" startIcon={<EditIcon />} size="small">
                                            Settings
                                        </Button>
                                    </Link>
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        {/* TABS NAVIGATION */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                            <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                                <Tab icon={<PersonIcon />} iconPosition="start" label="My Info" sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }} />
                                <Tab icon={<RateReviewIcon />} iconPosition="start" label={`My Reviews (${myReviews.length})`} sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }} />
                                {/* Conditional Tab for Mentors Only */}
                                {user.role === 'mentor' && (
                                    <Tab icon={<StarIcon />} iconPosition="start" label={`My Ratings (${mentorRatings.length})`} sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }} />
                                )}
                            </Tabs>
                        </Box>

                        {/* TAB 1: MY INFO */}
                        {tabIndex === 0 && (
                            <Box>
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <PersonIcon color="action" sx={{ mr: 1 }} />
                                        <Typography variant="h6" fontWeight="bold">About Me</Typography>
                                    </Box>
                                    
                                    <Box sx={{ bgcolor: '#f9fafb', p: 3, borderRadius: 2 }}>
                                        <Typography variant="body1" color="text.secondary" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                            {studentProfile?.bio || "No bio added yet. Go to Settings to add one!"}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <StarIcon color="action" sx={{ mr: 1 }} />
                                        <Typography variant="h6" fontWeight="bold">My Skills & Competencies</Typography>
                                    </Box>

                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderStyle: mySkills?.length > 0 ? 'solid' : 'dashed' }}>
                                        {mySkills && mySkills.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {mySkills.map((skill) => (
                                                    <Chip
                                                        key={skill.id}
                                                        label={`${skill.name} • ${skill.rating}/5`}
                                                        color={getSkillColor(skill.rating)}
                                                        variant={skill.rating >= 4 ? 'filled' : 'outlined'}
                                                        sx={{ fontWeight: '500' }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    You haven't assessed any skills yet.
                                                </Typography>
                                                <Link href={route('skills.assess')}>
                                                    <Button size="small" variant="contained" color="primary">
                                                        Take Skill Assessment
                                                    </Button>
                                                </Link>
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            </Box>
                        )}

                        {/* TAB 2: MY REVIEWS (Written BY user) */}
                        {tabIndex === 1 && (
                            <Box>
                                {myReviews.length > 0 ? (
                                    <Stack spacing={3}>
                                        {myReviews.map(review => (
                                            <Paper key={review.review_id} variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#fafafa' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Avatar 
                                                            src={review.mentor?.avatar_url}
                                                            sx={{ bgcolor: 'primary.light' }}
                                                        >
                                                            {review.mentor?.fname?.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                Review for {review.mentor?.fname} {review.mentor?.lname}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Button 
                                                        component={Link} 
                                                        href={route('student.reviews.edit', { review: review.review_id, source: 'profile' })}
                                                        variant="outlined" 
                                                        size="small" 
                                                        startIcon={<EditIcon />}
                                                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', bgcolor: 'white' }}
                                                    >
                                                        Edit
                                                    </Button>
                                                </Box>
                                                
                                                <Rating value={review.rating} readOnly sx={{ mb: 1 }} />
                                                
                                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                                    {review.review_text || <span style={{ fontStyle: 'italic', color: 'gray' }}>No written text provided.</span>}
                                                </Typography>

                                                {/* IMAGE RENDER & +OVERLAY LOGIC (TAB 1) */}
                                                {review.images && review.images.length > 0 && (
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                        {review.images.slice(0, 3).map((img, idx) => (
                                                            <Box 
                                                                key={img.revimage_id} 
                                                                onClick={() => handleOpenCarousel(review.images, idx)}
                                                                sx={{ 
                                                                    position: 'relative', width: 90, height: 90, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0',
                                                                    cursor: 'pointer', '&:hover': { opacity: 0.8 } 
                                                                }}>
                                                                <img 
                                                                    src={`/storage/${img.image_path}`} 
                                                                    alt="review upload" 
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                                />
                                                                
                                                                {/* Show the +N overlay on the 3rd image if there are more than 3 */}
                                                                {idx === 2 && review.images.length > 3 && (
                                                                    <Box sx={{ 
                                                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                                                        bgcolor: 'rgba(0,0,0,0.6)', color: 'white', 
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                                        fontWeight: 'bold', fontSize: '1.5rem' 
                                                                    }}>
                                                                        +{review.images.length - 3}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Box sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '2px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
                                        <RateReviewIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" fontWeight="bold">
                                            No Reviews Yet
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled">
                                            When you finish a mentorship and leave a review, it will appear here.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* TAB 3: MY RATINGS (Written ABOUT user - Mentors Only) */}
                        {tabIndex === 2 && user.role === 'mentor' && (
                            <Box>
                                {/* Average Rating Header */}
                                <Paper sx={{ p: 2, mb: 2, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="h2" fontWeight="bold" color="primary.main">
                                        {mentorProfile?.my_rating ? Number(mentorProfile.my_rating).toFixed(1) : '0.0'}
                                    </Typography>
                                    <Rating value={Number(mentorProfile?.my_rating || 0)} readOnly precision={0.5} size="large" sx={{ my: 1 }} />
                                    <Typography variant="subtitle1" color="text.secondary" fontWeight="bold">
                                        Overall Mentor Rating
                                    </Typography>
                                </Paper>

                                {mentorRatings.length > 0 ? (
                                    <Stack spacing={3}>
                                        {mentorRatings.map(rating => (
                                            <Paper key={rating.review_id} variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#ffffff' }}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                                    <Avatar 
                                                        src={rating.student?.avatar_url}
                                                        sx={{ bgcolor: 'secondary.main' }}
                                                    >
                                                        {rating.student?.fname?.charAt(0)}</Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {rating.student?.fname} {rating.student?.lname}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(rating.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Rating value={rating.rating} readOnly sx={{ mb: 1 }} />
                                                
                                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                                                    {rating.review_text || <span style={{ fontStyle: 'italic', color: 'gray' }}>No written text provided.</span>}
                                                </Typography>

                                                {/* IMAGE RENDER FOR MENTOR TO SEE (TAB 2) */}
                                                {rating.images && rating.images.length > 0 && (
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                        {rating.images.slice(0, 3).map((img, idx) => (
                                                            <Box 
                                                                key={img.revimage_id} 
                                                                onClick={() => handleOpenCarousel(rating.images, idx)}
                                                                sx={{ 
                                                                    position: 'relative', width: 90, height: 90, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0',
                                                                    cursor: 'pointer', '&:hover': { opacity: 0.8 } 
                                                                }}>
                                                                <img 
                                                                    src={`/storage/${img.image_path}`} 
                                                                    alt="review upload" 
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                                />
                                                                {idx === 2 && rating.images.length > 3 && (
                                                                    <Box sx={{ 
                                                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                                                        bgcolor: 'rgba(0,0,0,0.6)', color: 'white', 
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                                        fontWeight: 'bold', fontSize: '1.5rem' 
                                                                    }}>
                                                                        +{rating.images.length - 3}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Box sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '2px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
                                        <StarIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" fontWeight="bold">
                                            No Mentee Ratings Yet
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled">
                                            When your mentees finish a relationship and leave a review, it will show up here.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                    </CardContent>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
}