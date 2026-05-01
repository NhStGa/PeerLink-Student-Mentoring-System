import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Container, Paper, Typography, Box, Button, Grid, IconButton,
    List, ListItem, ListItemButton, ListItemText, Divider, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Stack, DialogContentText, Tabs, Tab, MenuItem, FormControlLabel, Switch
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DomainIcon from '@mui/icons-material/Domain';
import StarIcon from '@mui/icons-material/Star';

export default function AcademicStatusManagement({ auth, semesters, departments }) {
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState(departments[0] || null);

    // Keep UI synced after server updates
    useEffect(() => {
        if (selectedDepartment) {
            const freshDept = departments.find(d => d.department_id === selectedDepartment.department_id);
            setSelectedDepartment(freshDept || (departments.length > 0 ? departments[0] : null));
        } else if (departments.length > 0) {
            setSelectedDepartment(departments[0]);
        }
    }, [departments]);

    // ==================== SEMESTER STATE ====================
    const [openSemModal, setOpenSemModal] = useState(false);
    const [editingSemId, setEditingSemId] = useState(null);
    const [semToDelete, setSemToDelete] = useState(null);
    
    const { data: semData, setData: setSemData, post: postSem, put: putSem, processing: procSem, errors: errSem, reset: resetSem, clearErrors: clearErrSem } = useForm({
        name: '', term: '1st Semester', start_date: '', end_date: '', is_current: false
    });

    const handleOpenSemModal = (sem = null) => {
        clearErrSem();
        if (sem) {
            setEditingSemId(sem.semester_id);
            // Format dates for the date input type (YYYY-MM-DD)
            setSemData({
                name: sem.name, term: sem.term, is_current: sem.is_current,
                start_date: sem.start_date ? sem.start_date.split('T')[0] : '', 
                end_date: sem.end_date ? sem.end_date.split('T')[0] : ''
            });
        } else {
            setEditingSemId(null);
            resetSem();
        }
        setOpenSemModal(true);
    };

    const handleSemSubmit = (e) => {
        e.preventDefault();
        if (editingSemId) {
            putSem(route('admin.academic.semesters.update', editingSemId), { onSuccess: () => setOpenSemModal(false) });
        } else {
            postSem(route('admin.academic.semesters.store'), { onSuccess: () => setOpenSemModal(false) });
        }
    };

    // ==================== DEPARTMENT STATE ====================
    const [openDeptModal, setOpenDeptModal] = useState(false);
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [deptToDelete, setDeptToDelete] = useState(null);

    const { data: deptData, setData: setDeptData, post: postDept, put: putDept, processing: procDept, errors: errDept, reset: resetDept, clearErrors: clearErrDept } = useForm({
        name: '', code: ''
    });

    const handleOpenDeptModal = (dept = null) => {
        clearErrDept();
        if (dept) {
            setEditingDeptId(dept.department_id);
            setDeptData({ name: dept.name, code: dept.code });
        } else {
            setEditingDeptId(null);
            resetDept();
        }
        setOpenDeptModal(true);
    };

    const handleDeptSubmit = (e) => {
        e.preventDefault();
        if (editingDeptId) {
            putDept(route('admin.academic.departments.update', editingDeptId), { onSuccess: () => setOpenDeptModal(false) });
        } else {
            postDept(route('admin.academic.departments.store'), { onSuccess: () => setOpenDeptModal(false) });
        }
    };

    // ==================== PROGRAM STATE ====================
    const [openProgModal, setOpenProgModal] = useState(false);
    const [editingProgId, setEditingProgId] = useState(null);
    const [progToDelete, setProgToDelete] = useState(null);

    const { data: progData, setData: setProgData, post: postProg, put: putProg, processing: procProg, errors: errProg, reset: resetProg, clearErrors: clearErrProg } = useForm({
        department_id: '', name: '', code: '', degree_level: 'Bachelor'
    });

    const handleOpenProgModal = (prog = null) => {
        clearErrProg();
        if (prog) {
            setEditingProgId(prog.program_id);
            setProgData({ department_id: selectedDepartment.department_id, name: prog.name, code: prog.code, degree_level: prog.degree_level });
        } else {
            setEditingProgId(null);
            setProgData({ department_id: selectedDepartment.department_id, name: '', code: '', degree_level: 'Bachelor' });
        }
        setOpenProgModal(true);
    };

    const handleProgSubmit = (e) => {
        e.preventDefault();
        if (editingProgId) {
            putProg(route('admin.academic.programs.update', editingProgId), { onSuccess: () => setOpenProgModal(false) });
        } else {
            postProg(route('admin.academic.programs.store'), { onSuccess: () => setOpenProgModal(false) });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Academic Status" />

            <Container maxWidth="xl" sx={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', py: 2 }}>
                
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ mb: 1 }}>
                        <Link href={route('dashboard')}>
                            <Button startIcon={<ArrowBackIcon />} color="inherit" size="small" sx={{ ml: -1, textTransform: 'none' }}>Back to Dashboard</Button>
                        </Link>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">Academic Status Management</Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
                        <Tab label="Semesters" fontWeight="bold" />
                        <Tab label="Departments & Programs" fontWeight="bold" />
                    </Tabs>
                </Box>

                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    
                    {/* TAB 1: SEMESTERS */}
                    {tabIndex === 0 && (
                        <Paper sx={{ p: 3, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">Manage Semesters</Typography>
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenSemModal()}>Add Semester</Button>
                            </Box>
                            
                            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                <Grid container spacing={2}>
                                    {semesters.map(sem => (
                                        <Grid item xs={12} md={6} lg={4} key={sem.semester_id}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: sem.is_current ? 'primary.main' : 'divider', borderWidth: sem.is_current ? 2 : 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box>
                                                        {sem.is_current && <Chip icon={<StarIcon />} label="Current Semester" color="primary" size="small" sx={{ mb: 1 }} />}
                                                        <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>{sem.name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{sem.term}</Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                            {new Date(sem.start_date).toLocaleDateString()} - {new Date(sem.end_date).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex' }}>
                                                        <IconButton size="small" onClick={() => handleOpenSemModal(sem)}><EditIcon fontSize="small" color="info" /></IconButton>
                                                        <IconButton size="small" onClick={() => setSemToDelete(sem)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Paper>
                    )}

                    {/* TAB 2: DEPARTMENTS & PROGRAMS */}
                    {tabIndex === 1 && (
                        <Grid container spacing={3} sx={{ height: '100%', flexWrap: 'nowrap' }}>
                            
                            {/* Left: Departments */}
                            <Grid item sx={{ width: '400px', flexShrink: 0, height: '100%' }}>
                                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                        <Typography variant="h6" fontWeight="bold">Departments</Typography>
                                        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDeptModal()}>
                                            Add
                                        </Button>
                                    </Box>
                                    
                                    {/* UPDATED: Department Cards Stack */}
                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {departments.map((dept) => {
                                            const isSelected = selectedDepartment?.department_id === dept.department_id;
                                            
                                            return (
                                                <Paper 
                                                    key={dept.department_id}
                                                    variant="outlined" 
                                                    onClick={() => setSelectedDepartment(dept)}
                                                    sx={{ 
                                                        minHeight: 180, // Fixed size to match structure 
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                                        borderWidth: isSelected ? 2 : 1,
                                                        '&:hover': { boxShadow: 2, borderColor: 'primary.main' }
                                                    }}
                                                >
                                                    {/* CARD HEADER: Department Code */}
                                                    <Box sx={{ bgcolor: isSelected ? '#bbdefb' : '#e3f2fd', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" noWrap>
                                                            {dept.code}
                                                        </Typography>
                                                    </Box>

                                                    {/* CARD BODY: Department Name */}
                                                    <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'flex-start' }}>
                                                        <Typography 
                                                            variant="body2" 
                                                            fontWeight="medium" 
                                                            sx={{ 
                                                                display: '-webkit-box',
                                                                WebkitBoxOrient: 'vertical',
                                                                WebkitLineClamp: 2, 
                                                                overflow: 'hidden',
                                                                lineHeight: 1.4,
                                                                width: '100%'
                                                            }}
                                                        >
                                                            {dept.name}
                                                        </Typography>
                                                    </Box>

                                                    <Divider />

                                                    {/* CARD FOOTER: Action Buttons */}
                                                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: '#fafafa' }}>
                                                        <Button 
                                                            size="small" 
                                                            startIcon={<EditIcon />} 
                                                            // Stop propagation prevents the click from selecting the card
                                                            onClick={(e) => { e.stopPropagation(); handleOpenDeptModal(dept); }}
                                                            sx={{ textTransform: 'none' }}
                                                            color="info"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            startIcon={<DeleteIcon />} 
                                                            onClick={(e) => { e.stopPropagation(); setDeptToDelete(dept); }}
                                                            sx={{ textTransform: 'none' }}
                                                            color="error"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Box>
                                                </Paper>
                                            );
                                        })}

                                        {departments.length === 0 && (
                                            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                                                No departments found.
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Right: Programs */}
                            <Grid item sx={{ flexGrow: 1, height: '100%', minWidth: 0 }}>
                                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                                    {selectedDepartment ? (
                                        <>
                                            {/* Header of the Right Column */}
                                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider', borderRadius: '12px 12px 0 0' }}>
                                                <Box>
                                                    <Typography variant="h5" fontWeight="bold" color="primary">{selectedDepartment.code} Programs</Typography>
                                                    <Typography variant="body2" color="text.secondary">{selectedDepartment.name}</Typography>
                                                </Box>
                                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenProgModal()} sx={{ textTransform: 'none' }}>
                                                    Add Program
                                                </Button>
                                            </Box>

                                            {/* Scrollable Area for Program Cards */}
                                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                                                
                                                {/* UPDATED: Changed from MUI Grid to strict CSS Grid for perfectly uniform cards */}
                                                <Box sx={{ 
                                                    display: 'grid', 
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                                                    gap: 2 
                                                }}>
                                                    {selectedDepartment.programs && selectedDepartment.programs.map((prog) => (
                                                        <Paper 
                                                            key={prog.program_id}
                                                            variant="outlined" 
                                                            sx={{ 
                                                                height: 180, // FIXED HEIGHT
                                                                display: 'flex', 
                                                                flexDirection: 'column',
                                                                borderRadius: 2,
                                                                overflow: 'hidden',
                                                                transition: '0.2s',
                                                                '&:hover': { boxShadow: 2, borderColor: 'primary.main' }
                                                            }}
                                                        >
                                                            {/* CARD HEADER: Program Code */}
                                                            <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                                                                <Typography variant="subtitle2" fontWeight="bold" color="primary.main" noWrap>
                                                                    {prog.code}
                                                                </Typography>
                                                            </Box>

                                                            {/* CARD BODY: Program Name */}
                                                            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'flex-start' }}>
                                                                <Typography 
                                                                    variant="body2" 
                                                                    fontWeight="medium" 
                                                                    sx={{ 
                                                                        display: '-webkit-box',
                                                                        WebkitBoxOrient: 'vertical',
                                                                        WebkitLineClamp: 3, // Allows up to 3 lines before adding "..."
                                                                        overflow: 'hidden',
                                                                        lineHeight: 1.4,
                                                                        width: '100%' // Protects the flex width constraint
                                                                    }}
                                                                >
                                                                    {prog.name}
                                                                </Typography>
                                                            </Box>

                                                            <Divider />

                                                            {/* CARD FOOTER: Action Buttons */}
                                                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: '#fafafa' }}>
                                                                <Button 
                                                                    size="small" 
                                                                    startIcon={<EditIcon />} 
                                                                    onClick={() => handleOpenProgModal(prog)}
                                                                    sx={{ textTransform: 'none' }}
                                                                    color="info"
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button 
                                                                    size="small" 
                                                                    startIcon={<DeleteIcon />} 
                                                                    onClick={() => setProgToDelete(prog)}
                                                                    sx={{ textTransform: 'none' }}
                                                                    color="error"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </Box>
                                                        </Paper>
                                                    ))}
                                                </Box>

                                                {(!selectedDepartment.programs || selectedDepartment.programs.length === 0) && (
                                                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                                                        <Typography color="text.secondary">No programs found in this department.</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#f8fafc', borderRadius: 3 }}>
                                            <Typography color="text.secondary">Select a department to view programs.</Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Container>

            {/* MODALS FOR SEMESTERS */}
            <Dialog open={openSemModal} onClose={() => setOpenSemModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">{editingSemId ? 'Edit Semester' : 'Add Semester'}</DialogTitle>
                <form onSubmit={handleSemSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField label="Name (e.g. A.Y. 2026-2027)" fullWidth required value={semData.name} onChange={e => setSemData('name', e.target.value)} error={!!errSem.name} helperText={errSem.name} />
                            <TextField select label="Term" fullWidth required value={semData.term} onChange={e => setSemData('term', e.target.value)}>
                                {['1st Semester', '2nd Semester', 'Summer'].map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                            </TextField>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField label="Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth required value={semData.start_date} onChange={e => setSemData('start_date', e.target.value)} error={!!errSem.start_date} helperText={errSem.start_date} />
                                <TextField label="End Date" type="date" InputLabelProps={{ shrink: true }} fullWidth required value={semData.end_date} onChange={e => setSemData('end_date', e.target.value)} error={!!errSem.end_date} helperText={errSem.end_date} />
                            </Box>
                            <FormControlLabel control={<Switch checked={semData.is_current} onChange={e => setSemData('is_current', e.target.checked)} color="primary" />} label="Set as Current Semester" />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenSemModal(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={procSem}>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={!!semToDelete} onClose={() => setSemToDelete(null)}>
                <DialogTitle color="error" fontWeight="bold">Delete Semester?</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to delete {semToDelete?.name}?</DialogContentText></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setSemToDelete(null)} color="inherit">Cancel</Button>
                    <Button onClick={() => { router.delete(route('admin.academic.semesters.destroy', semToDelete.semester_id)); setSemToDelete(null); }} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* MODALS FOR DEPARTMENTS */}
            <Dialog open={openDeptModal} onClose={() => setOpenDeptModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">{editingDeptId ? 'Edit Department' : 'Add Department'}</DialogTitle>
                <form onSubmit={handleDeptSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField label="Code (e.g. SITE)" fullWidth required value={deptData.code} onChange={e => setDeptData('code', e.target.value)} error={!!errDept.code} helperText={errDept.code} />
                            <TextField label="Department Name" fullWidth required value={deptData.name} onChange={e => setDeptData('name', e.target.value)} error={!!errDept.name} helperText={errDept.name} />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenDeptModal(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={procDept}>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={!!deptToDelete} onClose={() => setDeptToDelete(null)}>
                <DialogTitle color="error" fontWeight="bold">Delete Department?</DialogTitle>
                <DialogContent><DialogContentText>Deleting {deptToDelete?.code} will also delete all of its programs. Are you sure?</DialogContentText></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeptToDelete(null)} color="inherit">Cancel</Button>
                    <Button onClick={() => { router.delete(route('admin.academic.departments.destroy', deptToDelete.department_id)); setDeptToDelete(null); }} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* MODALS FOR PROGRAMS */}
            <Dialog open={openProgModal} onClose={() => setOpenProgModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">{editingProgId ? 'Edit Program' : `Add Program to ${selectedDepartment?.code}`}</DialogTitle>
                <form onSubmit={handleProgSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField label="Program Code (e.g. BSCS)" fullWidth required value={progData.code} onChange={e => setProgData('code', e.target.value)} error={!!errProg.code} helperText={errProg.code} />
                            <TextField label="Program Name" fullWidth required value={progData.name} onChange={e => setProgData('name', e.target.value)} error={!!errProg.name} helperText={errProg.name} />
                            <TextField select label="Degree Level" fullWidth required value={progData.degree_level} onChange={e => setProgData('degree_level', e.target.value)}>
                                {['Diploma', 'Bachelor', 'Master', 'Doctorate'].map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpenProgModal(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={procProg}>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={!!progToDelete} onClose={() => setProgToDelete(null)}>
                <DialogTitle color="error" fontWeight="bold">Delete Program?</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to delete {progToDelete?.code}?</DialogContentText></DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setProgToDelete(null)} color="inherit">Cancel</Button>
                    <Button onClick={() => { router.delete(route('admin.academic.programs.destroy', progToDelete.program_id)); setProgToDelete(null); }} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}