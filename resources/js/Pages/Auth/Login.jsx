import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
} from '@mui/material';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false, // Kept in state for backend compatibility, but removed from UI
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Sign in to Student Peer Mentoring
                    </Typography>

                    {status && (
                        <Typography color="success.main" sx={{ mb: 2 }}>
                            {status}
                        </Typography>
                    )}

                    <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                        />

                        {/* Forgot Password Link (Right Aligned) */}
                        {canResetPassword && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Link href={route('password.request')} style={{ textDecoration: 'none' }}>
                                    <Typography 
                                        variant="body2" 
                                        color="primary" 
                                        sx={{ fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Forgot password?
                                    </Typography>
                                </Link>
                            </Box>
                        )}

                        {/* Login Button (Full Width) */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={processing}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Log in
                        </Button>

                        {/* Find Account Section (Centered Bottom) */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link href={route('account.finder')} style={{ textDecoration: 'none' }}>
                                    <Typography 
                                        component="span" 
                                        variant="body2" 
                                        color="primary" 
                                        sx={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }}
                                    >
                                        Find your account
                                    </Typography>
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </GuestLayout>
    );
}