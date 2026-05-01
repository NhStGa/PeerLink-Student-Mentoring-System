import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Select, MenuItem, 
    FormControl, Chip, Typography, Button, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, 
    InputLabel, Container, Stack, Alert, IconButton, 
    ListSubheader, DialogContentText, Checkbox, Box, 
    Menu, Divider, InputBase, Grid, Card, CardContent, Tooltip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SchoolIcon from '@mui/icons-material/School';
import LockResetIcon from '@mui/icons-material/LockReset';

export default function AdminDashboard({ auth, users, pendingApplications = [], departments = [] }) {
    // Modal States
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    
    // Reset Password State
    const [userToReset, setUserToReset] = useState(null);

    // Bulk Update & Quick Select States
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [bulkYearLevel, setBulkYearLevel] = useState('');
    const [quickSelectAnchor, setQuickSelectAnchor] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        fname: '', lname: '', mi: '', email: '',
        student_number: '', year_level: '', program_id: '', role: 'student', status: 'active'
    });

    // --- Dynamic Stats Calculations ---
    const totalUsers = users.length;
    const totalActive = users.filter(u => u.status.toLowerCase() === 'active').length;
    const totalMentors = users.filter(u => u.role.toLowerCase() === 'mentor').length;

    // --- Real-time Search Filter ---
    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        
        const fullName = (user.full_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const studentNo = (user.student_number || '').toLowerCase();
        const program = (user.program_code || '').toLowerCase();
        const year = (user.year_level || '').toLowerCase();
        const role = (user.role || '').toLowerCase();
        const mentorStatus = (user.is_approved || '').toLowerCase();
        const accountStatus = (user.account_status || '').toLowerCase();

        return (
            fullName.includes(query) ||
            email.includes(query) ||
            studentNo.includes(query) ||
            program.includes(query) ||
            year.includes(query) ||
            role.includes(query) ||
            mentorStatus.includes(query) ||
            accountStatus.includes(query)
        );
    });

    // --- Bulk Selection Handlers ---
    const handleSelectAll = (event) => {
        const visibleIds = filteredUsers.map(u => u.id);
        
        if (event.target.checked) {
            const newSelections = Array.from(new Set([...selectedUserIds, ...visibleIds]));
            setSelectedUserIds(newSelections);
        } else {
            setSelectedUserIds(selectedUserIds.filter(id => !visibleIds.includes(id)));
        }
    };

    const handleSelectOne = (event, id) => {
        if (event.target.checked) {
            setSelectedUserIds(prev => [...prev, id]);
        } else {
            setSelectedUserIds(prev => prev.filter(userId => userId !== id));
        }
    };

    const handleQuickSelect = (yearLevel) => {
        const idsToSelect = filteredUsers.filter(u => u.year_level === yearLevel).map(u => u.id);
        const newSelections = Array.from(new Set([...selectedUserIds, ...idsToSelect]));
        setSelectedUserIds(newSelections);
        setQuickSelectAnchor(null); 
    };

    const handleBulkUpdate = () => {
        if (!bulkYearLevel || selectedUserIds.length === 0) return;
        
        router.patch(route('admin.users.bulk_year'), {
            user_ids: selectedUserIds,
            year_level: bulkYearLevel
        }, {
            onSuccess: () => {
                setSelectedUserIds([]); 
                setBulkYearLevel('');
            }
        });
    };

    // --- Modal Handlers ---
    const handleOpenCreate = () => {
        clearErrors();
        reset();
        setIsEditMode(false);
        setEditingUserId(null);
        setOpenModal(true);
    };

    const handleOpenEdit = (user) => {
        clearErrors();
        setIsEditMode(true);
        setEditingUserId(user.id);
        setData({
            fname: user.fname || '',
            lname: user.lname || '',
            mi: user.mi || '',
            email: user.email || '',
            student_number: user.student_number || '',
            year_level: user.year_level || '',
            program_id: user.program_id || '',
            role: user.role || 'student',
            status: user.status || 'active'
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            patch(route('admin.users.update', editingUserId), { onSuccess: () => handleCloseModal() });
        } else {
            post(route('admin.users.store'), { onSuccess: () => handleCloseModal() });
        }
    };

    const confirmDelete = () => {
        router.delete(route('admin.users.destroy', userToDelete.id), {
            onSuccess: () => setUserToDelete(null),
        });
    };

    // Handle Password Reset
    const confirmResetPassword = () => {
        router.patch(route('admin.users.reset_password', userToReset.id), {}, {
            onSuccess: () => setUserToReset(null),
        });
    };

    const getStatusColor = (status) => {
        if (status === 'Approved' || status === 'Active' || status === 'active') return 'success';
        if (status === 'Pending') return 'warning';
        if (status === 'Suspended' || status === 'suspended') return 'error';
        return 'default';
    };

    const isAllVisibleSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id));
    const isSomeVisibleSelected = filteredUsers.some(u => selectedUserIds.includes(u.id)) && !isAllVisibleSelected;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            {/* UPDATED: Changed height to minHeight so it doesn't squish the content */}
            <Container maxWidth="xl" sx={{ minHeight: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', py: 2 }}>
                
                {/* SECTION 1: Pending Applications */}
                <Paper sx={{ width: '100%', mb: 3, p: 2, borderLeft: '6px solid #ed6c02', flexShrink: 0 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#ed6c02', fontWeight: 'bold' }}>
                        ⚠ Pending Mentor Applications
                    </Typography>
                    <TableContainer sx={{ maxHeight: 200 }}> 
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Student Name</strong></TableCell>
                                    <TableCell><strong>Program</strong></TableCell>
                                    <TableCell><strong>Motivation</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingApplications.length > 0 ? (
                                    pendingApplications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{app.applicant_name}</TableCell>
                                            <TableCell>
                                                <Chip label={app.program} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 400 }}>
                                                <Typography variant="body2" noWrap title={app.motivation}>{app.motivation}</Typography>
                                            </TableCell>
                                            <TableCell>{app.date}</TableCell>
                                            <TableCell align="right">
                                                <Button component={Link} href={route('admin.mentor.show', app.id)} size="small" variant="contained" color="info" sx={{ textTransform: 'none' }}>
                                                    View Request
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography color="textSecondary" sx={{ py: 2, fontStyle: 'italic' }}>No pending applications found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* System Overview Counter Cards */}
                <Grid container spacing={3} sx={{ mb: 3, flexShrink: 0, margin: 'auto', paddingBottom: '20px' }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #1976d2' }}>
                            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, display: 'flex', mr: 2 }}>
                                <GroupIcon color="primary" fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                    Total User Accounts
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.dark">
                                    {totalUsers}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', p: 2, borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #2e7d32' }}>
                            <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, display: 'flex', mr: 2 }}>
                                <VerifiedUserIcon color="success" fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                    Active Accounts
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.dark">
                                    {totalActive}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ display: 'flex', alignItems: 'center', textAlign: 'center', p: 2, borderRadius: 3, boxShadow: 2, borderLeft: '6px solid #9c27b0' }}>
                            <Box sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2, display: 'flex', mr: 2 }}>
                                <SchoolIcon color="secondary" fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                    Total Mentors
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ color: '#7b1fa2' }}>
                                    {totalMentors}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {/* SECTION 2: Master User List */}
                {/* UPDATED: Increased minHeight to 750px */}
                <Paper sx={{ width: '100%', minHeight: '750px', flex: 1, overflow: 'hidden', p: 3, display: 'flex', flexDirection: 'column'}}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" component="div" fontWeight="bold">Master User List</Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            
                            {/* Custom Seamless Search Bar */}
                            <Paper
                                variant="outlined"
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    width: { xs: '100%', md: 300 }, 
                                    bgcolor: 'white', 
                                    borderRadius: 2, 
                                    borderColor: 'divider',
                                    '&:focus-within': { 
                                        borderColor: 'primary.main', 
                                        boxShadow: '0 0 0 1px #1976d2' 
                                    } 
                                }}
                            >
                                <IconButton sx={{ p: 1, pointerEvents: 'none' }}>
                                    <SearchIcon color="action" />
                                </IconButton>
                                <InputBase
                                    sx={{ ml: 1, flex: 1, py: 0.5 }}
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Paper>

                            {/* Quick Select Dropdown Menu */}
                            <Button 
                                variant="outlined" 
                                onClick={(e) => setQuickSelectAnchor(e.currentTarget)}
                                sx={{ textTransform: 'none', fontWeight: 'bold', height: 40 }}
                            >
                                Quick Select ▼
                            </Button>
                            <Menu
                                anchorEl={quickSelectAnchor}
                                open={Boolean(quickSelectAnchor)}
                                onClose={() => setQuickSelectAnchor(null)}
                            >
                                <MenuItem onClick={() => handleQuickSelect('1st Year')}>Select 1st Years</MenuItem>
                                <MenuItem onClick={() => handleQuickSelect('2nd Year')}>Select 2nd Years</MenuItem>
                                <MenuItem onClick={() => handleQuickSelect('3rd Year')}>Select 3rd Years</MenuItem>
                                <MenuItem onClick={() => handleQuickSelect('4th Year')}>Select 4th Years</MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { setSelectedUserIds([]); setQuickSelectAnchor(null); }} sx={{ color: 'error.main' }}>
                                    Clear All Selections
                                </MenuItem>
                            </Menu>

                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ height: 40 }}>
                                Create Account
                            </Button>
                        </Box>
                    </Box>

                    {/* Bulk Action Toolbar */}
                    {selectedUserIds.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ flexGrow: 1, ml: 1 }}>
                                {selectedUserIds.length} user(s) selected
                            </Typography>
                            
                            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
                                <InputLabel id="bulk-year-label">Promote/Set Year Level</InputLabel>
                                <Select 
                                    labelId="bulk-year-label" 
                                    label="Promote/Set Year Level" 
                                    value={bulkYearLevel} 
                                    onChange={(e) => setBulkYearLevel(e.target.value)}
                                >
                                    <MenuItem value="1st Year">1st Year</MenuItem>
                                    <MenuItem value="2nd Year">2nd Year</MenuItem>
                                    <MenuItem value="3rd Year">3rd Year</MenuItem>
                                    <MenuItem value="4th Year">4th Year</MenuItem>
                                    <MenuItem value="Graduated">Graduated (Set Inactive)</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleBulkUpdate} 
                                disabled={!bulkYearLevel}
                            >
                                Apply Bulk Update
                            </Button>
                        </Box>
                    )}
                    
                    <TableContainer sx={{ flexGrow: 1 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            color="primary"
                                            indeterminate={isSomeVisibleSelected}
                                            checked={isAllVisibleSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </TableCell>
                                    <TableCell><strong>ID</strong></TableCell>
                                    <TableCell><strong>Full Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Student No.</strong></TableCell>
                                    <TableCell><strong>Program</strong></TableCell>
                                    <TableCell><strong>Year</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Mentor Status</strong></TableCell>
                                    <TableCell><strong>Acct Status</strong></TableCell>
                                    <TableCell align="right"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow hover key={user.id} selected={selectedUserIds.includes(user.id)}>
                                        <TableCell padding="checkbox">
                                            <Checkbox 
                                                color="primary"
                                                checked={selectedUserIds.includes(user.id)}
                                                onChange={(e) => handleSelectOne(e, user.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{user.full_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.student_number || '-'}</TableCell>
                                        <TableCell>
                                            {user.program_code !== '-' ? <Chip label={user.program_code} size="small" variant="outlined" /> : '-'}
                                        </TableCell>
                                        <TableCell>{user.year_level || '-'}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={user.role.toUpperCase()} 
                                                color={user.role === 'admin' ? 'error' : user.role === 'mentor' ? 'primary' : 'default'} 
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {user.role === 'mentor' ? (
                                                <Chip label={user.is_approved} color={getStatusColor(user.is_approved)} size="small" variant="outlined" />
                                            ) : <span className="text-gray-400">-</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={getStatusColor(user.status)} fontWeight="bold">
                                                {user.account_status}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                {/* Reset Password Button */}
                                                <Tooltip title="Reset Password to Default">
                                                    <IconButton size="small" color="warning" onClick={() => setUserToReset(user)}>
                                                        <LockResetIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit User">
                                                    <IconButton size="small" color="info" onClick={() => handleOpenEdit(user)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete User">
                                                    <IconButton size="small" color="error" onClick={() => setUserToDelete(user)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No users found matching "{searchQuery}".
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>

            {/* COMBINED MODAL (CREATE & EDIT) */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">{isEditMode ? 'Edit Account Details' : 'Create New Account'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            
                            {!isEditMode && (
                                <Alert severity="info" variant="outlined" sx={{ fontWeight: 'bold' }}>
                                    Default Password: <span style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>P2PSys2026</span>
                                </Alert>
                            )}

                            <Stack direction="row" spacing={2}>
                                <TextField label="First Name" fullWidth required value={data.fname} onChange={(e) => setData('fname', e.target.value)} error={!!errors.fname} helperText={errors.fname} />
                                <TextField label="Last Name" fullWidth required value={data.lname} onChange={(e) => setData('lname', e.target.value)} error={!!errors.lname} helperText={errors.lname} />
                                <TextField label="M.I." value={data.mi} onChange={(e) => setData('mi', e.target.value)} error={!!errors.mi} inputProps={{ maxLength: 5 }} sx={{ width: '100px' }} />
                            </Stack>
                            
                            <TextField type="email" label="Email Address" fullWidth required value={data.email} onChange={(e) => setData('email', e.target.value)} error={!!errors.email} helperText={errors.email} />

                            <Stack direction="row" spacing={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="role-label">System Role</InputLabel>
                                    <Select labelId="role-label" label="System Role" value={data.role} onChange={(e) => setData('role', e.target.value)}>
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="mentor">Mentor</MenuItem>
                                        <MenuItem value="admin" sx={{ color: 'error.main' }}>Admin</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth>
                                    <InputLabel id="status-label">Account Status</InputLabel>
                                    <Select labelId="status-label" label="Account Status" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                        <MenuItem value="active" sx={{ color: 'success.main' }}>Active</MenuItem>
                                        <MenuItem value="inactive" sx={{ color: 'text.secondary' }}>Inactive</MenuItem>
                                        <MenuItem value="suspended" sx={{ color: 'error.main' }}>Suspended</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack direction="row" spacing={2}>
                                <TextField label="Student Number" fullWidth value={data.student_number} onChange={(e) => setData('student_number', e.target.value)} error={!!errors.student_number} helperText={errors.student_number} />
                                <FormControl fullWidth error={!!errors.year_level}>
                                    <InputLabel id="year-label">Year Level</InputLabel>
                                    <Select labelId="year-label" label="Year Level" value={data.year_level} onChange={(e) => setData('year_level', e.target.value)}>
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        <MenuItem value="1st Year">1st Year</MenuItem>
                                        <MenuItem value="2nd Year">2nd Year</MenuItem>
                                        <MenuItem value="3rd Year">3rd Year</MenuItem>
                                        <MenuItem value="4th Year">4th Year</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <FormControl fullWidth error={!!errors.program_id}>
                                <InputLabel id="program-label">Academic Program</InputLabel>
                                <Select labelId="program-label" label="Academic Program" value={data.program_id} onChange={(e) => setData('program_id', e.target.value)}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {departments.map((dept) => [
                                        <ListSubheader key={`header-${dept.department_id}`} sx={{ fontWeight: 'bold', color: 'primary.main', bgcolor: '#f5f5f5', lineHeight: '36px' }}>
                                            {dept.name} ({dept.code})
                                        </ListSubheader>,
                                        dept.programs.map((prog) => (
                                            <MenuItem key={prog.program_id} value={prog.program_id} sx={{ pl: 4 }}>
                                                {prog.code} - {prog.name}
                                            </MenuItem>
                                        ))
                                    ])}
                                </Select>
                            </FormControl>

                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, bgcolor: '#fafafa' }}>
                        <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={processing}>
                            {isEditMode ? 'Save Changes' : 'Create Account'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* RESET PASSWORD CONFIRMATION MODAL */}
            <Dialog open={!!userToReset} onClose={() => setUserToReset(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="warning.main">Reset Password?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reset the password for <strong>{userToReset?.full_name}</strong> back to the default (<span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>P2PSys2026</span>)? 
                        <br /><br />
                        They will be required to change their password upon their next login.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUserToReset(null)} color="inherit">Cancel</Button>
                    <Button onClick={confirmResetPassword} variant="contained" color="warning">Yes, Reset Password</Button>
                </DialogActions>
            </Dialog>

            {/* DELETE CONFIRMATION MODAL */}
            <Dialog open={!!userToDelete} onClose={() => setUserToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error">Delete User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete the account for <strong>{userToDelete?.full_name}</strong>? This will remove all their data, including profiles and assessments.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setUserToDelete(null)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">Yes, Delete Account</Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}