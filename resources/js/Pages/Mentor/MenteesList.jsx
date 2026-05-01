import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Grid, Paper, Avatar, 
    Button, Chip, Divider, Dialog, DialogTitle, DialogContent, 
    DialogActions, IconButton, Stack, Snackbar, Alert // NEW: Imported Snackbar & Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BlockIcon from '@mui/icons-material/Block';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RateReviewIcon from '@mui/icons-material/RateReview'; // NEW: Icon for reviews
import VerifiedIcon from '@mui/icons-material/Verified';

export default function MenteesList({ auth, activeMentees = [], previousMentees = [] }) {
    
    // Modal States
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false); 
    
    // NEW: Snackbar state for missing reviews
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleOpenModal = (mentee) => { 
        document.activeElement?.blur();
        setSelectedMentee(mentee); 
        setOpenModal(true); 
    };

    const handleCloseModal = () => { 
        setOpenModal(false); 
        setTimeout(() => setSelectedMentee(null), 200); 
    };

    // NEW: Handle Review Button Click
    const handleViewReview = (mentee) => {
        if (mentee.review_id) {
            router.visit(route('mentor.reviews.show', mentee.review_id));
        } else {
            setSnackbarOpen(true);
        }
    };

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

    // Reusable Card Component
    const MenteeCard = ({ mentee, isActive }) => (
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
                        src={mentee.avatar_url}
                        sx={{ width: 56, height: 56, bgcolor: isActive ? 'primary.main' : 'grey.500', mr: 2 }}
                        >
                        {mentee.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                            {mentee.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {mentee.program}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mb: 2, flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        {isActive ? `Started: ${mentee.started_at}` : `Ended: ${mentee.ended_at}`}
                    </Typography>
                    
                    {/* Status Chip */}
                    {mentee.status === 'Terminated' && <Chip label="Terminated" size="small" color="error" variant="outlined" icon={<BlockIcon />} sx={{ fontWeight: 'bold' }} />}
                    {mentee.status === 'Completed' && <Chip label="Completed" size="small" color="success" variant="outlined" icon={<WorkspacePremiumIcon />} sx={{ fontWeight: 'bold' }} />}
                    {isActive && <Chip label="Active Student" size="small" color="primary" sx={{ fontWeight: 'bold' }} />}
                </Box>

                <Stack spacing={1}>
                    <Button 
                        variant={isActive ? "contained" : "outlined"} 
                        color={isActive ? "primary" : "inherit"}
                        fullWidth 
                        onClick={() => handleOpenModal(mentee)}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
                    >
                        View Details
                    </Button>
                    
                    {/* NEW: View Review Button */}
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        fullWidth 
                        startIcon={<RateReviewIcon />}
                        onClick={() => handleViewReview(mentee)}
                        sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                        View Review
                    </Button>
                </Stack>
            </Paper>
        </Grid>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Mentees" />

            <Container maxWidth="xl" sx={{ py: 2, minHeight: '100vh' }}>
                
                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Link href={route('mentor.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        Mentee Roster
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your current students and view your past mentorship history.
                    </Typography>
                </Box>

                {/* --- ACTIVE MENTEES SECTION --- */}
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <VerifiedIcon color="primary" />
                        <Typography variant="h5" fontWeight="bold">Active Mentees</Typography>
                        <Chip label={activeMentees.length} color="primary" size="small" sx={{ fontWeight: 'bold', ml: 1 }} />
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        {activeMentees.length > 0 ? (
                            activeMentees.map(mentee => <MenteeCard key={mentee.id} mentee={mentee} isActive={true} />)
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 3 }}>
                                    <Typography variant="h6" color="text.secondary">You have no active mentees right now.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* --- PREVIOUS MENTEES SECTION --- */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <SchoolIcon color="action" />
                        <Typography variant="h5" fontWeight="bold" color="text.secondary">Previous Mentees</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        {previousMentees.length > 0 ? (
                            previousMentees.map(mentee => <MenteeCard key={mentee.relationship_id} mentee={mentee} isActive={false} />)
                        ) : (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 3 }}>
                                    <Typography variant="body1" color="text.secondary">No historical mentees found.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Box>

            </Container>

            {/* NEW: Missing Review Snackbar Popup */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={4000} 
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 'bold' }}>
                    No Mentee Review Created yet.
                </Alert>
            </Snackbar>

            {/* MENTEE PROFILE MODALS */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth scroll="paper">
                {selectedMentee && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                    src={selectedMentee.avatar_url}
                                    sx={{ width: 64, height: 64, bgcolor: selectedMentee.status === 'Active' ? 'primary.main' : 'grey.500', fontSize: '1.8rem' }}
                                    >
                                    {selectedMentee.name.charAt(0)}
                                </Avatar>
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
                                {/* Show Status if not active */}
                                {selectedMentee.status !== 'Active' && (
                                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Relationship Status:</Typography>
                                        {selectedMentee.status === 'Terminated' ? (
                                            <Chip label="Terminated" color="error" size="small" icon={<BlockIcon />} sx={{ fontWeight: 'bold' }} />
                                        ) : (
                                            <Chip label="Completed" color="success" size="small" icon={<WorkspacePremiumIcon />} sx={{ fontWeight: 'bold' }} />
                                        )}
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom>Mentee Bio</Typography>
                                    <Typography variant="body1" fontStyle="italic">"{selectedMentee.bio}"</Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 18, mr: 0.5 }} /> Current Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {selectedMentee.skills.length > 0 ? (
                                            selectedMentee.skills.sort((a, b) => b.rating - a.rating).map((skill, idx) => (
                                                <Chip key={idx} label={`${skill.name} (${skill.rating}/5)`} color="info" variant="outlined" />
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No skills recorded.</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        
                        {/* ONLY Show Action Buttons if they are Active */}
                        {selectedMentee.status === 'Active' ? (
                            <DialogActions sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Button onClick={() => setTerminateDialogOpen(true)} color="error" variant="outlined" startIcon={<PersonRemoveIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>Terminate</Button>
                                <Button onClick={() => setCompleteDialogOpen(true)} color="success" variant="contained" startIcon={<TaskAltIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>Mark Completed</Button>
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