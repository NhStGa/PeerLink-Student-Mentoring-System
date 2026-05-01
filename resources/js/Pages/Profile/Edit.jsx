import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateAcademicInfoForm from './Partials/UpdateAcademicInfoForm'; 
import UpdateProfilePicture from './Partials/UpdateProfilePicture'; 
import { Head, Link } from '@inertiajs/react';
import { Button, Container, Box, Typography, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Edit({ auth, mustVerifyEmail, status, studentProfile }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Profile Settings" />

            {/* UPDATED: Changed maxWidth from "lg" to "md" to match the Profile view */}
            <Container maxWidth="md" sx={{ py: 2 }}>
                
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Profile Settings
                    </Typography>
                    <Link href={route('profile.show')}>
                        <Button 
                            variant="outlined" 
                            startIcon={<ArrowBackIcon />}
                            size="small"
                            sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                            Back to Profile
                        </Button>
                    </Link>
                </Box>

                <div className="space-y-6">
                    
                    {/* Profile Picture Upload Component placed inside the flow */}
                    <UpdateProfilePicture />

                    {/* 1. Profile Introduction (Bio Only) */}
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <UpdateAcademicInfoForm
                            studentProfile={studentProfile}
                            className="max-w-xl"
                        />
                    </Paper>

                    {/* 2. Change Password */}
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <UpdatePasswordForm className="max-w-xl" />
                    </Paper>

                    {/* 3. Delete Account */}
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <DeleteUserForm className="max-w-xl" />
                    </Paper>
                </div>

            </Container>
        </AuthenticatedLayout>
    );
}