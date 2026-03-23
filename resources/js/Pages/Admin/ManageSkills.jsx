import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // <--- Added router
import { useState, useEffect } from 'react';
import { 
    Container, Paper, Typography, Box, Button, Grid, IconButton,
    List, ListItem, ListItemButton, ListItemText, Divider, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, DialogContentText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit'; // <--- Added Icon
import DeleteIcon from '@mui/icons-material/Delete'; // <--- Added Icon

export default function ManageSkills({ auth, categories }) {
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || null);
    
    // --- Category Modal State ---
    const [openCategoryModal, setOpenCategoryModal] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null); // Track if editing
    const [categoryToDelete, setCategoryToDelete] = useState(null);   // Track category to delete
    
    const { data: catData, setData: setCatData, post: postCat, put: putCat, processing: processingCat, errors: catErrors, reset: resetCat, clearErrors: clearCatErrors } = useForm({
        category_name: '',
    });

    // --- Subject Modal State ---
    const [openSubjectModal, setOpenSubjectModal] = useState(false);
    const [editingSubjectId, setEditingSubjectId] = useState(null); // Track if editing
    const [subjectToDelete, setSubjectToDelete] = useState(null);   // Track subject to delete

    const { data: subData, setData: setSubData, post: postSub, put: putSub, processing: processingSub, errors: subErrors, reset: resetSub, clearErrors: clearSubErrors } = useForm({
        category_id: '',
        skill_code: '',
        skill_name: '',
    });

    // Keep UI synced after server updates
    useEffect(() => {
        if (selectedCategory) {
            const freshCategory = categories.find(c => c.skillcategory_id === selectedCategory.skillcategory_id);
            if (freshCategory) {
                setSelectedCategory(freshCategory);
            } else if (categories.length > 0) {
                setSelectedCategory(categories[0]); // Fallback if category was deleted
            } else {
                setSelectedCategory(null);
            }
        } else if (categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories]);


    // ==========================================
    // CATEGORY HANDLERS
    // ==========================================
    const handleOpenCategoryModal = (category = null) => {
        clearCatErrors();
        if (category) {
            setEditingCategoryId(category.skillcategory_id);
            setCatData('category_name', category.category_name);
        } else {
            setEditingCategoryId(null);
            resetCat();
        }
        setOpenCategoryModal(true);
    };

    const handleCloseCategoryModal = () => {
        setOpenCategoryModal(false);
        resetCat();
        setEditingCategoryId(null);
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (editingCategoryId) {
            putCat(route('admin.skills.categories.update', editingCategoryId), {
                onSuccess: () => handleCloseCategoryModal(),
                preserveScroll: true,
            });
        } else {
            postCat(route('admin.skills.categories.store'), {
                onSuccess: () => handleCloseCategoryModal(),
                preserveScroll: true,
            });
        }
    };

    const confirmDeleteCategory = () => {
        router.delete(route('admin.skills.categories.destroy', categoryToDelete.skillcategory_id), {
            onSuccess: () => setCategoryToDelete(null),
            preserveScroll: true,
        });
    };


    // ==========================================
    // SUBJECT HANDLERS
    // ==========================================
    const handleOpenSubjectModal = (subject = null) => {
        clearSubErrors();
        if (subject) {
            setEditingSubjectId(subject.skill_id);
            setSubData({
                category_id: selectedCategory.skillcategory_id,
                skill_code: subject.skill_code,
                skill_name: subject.skill_name,
            });
        } else {
            setEditingSubjectId(null);
            setSubData({
                category_id: selectedCategory.skillcategory_id,
                skill_code: '',
                skill_name: '',
            });
        }
        setOpenSubjectModal(true);
    };

    const handleCloseSubjectModal = () => {
        setOpenSubjectModal(false);
        resetSub();
        setEditingSubjectId(null);
    };

    const handleSubjectSubmit = (e) => {
        e.preventDefault();
        if (editingSubjectId) {
            putSub(route('admin.skills.subjects.update', editingSubjectId), {
                onSuccess: () => handleCloseSubjectModal(),
                preserveScroll: true,
            });
        } else {
            postSub(route('admin.skills.subjects.store'), {
                onSuccess: () => handleCloseSubjectModal(),
                preserveScroll: true,
            });
        }
    };

    const confirmDeleteSubject = () => {
        router.delete(route('admin.skills.subjects.destroy', subjectToDelete.skill_id), {
            onSuccess: () => setSubjectToDelete(null),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manage Skills" />

            <Container maxWidth="xl" sx={{ height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ mb: 1 }}>
                        <Link href={route('dashboard')}>
                            <Button startIcon={<ArrowBackIcon />} color="inherit" size="small" sx={{ ml: -1, textTransform: 'none' }}>
                                Back to Dashboard
                            </Button>
                        </Link>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">Skill & Subject Management</Typography>
                </Box>

                <Grid container spacing={3} sx={{ height: '100%', flexWrap: 'nowrap' }}>    

                    {/* LEFT COLUMN: Categories */}
                    <Grid item sx={{ width: '400px', flexShrink: 0, height: '100%' }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight="bold">Categories</Typography>
                                <Button size="small" variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={() => handleOpenCategoryModal()}>
                                    Add Category
                                </Button>
                            </Box>
                            
                            {/* UPDATED: Category Cards Stack */}
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {categories.map((category) => {
                                    const isSelected = selectedCategory?.skillcategory_id === category.skillcategory_id;
                                    const subjectCount = category.skill_subjects ? category.skill_subjects.length : 0;
                                    
                                    return (
                                        <Paper 
                                            key={category.skillcategory_id}
                                            variant="outlined" 
                                            onClick={() => setSelectedCategory(category)}
                                            sx={{ 
                                                minHeight: 180, // Fixed size
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
                                            {/* CARD HEADER: Subject Count */}
                                            <Box sx={{ bgcolor: isSelected ? '#bbdefb' : '#e3f2fd', p: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                                                <FolderIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                                                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                                                    {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'}
                                                </Typography>
                                            </Box>

                                            {/* CARD BODY: Category Name */}
                                            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'flex-start' }}>
                                                <Typography 
                                                    variant="body1" 
                                                    fontWeight="bold" 
                                                    sx={{ 
                                                        display: '-webkit-box',
                                                        WebkitBoxOrient: 'vertical',
                                                        WebkitLineClamp: 2, 
                                                        overflow: 'hidden',
                                                        lineHeight: 1.4,
                                                        width: '100%'
                                                    }}
                                                >
                                                    {category.category_name}
                                                </Typography>
                                            </Box>

                                            <Divider />

                                            {/* CARD FOOTER: Action Buttons */}
                                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: '#fafafa' }}>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<EditIcon />} 
                                                    onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(category); }}
                                                    sx={{ textTransform: 'none' }}
                                                    color="info"
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<DeleteIcon />} 
                                                    onClick={(e) => { e.stopPropagation(); setCategoryToDelete(category); }}
                                                    sx={{ textTransform: 'none' }}
                                                    color="error"
                                                >
                                                    Delete
                                                </Button>
                                            </Box>
                                        </Paper>
                                    );
                                })}

                                {categories.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                                        No categories yet.
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Subjects inside selected category */}
                    <Grid item sx={{ flexGrow: 1, height: '100%', minWidth: 0 }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                            {selectedCategory ? (
                                <>
                                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: 1, borderColor: 'divider', borderRadius: '12px 12px 0 0' }}>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold" color="primary">{selectedCategory.category_name}</Typography>
                                            <Typography variant="body2" color="text.secondary">Manage specific subjects and skills under this category</Typography>
                                        </Box>
                                        <Button variant="contained" startIcon={<AddIcon />} sx={{ textTransform: 'none' }} onClick={() => handleOpenSubjectModal()}>
                                            Add Subject
                                        </Button>
                                    </Box>

                                    {/* UPDATED: Subject Cards Grid */}
                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
                                            gap: 2 
                                        }}>
                                            {selectedCategory.skill_subjects && selectedCategory.skill_subjects.map((subject) => (
                                                <Paper 
                                                    key={subject.skill_id} 
                                                    variant="outlined" 
                                                    sx={{ 
                                                        height: 180, // Fixed height
                                                        display: 'flex', 
                                                        flexDirection: 'column',
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        transition: '0.2s',
                                                        '&:hover': { boxShadow: 2, borderColor: 'primary.main' }
                                                    }}
                                                >
                                                    {/* CARD HEADER: Subject Code */}
                                                    <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main" noWrap>
                                                            {subject.skill_code}
                                                        </Typography>
                                                    </Box>

                                                    {/* CARD BODY: Subject Name */}
                                                    <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'flex-start' }}>
                                                        <Typography 
                                                            variant="body2" 
                                                            fontWeight="medium" 
                                                            sx={{ 
                                                                display: '-webkit-box',
                                                                WebkitBoxOrient: 'vertical',
                                                                WebkitLineClamp: 3, 
                                                                overflow: 'hidden',
                                                                lineHeight: 1.4,
                                                                width: '100%'
                                                            }}
                                                        >
                                                            {subject.skill_name}
                                                        </Typography>
                                                    </Box>

                                                    <Divider />

                                                    {/* CARD FOOTER: Action Buttons */}
                                                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: '#fafafa' }}>
                                                        <Button 
                                                            size="small" 
                                                            startIcon={<EditIcon />} 
                                                            onClick={() => handleOpenSubjectModal(subject)}
                                                            sx={{ textTransform: 'none' }}
                                                            color="info"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            startIcon={<DeleteIcon />} 
                                                            onClick={() => setSubjectToDelete(subject)}
                                                            sx={{ textTransform: 'none' }}
                                                            color="error"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>

                                        {(!selectedCategory.skill_subjects || selectedCategory.skill_subjects.length === 0) && (
                                            <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>No subjects found in this category.</Typography>
                                        )}
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#f8fafc', borderRadius: 3 }}>
                                    <Typography color="text.secondary">Select a category to view subjects.</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* ======================================================== */}
            {/* MODALS */}
            {/* ======================================================== */}

            {/* CREATE / EDIT CATEGORY MODAL */}
            <Dialog open={openCategoryModal} onClose={handleCloseCategoryModal} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold">{editingCategoryId ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                <form onSubmit={handleCategorySubmit}>
                    <DialogContent dividers>
                        <TextField 
                            label="Category Name" placeholder="e.g. Computer Science" fullWidth required autoFocus
                            value={catData.category_name} onChange={(e) => setCatData('category_name', e.target.value)} 
                            error={!!catErrors.category_name} helperText={catErrors.category_name} sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseCategoryModal} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={processingCat}>{editingCategoryId ? 'Update' : 'Save'} Category</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* DELETE CATEGORY WARNING MODAL */}
            <Dialog open={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error">Delete Category?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the category <strong>"{categoryToDelete?.category_name}"</strong>? <br/><br/>
                        Warning: This will also permanently delete all subjects associated with this category. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCategoryToDelete(null)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDeleteCategory} variant="contained" color="error">Yes, Delete Everything</Button>
                </DialogActions>
            </Dialog>

            {/* CREATE / EDIT SUBJECT MODAL */}
            <Dialog open={openSubjectModal} onClose={handleCloseSubjectModal} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight="bold">
                    {editingSubjectId ? 'Edit Subject' : `Add Subject to ${selectedCategory?.category_name}`}
                </DialogTitle>
                <form onSubmit={handleSubjectSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField 
                                label="Skill/Subject Code" placeholder="e.g. oop, dbsys, math101" fullWidth required autoFocus
                                value={subData.skill_code} onChange={(e) => setSubData('skill_code', e.target.value)} 
                                error={!!subErrors.skill_code} helperText={subErrors.skill_code || "Must be unique across all categories."} 
                            />
                            <TextField 
                                label="Skill/Subject Name" placeholder="e.g. Object Oriented Programming" fullWidth required 
                                value={subData.skill_name} onChange={(e) => setSubData('skill_name', e.target.value)} 
                                error={!!subErrors.skill_name} helperText={subErrors.skill_name} 
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseSubjectModal} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={processingSub}>{editingSubjectId ? 'Update' : 'Save'} Subject</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* DELETE SUBJECT WARNING MODAL */}
            <Dialog open={!!subjectToDelete} onClose={() => setSubjectToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight="bold" color="error">Delete Subject?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{subjectToDelete?.skill_name} ({subjectToDelete?.skill_code})</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setSubjectToDelete(null)} color="inherit">Cancel</Button>
                    <Button onClick={confirmDeleteSubject} variant="contained" color="error">Yes, Delete Subject</Button>
                </DialogActions>
            </Dialog>

        </AuthenticatedLayout>
    );
}