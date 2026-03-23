import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    Container, 
    Paper, 
    Typography, 
    Box,
    Card,
    CardContent,
    Grid
} from '@mui/material';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
                    Dashboard
                </Typography>
            }
        >
            <Head title="Dashboard" />

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Welcome Card */}
                <Paper sx={{ p: 4, mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Welcome! {auth.user.name}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You're logged in to the Student Peer Mentoring System
                    </Typography>
                </Paper>

                {/* Stats Grid */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    Active Mentees
                                </Typography>
                                <Typography variant="h4">
                                    0
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>
                                    My Sessions
                                </Typography>
                                <Typography variant="h4">
                                    0
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Quick Actions */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Mentoring features here!
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </AuthenticatedLayout>
    );
}