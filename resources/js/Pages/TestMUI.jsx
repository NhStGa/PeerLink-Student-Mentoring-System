import React from 'react';
import { Head } from '@inertiajs/react';
import { 
    Container, 
    Typography, 
    Button, 
    Box, 
    Card, 
    CardContent 
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function TestMUI() {
    return (
        <>
            <Head title="Test MUI" />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        Material UI Test Page
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Testing Material UI components with Laravel Breeze
                    </Typography>
                </Box>

                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Welcome to Student Mentoring System
                        </Typography>
                        <Typography variant="body2" paragraph>
                            This page demonstrates Material UI working with Laravel and Inertia.js
                        </Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<HomeIcon />}
                            sx={{ mt: 2 }}
                        >
                            Get Started
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}