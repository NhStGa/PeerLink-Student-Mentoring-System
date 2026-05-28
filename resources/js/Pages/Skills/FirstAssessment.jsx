import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import { 
    Container, Paper, Typography, TextField, Grid, 
    List, ListItem, ListItemButton, ListItemText, ListItemIcon,
    Box, Button, FormControl, InputLabel, Select, MenuItem,
    Divider, IconButton, Chip, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function FirstAssessment({ auth, categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const cartRef = useRef(null);

    const { data, setData, post, processing } = useForm({
        assessments: [], 
    });

    const handleToggleSkill = (skill) => {
        const isSelected = data.assessments.find(a => a.skill_id === skill.skill_id);
        
        if (isSelected) {
            setData('assessments', data.assessments.filter(a => a.skill_id !== skill.skill_id));
        } else {
            setData('assessments', [...data.assessments, { 
                skill_id: skill.skill_id, 
                skill_name: skill.skill_name, 
                rating: '' 
            }]);
            
            if (window.innerWidth < 900) {
                setTimeout(() => cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }
        }
    };

    const handleRatingChange = (skill_id, newRating) => {
        const updatedAssessments = data.assessments.map(assessment => 
            assessment.skill_id === skill_id 
                ? { ...assessment, rating: newRating } 
                : assessment
        );
        setData('assessments', updatedAssessments);
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        return categories.map(cat => ({
            ...cat,
            skill_subjects: (cat.skill_subjects || []).filter(skill => 
                skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                skill.skill_code.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(cat => cat.skill_subjects && cat.skill_subjects.length > 0);
    }, [categories, searchTerm]);

    const MINIMUM_SKILLS = 5;
    const hasEnoughSkills = data.assessments.length >= MINIMUM_SKILLS;
    const allSkillsRated = data.assessments.every(a => a.rating !== '');
    const isReadyToSubmit = hasEnoughSkills && allSkillsRated;

    const submit = (e) => {
        e.preventDefault();
        post(route('skills.onboarding.store'));
    };

    const likertScale = [
        { value: '1', label: '1 - No Knowledge' },
        { value: '2', label: '2 - Basic' },
        { value: '3', label: '3 - Intermediate' },
        { value: '4', label: '4 - Advanced' },
        { value: '5', label: '5 - Expert' },
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url('/images/auth-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
        }}>
            <Head title="Initial Skill Setup" />

            <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: { xs: 2, md: 2 } }}>
                
                {/* Wrapped the welcome text in a subtle Paper card for readability over the background */}
                <Paper sx={{ mb: 1, p: { xs: 2, md: 3 }, textAlign: 'center', borderRadius: 3, boxShadow: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
                        Welcome to PeerLink!
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Before we go to your dashboard, let's build your initial skill profile. <br/>
                        <b>Select and rate at least 5 skills</b>
                    </Typography>
                </Paper>

                <Grid container spacing={1} sx={{ height: { xs: 'auto', md: '700px' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}> 
                    
                    {/* LEFT COLUMN: Search & Select */}
                    <Grid item sx={{ width: { xs: '100%', md: '380px' }, flexShrink: 0, height: { xs: '450px', md: '100%' } }}> 
                        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3, bgcolor: 'rgba(255, 255, 255, 0.98)' }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                1. Select Skills
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                                <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                                <TextField 
                                    fullWidth 
                                    label="Search for a skill or code..." 
                                    variant="standard"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </Box>

                            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
                                {filteredCategories.map((category) => (
                                    <Box key={category.skillcategory_id} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="primary" sx={{ px: 2, mb: 1, fontWeight: 'bold' }}>
                                            {category.category_name}
                                        </Typography>
                                        <List disablePadding>
                                            {category.skill_subjects && category.skill_subjects.map((skill) => {
                                                const isSelected = data.assessments.some(a => a.skill_id === skill.skill_id);
                                                return (
                                                    <ListItem key={skill.skill_id} disablePadding>
                                                        <ListItemButton selected={isSelected} onClick={() => handleToggleSkill(skill)} sx={{ borderRadius: 1 }}>
                                                            <ListItemIcon sx={{ minWidth: 35 }}>
                                                                {isSelected ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon color="action" />}
                                                            </ListItemIcon>
                                                            <ListItemText primary={skill.skill_name} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>No skills found.</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Rating Area */}
                    <Grid item sx={{ flexGrow: 1, height: { xs: 'auto', md: '100%' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }} ref={cartRef}> 
                        <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%', width: '100%', borderRadius: 3, boxShadow: 3, display: 'flex', flexDirection: 'column', bgcolor: 'rgba(251, 252, 253, 0.98)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    2. Rate Proficiency
                                </Typography>
                                <Chip 
                                    label={`${data.assessments.length} Selected (Min ${MINIMUM_SKILLS})`} 
                                    color={hasEnoughSkills ? "success" : "default"} 
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>
                            
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: { xs: 0, sm: 2 } }}>
                                {data.assessments.length > 0 ? (
                                    <form id="onboarding-form" onSubmit={submit}>
                                        {data.assessments.map((assessment) => (
                                            <Paper 
                                                key={assessment.skill_id} 
                                                variant="outlined" 
                                                sx={{ p: 2, mb: 2, bgcolor: '#ffffff', borderColor: assessment.rating === '' ? 'error.main' : 'divider' }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <SchoolIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                                                        {assessment.skill_name}
                                                    </Typography>
                                                    <IconButton size="small" color="error" onClick={() => handleToggleSkill({ skill_id: assessment.skill_id })}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </Box>

                                                <FormControl fullWidth size="small" error={assessment.rating === ''}>
                                                    <InputLabel>Select Rating</InputLabel>
                                                    <Select
                                                        value={assessment.rating}
                                                        label="Select Rating"
                                                        onChange={(e) => handleRatingChange(assessment.skill_id, e.target.value)}
                                                    >
                                                        {likertScale.map((scale) => (
                                                            <MenuItem key={scale.value} value={scale.value}>{scale.label}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Paper>
                                        ))}
                                    </form>
                                ) : (
                                    <Box sx={{ textAlign: 'center', borderStyle: 'dashed', borderColor: 'divider', p: { xs: 4, md: 6 }, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <AutoAwesomeIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">Your skill list is empty.</Typography>
                                        <Typography variant="body2" color="text.secondary">Check the boxes on the left to add skills here.</Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Footer Submit Area */}
                            <Box sx={{ pt: 3, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                                {!isReadyToSubmit && data.assessments.length > 0 && (
                                    <Alert severity={!hasEnoughSkills ? "info" : "warning"} sx={{ mb: 2, fontWeight: 'medium' }}>
                                        {!hasEnoughSkills 
                                            ? `Please select at least ${MINIMUM_SKILLS - data.assessments.length} more skill(s).` 
                                            : "Please provide a rating for all selected skills to continue."}
                                    </Alert>
                                )}
                                <Button 
                                    size="large"
                                    variant="contained" 
                                    color="success"
                                    fullWidth
                                    onClick={submit}
                                    disabled={!isReadyToSubmit || processing}
                                    startIcon={<RocketLaunchIcon />}
                                    sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.05rem' }}
                                >
                                    Complete Setup & Go to Dashboard
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}