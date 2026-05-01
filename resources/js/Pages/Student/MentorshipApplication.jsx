import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Container, Paper, Typography, Box, Button, TextField, 
    Avatar, Stack, Divider 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';

export default function MentorshipApplication({ auth, mentor }) {
    const { data, setData, post, processing, errors } = useForm({
        explanation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.mentorship.store', mentor.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Apply to Mentor: ${mentor.name}`} />

            <Container maxWidth="md" sx={{ py: 2 }}>
                
                <Box sx={{ mb: 3 }}>
                    <Link href={route('student.find-mentor')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 1, ml: -1 }}>
                            Back to Mentors
                        </Button>
                    </Link>
                </Box>

                <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3 }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                        Mentorship Request
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={4}>
                        Tell your potential mentor what you are trying to achieve and why you want to learn from them.
                    </Typography>

                    {/* Mentor Info Card */}
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Avatar 
                            src={mentor.avatar_url}
                            sx={{ width: 60, height: 60, bgcolor: 'primary.main', mr: 2, fontSize: '1.5rem' }}
                            >
                            {mentor.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase" fontWeight="bold" letterSpacing={1}>
                                Requesting to connect with
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {mentor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <SchoolIcon sx={{ fontSize: 16, mr: 0.5 }} /> {mentor.program} • {mentor.year_level}
                            </Typography>
                        </Box>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={4}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Why do you want this person as your mentor? <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                    Include specific skills you want help with, the current projects or subjects you are struggling with, and your learning goals.
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={6}
                                    placeholder="I am currently taking Advanced Web Development and having trouble understanding component lifecycles..."
                                    value={data.explanation}
                                    onChange={e => setData('explanation', e.target.value)}
                                    error={!!errors.explanation}
                                    helperText={errors.explanation || `${data.explanation.length} characters (min 20)`}
                                    sx={{ bgcolor: '#fff' }}
                                />
                            </Box>

                            <Divider />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button 
                                    component={Link} 
                                    href={route('student.find-mentor')} 
                                    color="inherit" 
                                    size="large"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    size="large" 
                                    endIcon={<SendIcon />}
                                    disabled={processing}
                                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                                >
                                    Submit Request
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}