import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Grid, Paper, Avatar, 
    Button, Chip, Divider, Dialog, DialogTitle, DialogContent, 
    DialogActions, IconButton, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';

export default function MentorsList({ auth, activeMentors = [], previousMentors = [] }) {
    
    // Modal States
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);

    const handleOpenModal = (mentor) => { 
        document.activeElement?.blur();
        setSelectedMentor(mentor); 
        setOpenModal(true); 
    };

    const handleCloseModal = () => { 
        setOpenModal(false); 
        setTimeout(() => setSelectedMentor(null), 200); 
    };

    // UPDATED: Handle Review Button Click
    const handleViewReview = (mentor) => {
        if (mentor.review_id) {
            // They have a review -> Go to Info Page
            router.visit(route('student.reviews.info', mentor.review_id));
        } else {
            // They DON'T have a review -> Go to Create Form, passing the relationship ID
            router.visit(route('student.reviews.create', { mentor: mentor.id, relationship: mentor.relationship_id }));
        }
    };

    const confirmTerminate = () => {
        router.patch(route('student.relationships.terminate', selectedMentor.relationship_id), {}, {
            onSuccess: () => { setTerminateDialogOpen(false); handleCloseModal(); }
        });
    };

    // Reusable Card Component for both sections
    const MentorCard = ({ mentor, isActive }) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Paper 
                sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    boxShadow: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: isActive ? 1 : 0.85,
                    bgcolor: isActive ? 'white' : '#f8fafc',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                        src={mentor.avatar_url}
                        sx={{ width: 56, height: 56, bgcolor: isActive ? 'primary.main' : 'grey.500', mr: 2 }}
                        >
                        {mentor.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                            {mentor.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {mentor.program}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 2, flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        {isActive ? `Started: ${mentor.started_at}` : `Ended: ${mentor.ended_at}`}
                    </Typography>
                    
                    {/* Status Chip */}
                    {mentor.status === 'Terminated' && <Chip label="Terminated" size="small" color="error" variant="outlined" icon={<BlockIcon />} sx={{ fontWeight: 'bold' }} />}
                    {mentor.status === 'Completed' && <Chip label="Completed" size="small" color="success" variant="outlined" icon={<WorkspacePremiumIcon />} sx={{ fontWeight: 'bold' }} />}
                    {isActive && <Chip label="Active Mentor" size="small" color="primary" sx={{ fontWeight: 'bold' }} />}
                </Box>

                <Stack spacing={1}>
                    <Button 
                        variant={isActive ? "contained" : "outlined"} 
                        color={isActive ? "primary" : "inherit"}
                        fullWidth 
                        onClick={() => handleOpenModal(mentor)}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                    >
                        View Details
                    </Button>
                    
                    {/* UPDATED: Dynamic Review Button for Past Mentors */}
                    {!isActive && (
                        <Button 
                            variant={mentor.review_id ? "outlined" : "contained"} 
                            color={mentor.review_id ? "secondary" : "warning"}
                            fullWidth 
                            startIcon={mentor.review_id ? <RateReviewIcon /> : <EditIcon />}
                            onClick={() => handleViewReview(mentor)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', borderWidth: mentor.review_id ? 2 : 0, '&:hover': { borderWidth: mentor.review_id ? 2 : 0 } }}
                        >
                            {mentor.review_id ? "My Review" : "Write a Review"}
                        </Button>
                    )}
                </Stack>
            </Paper>
        </Grid>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Mentors" />

            <Container maxWidth="xl" sx={{ py: 2, minHeight: '100vh' }}>
                
                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Link href={route('student.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        Mentor Roster
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your current mentors and view your past mentorship history.
                    </Typography>
                </Box>

                {/* --- ACTIVE MENTORS SECTION --- */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <VerifiedIcon color="primary" />
                        <Typography variant="h5" fontWeight="bold">Active Mentors</Typography>
                        <Chip label={activeMentors.length} color="primary" size="small" sx={{ fontWeight: 'bold', ml: 1 }} />
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        {activeMentors.length > 0 ? (
                            activeMentors.map(mentor => <MentorCard key={mentor.id} mentor={mentor} isActive={true} />)
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 3 }}>
                                    <Typography variant="h6" color="text.secondary">You don't have any active mentors right now.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* --- PREVIOUS MENTORS SECTION --- */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <SchoolIcon color="action" />
                        <Typography variant="h5" fontWeight="bold" color="text.secondary">Previous Mentors</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        {previousMentors.length > 0 ? (
                            previousMentors.map(mentor => <MentorCard key={mentor.relationship_id} mentor={mentor} isActive={false} />)
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 3 }}>
                                    <Typography variant="body1" color="text.secondary">No historical mentors found.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>

            </Container>

            {/* MENTOR PROFILE MODAL */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth scroll="paper">
                {selectedMentor && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: selectedMentor.status === 'Active' ? 'primary.main' : 'grey.500', fontSize: '1.8rem' }}>
                                    {selectedMentor.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{selectedMentor.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {selectedMentor.program} • {selectedMentor.year_level}
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={handleCloseModal} sx={{ color: 'text.secondary', mt: -1, mr: -1 }}><CloseIcon /></IconButton>
                        </DialogTitle>
                        
                        <DialogContent dividers sx={{ p: 4 }}>
                            <Stack spacing={4}>
                                {/* Show Status if not active */}
                                {selectedMentor.status !== 'Active' && (
                                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Relationship Status:</Typography>
                                        {selectedMentor.status === 'Terminated' ? (
                                            <Chip label="Terminated" color="error" size="small" icon={<BlockIcon />} sx={{ fontWeight: 'bold' }} />
                                        ) : (
                                            <Chip label="Completed" color="success" size="small" icon={<WorkspacePremiumIcon />} sx={{ fontWeight: 'bold' }} />
                                        )}
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom>About Your Mentor</Typography>
                                    <Typography variant="body1" fontStyle="italic">"{selectedMentor.bio}"</Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 18, mr: 0.5 }} /> Mastered Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedMentor.skills.length > 0 ? (
                                            selectedMentor.skills.sort((a, b) => b.rating - a.rating).map((skill, idx) => (
                                                <Chip key={idx} label={`${skill.name} (${skill.rating}/5)`} color="primary" variant="outlined" />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No skills recorded.</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        
                        {/* ONLY Show Action Buttons if they are Active */}
                        {selectedMentor.status === 'Active' ? (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={() => setTerminateDialogOpen(true)} color="error" variant="outlined" startIcon={<PersonRemoveIcon />} sx={{ textTransform: 'none', borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                                    Terminate Mentorship
                                </Button>
                            </DialogActions>
                        ) : (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
                                <Button onClick={handleCloseModal} color="inherit" size="large">Close</Button>
                            </DialogActions>
                        )}
                    </>
                )}
            </Dialog>

            <Dialog open={terminateDialogOpen} onClose={() => setTerminateDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error.main">Terminate Mentorship?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to terminate your mentorship with <strong>{selectedMentor?.name}</strong>? This action will immediately end the active session and remove them from your active mentors list.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setTerminateDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmTerminate} variant="contained" color="error">Yes, Terminate</Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}