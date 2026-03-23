import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { 
    Box, 
    Typography, 
    Paper, 
    Container, 
    TextField, 
    Button 
} from '@mui/material';

export default function AccountFinder() {
    const { flash } = usePage().props; // To get the success result
    
    const { data, setData, post, processing, errors } = useForm({
        student_number: '',
        fname: '',
        lname: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('account.find'));
    };

    return (
        <GuestLayout>
            <Head title="Find My Account" />

            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Find My Account
                    </Typography>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                        Enter your student details below to retrieve your account credentials.
                    </Typography>

                    {/* RESULT AREA: Shows if account is found */}
                    {flash?.credentials && (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 3, 
                                mb: 2, 
                                bgcolor: '#e8f5e9', 
                                border: '1px solid #4caf50',
                                borderRadius: 1 
                            }}
                        >
                            <Typography variant="h6" color="success.main" gutterBottom>
                                Account Found!
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Email Address
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {flash.credentials.email}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Default Password
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" fontFamily="monospace">
                                    {flash.credentials.default_password}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button 
                                    component={Link} 
                                    href={route('login')} 
                                    variant="contained" 
                                    color="primary"
                                    fullWidth
                                >
                                    Go to Login Page
                                </Button>
                            </Box>
                        </Paper>
                    )}

                    {/* SEARCH FORM (Hide if result is found) */}
                    {!flash?.credentials && (
                        <Box component="form" onSubmit={submit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="student_number"
                                label="Student Number"
                                name="student_number"
                                autoFocus
                                value={data.student_number}
                                onChange={(e) => setData('student_number', e.target.value)}
                                error={!!errors.student_number}
                                helperText={errors.student_number}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="fname"
                                label="First Name"
                                name="fname"
                                value={data.fname}
                                onChange={(e) => setData('fname', e.target.value)}
                                error={!!errors.fname}
                                helperText={errors.fname}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="lname"
                                label="Last Name"
                                name="lname"
                                value={data.lname}
                                onChange={(e) => setData('lname', e.target.value)}
                                error={!!errors.lname}
                                helperText={errors.lname}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
                                <Link href={route('login')} style={{ textDecoration: 'none' }}>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ '&:hover': { color: 'text.primary' } }}
                                    >
                                        Back to Login
                                    </Typography>
                                </Link>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={processing}
                                >
                                    Find Account
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </GuestLayout>
    );
}