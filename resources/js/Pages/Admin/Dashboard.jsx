import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Select, MenuItem, 
    FormControl, Chip, Typography, Button, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, 
    InputLabel, Container, Stack, Alert, IconButton, 
    ListSubheader, DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminDashboard({ auth, users, pendingApplications = [], departments = [] }) {
    // Modal States
    const [openModal, setOpenModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        fname: '', lname: '', mi: '', email: '',
        student_number: '', year_level: '', program_id: '', role: 'student', status: 'active'
    });

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

    const getStatusColor = (status) => {
        if (status === 'Approved' || status === 'Active' || status === 'active') return 'success';
        if (status === 'Pending') return 'warning';
        if (status === 'Suspended' || status === 'suspended') return 'error';
        return 'default';
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <Container maxWidth="xl" sx={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', py: 3 }}>
                
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

                {/* SECTION 2: Master User List */}
                <Paper sx={{ width: '100%', flex: 1, overflow: 'hidden', p: 3, display: 'flex', flexDirection: 'column' }}>
                    <div className="flex justify-between items-center mb-4">
                        <Typography variant="h6" component="div" fontWeight="bold">Master User List</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                            Create Account
                        </Button>
                    </div>
                    
                    <TableContainer sx={{ flexGrow: 1 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
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
                                {users.map((user) => (
                                    <TableRow hover key={user.id}>
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
                                            <IconButton size="small" color="info" onClick={() => handleOpenEdit(user)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => setUserToDelete(user)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && <TableRow><TableCell colSpan={10} align="center">No users found.</TableCell></TableRow>}
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

                            {/* UPDATED: Grouped Program Selector using database relations */}
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