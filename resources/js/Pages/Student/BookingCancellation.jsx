import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Container, Box, Typography, Paper, TextField, Button, 
    Stack, Divider, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function BookingCancellation({ auth, mentoringSession }) {
    
    const { data, setData, patch, processing, errors } = useForm({
        status_description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Send a PATCH request to our new route
        patch(route('student.sessions.processCancel', mentoringSession.session_id));
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
        return new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cancel Session" />

            <Container maxWidth="md" sx={{ py: 2 }}>
                
                <Box sx={{ mb: 4 }}>
                    <Link href={route('student.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                        Cancel Mentoring Session
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Please provide a brief explanation for why you are cancelling this session.
                    </Typography>
                </Box>

                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3 }}>
                    
                    {/* Session Summary Context */}
                    <Alert severity="warning" icon={<AccessTimeIcon />} sx={{ mb: 4, borderRadius: 2 }}>
                        You are about to cancel your session with <strong>{mentoringSession.mentor?.fname} {mentoringSession.mentor?.lname}</strong> scheduled for <strong>{formatDate(mentoringSession.session_date)}</strong> at <strong>{formatTime(mentoringSession.start_time)}</strong>.
                    </Alert>

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={4}>
                            
                            <TextField
                                fullWidth
                                multiline
                                rows={5}
                                label="Reason for Cancellation"
                                placeholder="e.g., I have a conflicting class schedule, I am feeling unwell, etc."
                                value={data.status_description}
                                onChange={(e) => setData('status_description', e.target.value)}
                                error={!!errors.status_description}
                                helperText={errors.status_description || "This explanation will be shared with your mentor."}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button 
                                    component={Link} 
                                    href={route('student.dashboard')}
                                    color="inherit" 
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Keep Session
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    disabled={processing}
                                    sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    Confirm Cancellation
                                </Button>
                            </Box>

                        </Stack>
                    </form>
                </Paper>

            </Container>
        </AuthenticatedLayout>
    );
}