import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Paper, Typography, Box, Button, Grid, 
    List, ListItem, ListItemButton, ListItemText, Chip,
    Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import SchoolIcon from '@mui/icons-material/School';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function MentorshipRequests({ auth, requests }) {
    const [selectedRequest, setSelectedRequest] = useState(requests[0] || null);
    
    // Dialog States
    const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleActionClick = (type) => {
        setActionType(type);
        setDialogOpen(true);
    };

    const confirmAction = () => {
        if (actionType === 'approve') {
            router.patch(route('mentor.requests.approve', selectedRequest.id), {}, {
                onSuccess: () => {
                    setDialogOpen(false);
                    if (selectedRequest) setSelectedRequest({ ...selectedRequest, status: 'Approved' });
                }
            });
        } else if (actionType === 'reject') {
            router.patch(route('mentor.requests.reject', selectedRequest.id), {}, {
                onSuccess: () => {
                    setDialogOpen(false);
                    if (selectedRequest) setSelectedRequest({ ...selectedRequest, status: 'Rejected' });
                }
            });
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Pending': return <Chip size="small" icon={<AccessTimeFilledIcon />} label="Pending" color="warning" />;
            case 'Approved': return <Chip size="small" icon={<CheckCircleIcon />} label="Approved" color="success" />;
            case 'Rejected': return <Chip size="small" icon={<BlockIcon />} label="Rejected" color="error" />;
            case 'Cancelled': return <Chip size="small" label="Cancelled by Student" color="default" />;
            default: return <Chip size="small" label={status} />;
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Incoming Mentorship Requests" />

            <Container maxWidth="xl" sx={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', py: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ mb: 1 }}>
                        <Link href={route('mentor.dashboard')}>
                            <Button startIcon={<ArrowBackIcon />} color="inherit" size="small" sx={{ ml: -1, textTransform: 'none' }}>
                                Back to Dashboard
                            </Button>
                        </Link>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">Mentorship Requests</Typography>
                </Box>

                <Grid container spacing={3} sx={{ height: '100%', flexWrap: 'nowrap' }}>
                    
                    {/* LEFT COLUMN: List of Requests */}
                    <Grid item sx={{ width: '400px', flexShrink: 0, height: '100%' }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
                                <Typography variant="h6" fontWeight="bold">Applicant Inbox</Typography>
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
                                                {req.student_name.charAt(0)}
                                            </Avatar>
                                            <ListItemText 
                                                primary={
                                                    <Typography fontWeight={selectedRequest?.id === req.id ? 'bold' : 'medium'}>
                                                        {req.student_name}
                                                    </Typography>
                                                } 
                                                secondary={<Typography variant="caption" color="text.secondary">{req.created_at}</Typography>}
                                            />
                                            {getStatusChip(req.status)}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                {requests.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>You have no incoming requests.</Typography>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Application Details */}
                    <Grid item sx={{ flexGrow: 1, height: '100%', minWidth: 0 }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            {selectedRequest ? (
                                <>
                                    {/* Header Info */}
                                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: 1, borderColor: 'divider' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                src={selectedRequest.avatar_url}
                                                sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.8rem' }}
                                                >
                                                {selectedRequest.student_name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h4" fontWeight="bold">
                                                    {selectedRequest.student_name}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <SchoolIcon sx={{ fontSize: 18, mr: 0.5 }} /> {selectedRequest.student_program} • {selectedRequest.student_year}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" color="text.secondary" mb={1}>Request Status</Typography>
                                            {getStatusChip(selectedRequest.status)}
                                        </Box>
                                    </Box>

                                    {/* Body Scrollable Area (FIXED WIDTH) */}
                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 4, bgcolor: '#fbfcfd' }}>
                                        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                                            <Stack spacing={4}>
                                                
                                                {/* Section 1: Student Bio */}
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                                                        Student Bio
                                                    </Typography>
                                                    <Typography variant="body1" color="text.secondary" fontStyle="italic" sx={{ fontSize: '1.1rem' }}>
                                                        "{selectedRequest.student_bio}"
                                                    </Typography>
                                                </Box>

                                                {/* Section 2: Current Skills */}
                                                <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                    <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <AutoAwesomeIcon sx={{ mr: 1 }} /> Current Skills
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" mb={3}>
                                                        This student's self-assessed skill levels prior to requesting mentorship:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {selectedRequest.skills.length > 0 ? (
                                                            selectedRequest.skills
                                                                .sort((a, b) => b.rating - a.rating)
                                                                .map((skill, idx) => (
                                                                    <Chip 
                                                                        key={idx} 
                                                                        label={`${skill.name} (${skill.rating}/5)`} 
                                                                        size="medium"
                                                                        variant="outlined"
                                                                        color="info"
                                                                        sx={{ px: 1, py: 2, borderRadius: 2, fontWeight: 'medium' }}
                                                                    />
                                                                ))
                                                        ) : (
                                                            <Typography variant="caption" color="text.disabled">No skills recorded.</Typography>
                                                        )}
                                                    </Box>
                                                </Paper>

                                                {/* Section 3: Application Explanation (Moved to Bottom) */}
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <PersonSearchIcon sx={{ mr: 1 }} /> Application Explanation
                                                    </Typography>
                                                    <Paper variant="outlined" sx={{ p: 4, bgcolor: '#ffffff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '1.05rem' }}>
                                                            "{selectedRequest.explanation}"
                                                        </Typography>
                                                    </Paper>
                                                </Box>

                                            </Stack>
                                        </Box>
                                    </Box>

                                    {/* Footer Actions */}
                                    <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: '#fafafa', borderRadius: '0 0 12px 12px', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        {selectedRequest.status === 'Pending' ? (
                                            <>
                                                <Button 
                                                    variant="outlined" 
                                                    color="error" 
                                                    startIcon={<BlockIcon />}
                                                    onClick={() => handleActionClick('reject')}
                                                    sx={{ textTransform: 'none', borderRadius: 2, px: 3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                                >
                                                    Decline
                                                </Button>
                                                <Button 
                                                    variant="contained" 
                                                    color="success" 
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => handleActionClick('approve')}
                                                    sx={{ textTransform: 'none', borderRadius: 2, px: 3, boxShadow: 2 }}
                                                >
                                                    Approve Mentorship
                                                </Button>
                                            </>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                You have already {selectedRequest.status.toLowerCase()} this application.
                                            </Typography>
                                        )}
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#f8fafc', borderRadius: 3 }}>
                                    <Typography color="text.secondary">Select an application from the inbox to review.</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Confirmation Modal */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color={actionType === 'approve' ? 'success.main' : 'error.main'}>
                    {actionType === 'approve' ? 'Approve Mentorship?' : 'Decline Request?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionType === 'approve' 
                            ? `Are you sure you want to accept ${selectedRequest?.student_name} as your mentee? This will create an active session for the current semester.` 
                            : `Are you sure you want to decline ${selectedRequest?.student_name}'s request? They will be notified.`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={confirmAction} variant="contained" color={actionType === 'approve' ? 'success' : 'error'}>
                        {actionType === 'approve' ? 'Yes, Approve' : 'Yes, Decline'}
                    </Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}