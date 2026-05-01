import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Paper, Typography, Box, Button, Grid, 
    List, ListItem, ListItemButton, ListItemText, Divider, Chip,
    Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

export default function MentorshipRequests({ auth, requests }) {
    const [selectedRequest, setSelectedRequest] = useState(requests[0] || null);
    const [requestToCancel, setRequestToCancel] = useState(null);

    const confirmCancel = () => {
        router.patch(route('student.mentorship.cancel', requestToCancel.id), {}, {
            onSuccess: () => {
                setRequestToCancel(null);
                // Update the local selected request state so the UI refreshes instantly
                if (selectedRequest && selectedRequest.id === requestToCancel.id) {
                    setSelectedRequest({ ...selectedRequest, status: 'Cancelled' });
                }
            }
        });
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Pending': return <Chip size="small" icon={<AccessTimeFilledIcon />} label="Pending" color="warning" />;
            case 'Approved': return <Chip size="small" icon={<CheckCircleIcon />} label="Approved" color="success" />;
            case 'Rejected': return <Chip size="small" icon={<BlockIcon />} label="Rejected" color="error" />;
            case 'Cancelled': return <Chip size="small" icon={<CancelIcon />} label="Cancelled" color="default" />;
            default: return <Chip size="small" label={status} />;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Mentorship Requests" />

            <Container maxWidth="xl" sx={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', py: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ mb: 1 }}>
                        <Link href={route('student.dashboard')}>
                            <Button startIcon={<ArrowBackIcon />} color="inherit" size="small" sx={{ ml: -1, textTransform: 'none' }}>
                                Back to Dashboard
                            </Button>
                        </Link>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">My Mentorship Requests</Typography>
                </Box>

                <Grid container spacing={3} sx={{ height: '100%', flexWrap: 'nowrap' }}>
                    
                    {/* LEFT COLUMN: List of Requests */}
                    <Grid item sx={{ width: '400px', flexShrink: 0, height: '100%' }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
                                <Typography variant="h6" fontWeight="bold">Application History</Typography>
                            </Box>
                            
                            <List disablePadding sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                                {requests.map((req) => (
                                    <ListItem key={req.id} disablePadding sx={{ mb: 1 }}>
                                        <ListItemButton 
                                            selected={selectedRequest?.id === req.id} 
                                            onClick={() => setSelectedRequest(req)} 
                                            sx={{ 
                                                borderRadius: 2, 
                                                border: '1px solid',
                                                borderColor: selectedRequest?.id === req.id ? 'primary.main' : 'divider',
                                                bgcolor: selectedRequest?.id === req.id ? '#e3f2fd' : 'transparent'
                                            }}
                                        >
                                            <Avatar 
                                                src={req.avatar_url}
                                                sx={{ width: 40, height: 40, mr: 2, bgcolor: selectedRequest?.id === req.id ? 'primary.main' : 'grey.400' }}
                                                >
                                                {req.mentor_name.charAt(0)}
                                            </Avatar>
                                            <ListItemText 
                                                primary={
                                                    <Typography fontWeight={selectedRequest?.id === req.id ? 'bold' : 'medium'}>
                                                        {req.mentor_name}
                                                    </Typography>
                                                } 
                                                secondary={<Typography variant="caption" color="text.secondary">{req.created_at}</Typography>}
                                            />
                                            {getStatusChip(req.status)}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                {requests.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>You have not sent any mentorship requests.</Typography>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Request Details */}
                    <Grid item sx={{ flexGrow: 1, height: '100%', minWidth: 0 }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            {selectedRequest ? (
                                <>
                                    {/* Header */}
                                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: 1, borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            
                                            {/* NEW: Added the big Avatar for the selected mentor! */}
                                            <Avatar 
                                                src={selectedRequest.avatar_url} 
                                                sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.8rem' }}
                                            >
                                                {selectedRequest.mentor_name.charAt(0)}
                                            </Avatar>
                                            
                                            <Box>
                                                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                                                    Application Details
                                                </Typography>
                                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                                    {selectedRequest.mentor_name}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    Applied on: {selectedRequest.created_at}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" color="text.secondary" mb={1}>Current Status</Typography>
                                            {getStatusChip(selectedRequest.status)}
                                        </Box>
                                    </Box>

                                    {/* Body */}
                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4 }}>
                                        <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                                            Your Explanation / Motivation
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                                "{selectedRequest.explanation}"
                                            </Typography>
                                        </Paper>
                                    </Box>

                                    {/* Footer / Actions */}
                                    <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: '#fafafa', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'flex-end' }}>
                                        {selectedRequest.status === 'Pending' ? (
                                            <Button 
                                                variant="outlined" 
                                                color="error" 
                                                startIcon={<CancelIcon />}
                                                onClick={() => setRequestToCancel(selectedRequest)}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Cancel Application
                                            </Button>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                This application has been {selectedRequest.status.toLowerCase()}.
                                            </Typography>
                                        )}
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#f8fafc', borderRadius: 3 }}>
                                    <Typography color="text.secondary">Select an application from the list to view its details.</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Cancel Warning Modal */}
            <Dialog open={!!requestToCancel} onClose={() => setRequestToCancel(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error">Cancel Request?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel your mentorship request to <strong>{requestToCancel?.mentor_name}</strong>? You will have to submit a new application if you change your mind.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRequestToCancel(null)} color="inherit">Go Back</Button>
                    <Button onClick={confirmCancel} variant="contained" color="error">Yes, Cancel Request</Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}