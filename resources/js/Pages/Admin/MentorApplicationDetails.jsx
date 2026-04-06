import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { 
    Container, Paper, Typography, Grid, Box, Button, Divider, Chip, Avatar 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';

export default function MentorApplicationDetails({ auth, application }) {
    
    const handleApprove = () => {
        if(confirm('Are you sure you want to APPROVE this user as a Mentor?')) {
            router.patch(route('admin.mentor.approve', application.id));
        }
    };

    const handleReject = () => {
        if(confirm('Are you sure you want to REJECT this application?')) {
            router.patch(route('admin.mentor.reject', application.id));
        }
    };

    // Helper for rows
    const DetailRow = ({ label, value }) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
                {label.toUpperCase()}
            </Typography>
            <Typography variant="body1">
                {value}
            </Typography>
        </Box>
    );

    const getSkillColor = (rating) => {
        if (rating >= 4) return 'success'; 
        if (rating === 3) return 'primary';
        return 'default';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Review Application" />

            <Container 
                maxWidth="md" 
                sx={{ 
                    height: 'calc(100vh - 112px)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    py: 3 
                }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        borderRadius: 2,
                        flex: 1, 
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header Navigation */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Link href={route('admin.dashboard')}>
                            <Button startIcon={<ArrowBackIcon />} color="inherit" size="small">
                                Back
                            </Button>
                        </Link>
                        <Typography variant="h5" fontWeight="bold">
                            Application Review
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Applicant Header with Avatar */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            {/* NEW: Profile Picture Avatar */}
                            <Avatar 
                                src={application.applicant.avatar_url}
                                sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2.5rem' }}
                            >
                                {application.applicant.full_name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 0.5 }}>
                                    {application.applicant.full_name}
                                </Typography>
                                <Chip 
                                    label={application.status.toUpperCase()} 
                                    color={application.status === 'pending' ? 'warning' : application.status === 'approved' ? 'success' : 'error'} 
                                    size="small" 
                                />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Applied on: {application.created_at}
                        </Typography>
                    </Box>

                    {/* SECTION 1: Applicant Information (Top Section) */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                            Applicant Information
                        </Typography>
                        
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <DetailRow label="Student Number" value={application.applicant.student_number} />
                                <DetailRow label="Program" value={application.applicant.program} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DetailRow label="Year Level" value={application.applicant.year_level} />
                                <DetailRow label="Email Address" value={application.applicant.email} />
                            </Grid>
                        </Grid>

                        {/* Skills Row */}
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <StarIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Assessed Skills
                                </Typography>
                            </Box>
                            
                            {application.applicant.skills && application.applicant.skills.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {application.applicant.skills.map((skill) => (
                                        <Chip
                                            key={skill.id}
                                            label={`${skill.name} (${skill.rating}/5)`}
                                            color={getSkillColor(skill.rating)}
                                            size="small"
                                            variant={skill.rating >= 4 ? 'filled' : 'outlined'}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No skills assessed yet.
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* SECTION 2: Motivation (Fills Remaining Space) */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                            Motivation
                        </Typography>
                        <Paper 
                            variant="outlined" 
                            sx={{ 
                                p: 3, 
                                bgcolor: '#f9fafb', 
                                flex: 1, // This forces the paper to take all remaining height
                                overflowY: 'auto' // Adds scroll inside the motivation box if text is very long
                            }}
                        >
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {application.motivation}
                            </Typography>
                        </Paper>
                    </Box>

                    {/* Action Buttons (Fixed at bottom) */}
                    {application.status === 'pending' && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                startIcon={<CancelIcon />}
                                onClick={handleReject}
                            >
                                Reject Application
                            </Button>
                            <Button 
                                variant="contained" 
                                color="success" 
                                startIcon={<CheckCircleIcon />}
                                onClick={handleApprove}
                            >
                                Approve Request
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}