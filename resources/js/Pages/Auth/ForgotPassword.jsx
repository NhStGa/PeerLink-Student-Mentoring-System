import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { 
    Box, TextField, Button, Typography, 
    Container, Paper, InputAdornment 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';

export default function ForgotPassword() {
    // State to track if we are verifying (1) or resetting (2)
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        student_number: '',
        password: '',
        password_confirmation: '',
    });

    // STEP 1: Verification Handler
    const handleVerify = (e) => {
        e.preventDefault();
        post(route('password.verify'), {
            onSuccess: (page) => {
                // If there are no errors from the backend, move to Step 2!
                if (Object.keys(page.props.errors).length === 0) {
                    setStep(2);
                }
            }
        });
    };

    // STEP 2: Reset Handler
    const handleReset = (e) => {
        e.preventDefault();
        post(route('password.custom_reset'), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ mt: 1, p: 4, borderRadius: 3 }}>
                    
                    <Box sx={{ mb: 3 }}>
                        <Link href={route('login')} style={{ textDecoration: 'none' }}>
                            <Button startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', ml: -1, color: 'text.secondary' }}>
                                Back to Login
                            </Button>
                        </Link>
                    </Box>

                    <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
                        {step === 1 ? 'Find Your Account' : 'Create New Password'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {step === 1 
                            ? 'Enter your registered email and student number to verify your identity.' 
                            : 'Identity verified! Please enter your new password below.'}
                    </Typography>

                    {/* --- STEP 1: VERIFICATION FORM --- */}
                    {step === 1 && (
                        <Box component="form" onSubmit={handleVerify}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Student Number"
                                value={data.student_number}
                                onChange={(e) => setData('student_number', e.target.value)}
                                error={!!errors.student_number}
                                helperText={errors.student_number}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>,
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={processing}
                                sx={{ mt: 2, py: 1.5}}
                            >
                                Submit
                            </Button>
                        </Box>
                    )}

                    {/* --- STEP 2: NEW PASSWORD FORM --- */}
                    {step === 2 && (
                        <Box component="form" onSubmit={handleReset}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                type="password"
                                label="New Password"
                                autoFocus
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><VpnKeyIcon color="action" /></InputAdornment>,
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                type="password"
                                label="Confirm New Password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><VpnKeyIcon color="action" /></InputAdornment>,
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="success"
                                disabled={processing}
                                sx={{ mt: 4, py: 1.5}}
                            >
                                Reset My Password
                            </Button>
                        </Box>
                    )}

                </Paper>
            </Container>
        </GuestLayout>
    );
}