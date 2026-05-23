import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups'; // NEW: Imported the Groups Icon!

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false, 
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
        <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                
                // NEW: Background Image with a dark overlay!
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url('/images/auth-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <Head title="Log in" />

            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    
                    {/* UPDATED: Added the Logo and Title side-by-side */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <GroupsIcon color="primary" sx={{ fontSize: 36 }} />
                        <Typography component="h1" variant="h5" fontWeight="bold" color="primary.main">
                            Student P2P Mentoring
                        </Typography>
                    </Box>
                    
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Sign in to continue
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        {/* Forgot Password Link */}
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

                        {/* Login Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={processing}
                            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                        >
                            Log in
                        </Button>

                        {/* Find Account Section */}
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
        </Box>
    );
}