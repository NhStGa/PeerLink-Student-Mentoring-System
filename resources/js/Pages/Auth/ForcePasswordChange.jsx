import { Head, useForm } from '@inertiajs/react';
import { 
    Container, Box, Typography, TextField, 
    Button, Paper, Stack, InputAdornment, Avatar 
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
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f5f9' }}>
            <Head title="Security Update Required" />

            <Container maxWidth="sm">
                <Paper elevation={4} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, textAlign: 'center' }}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <Avatar sx={{ bgcolor: 'error.light', width: 64, height: 64 }}>
                            <LockResetIcon fontSize="large" sx={{ color: 'white' }} />
                        </Avatar>
                    </Box>

                    <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
                        Action Required
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, px: { xs: 0, sm: 2 } }}>
                        Change your default system password before accessing your dashboard. Please choose a strong and secure password.
                    </Typography>

                    <form onSubmit={submit}>
                        <Stack spacing={3}>
                            <TextField
                                type="password"
                                label="New Password"
                                fullWidth
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
                            />

                            <TextField
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
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="large" 
                                disabled={processing}
                                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
                            >
                                Secure My Account
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}