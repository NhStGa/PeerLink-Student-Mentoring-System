import { Head, useForm } from '@inertiajs/react';
import { 
    Container, Box, Typography, TextField, 
    Button, Paper, InputAdornment 
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

export default function ForcePasswordChange() {
    const { data, setData, put, processing, errors } = useForm({
        current_password: 'P2PSys2026', // Pre-filled for convenience!
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('password.update'));
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
            <Head title="Security Update Required" />

            {/* UPDATED: Changed maxWidth to "xs" to match Login page */}
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    
                    {/* UPDATED: Icon and Title side-by-side matching the Login layout */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <LockResetIcon color="error" sx={{ fontSize: 36 }} />
                        <Typography component="h1" variant="h5" fontWeight="bold" color="error.main">
                            Action Required
                        </Typography>
                    </Box>
                    
                    {/* UPDATED: Formatted subtitle to match Login styling */}
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Change your default system password before accessing your dashboard. Please choose a strong and secure password.
                    </Typography>

                    <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            type="password"
                            label="New Password"
                            fullWidth
                            autoFocus
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <VpnKeyIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <TextField
                            margin="normal"
                            type="password"
                            label="Confirm New Password"
                            fullWidth
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            error={!!errors.password_confirmation}
                            helperText={errors.password_confirmation}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <VpnKeyIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        {/* UPDATED: Button styled identically to Login button */}
                        <Button 
                            type="submit" 
                            fullWidth
                            variant="contained" 
                            disabled={processing}
                            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                        >
                            Secure My Account
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}