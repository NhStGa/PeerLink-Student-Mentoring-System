import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import { 
    Container, Paper, Typography, TextField, Grid, 
    List, ListItem, ListItemButton, ListItemText, ListItemIcon,
    Box, Button, Radio, RadioGroup, FormControlLabel, FormControl, 
    FormLabel, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';

export default function Assessment({ auth, categories, existingAssessments }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState(null);
    
    // NEW: Ref to help mobile users scroll to the form automatically
    const formRef = useRef(null);

    const { data, setData, post, processing, reset } = useForm({
        skill_id: '',
        rating: '',
    });

    const handleSelectSkill = (skill) => {
        setSelectedSkill(skill);
        const existing = existingAssessments[skill.skill_id];
        setData({
            skill_id: skill.skill_id,
            rating: existing ? existing.rating.toString() : '',
        });
        
        // NEW: On mobile, automatically scroll down to the rating form when a skill is clicked
        if (window.innerWidth < 900) {
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
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

    const submit = (e) => {
        e.preventDefault();
        post(route('skills.store'), {
            onSuccess: () => {
                setSelectedSkill(null);
                reset();
            },
            preserveScroll: true
        });
    };

    const likertScale = [
        { value: '1', label: 'No Knowledge' },
        { value: '2', label: 'Basic' },
        { value: '3', label: 'Intermediate' },
        { value: '4', label: 'Advanced' },
        { value: '5', label: 'Expert' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Skill Assessment" />

            <Container 
                maxWidth="lg" 
                sx={{ 
                    // UPDATED: Changed height to minHeight to allow mobile stacking
                    minHeight: 'calc(100vh - 112px)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    py: { xs: 3, md: 4 } 
                }}
            >
                {/* UPDATED: flexWrap allows stacking on mobile (xs) and side-by-side on desktop (md) */}
                <Grid container spacing={3} sx={{ height: { xs: 'auto', md: '100%' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}> 
                    
                    {/* LEFT COLUMN: Search & Select */}
                    {/* UPDATED: Width is 100% on mobile, fixed 350px on desktop. Height is constrained to 400px on mobile so users can scroll to the form below. */}
                    <Grid item sx={{ width: { xs: '100%', md: '350px' }, flexShrink: 0, height: { xs: '400px', md: '100%' } }}> 
                        <Paper sx={{ 
                            p: 3, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderRadius: 3,
                            boxShadow: 3
                        }}>
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
                                                const isRated = existingAssessments[skill.skill_id];
                                                return (
                                                    <ListItem key={skill.skill_id} disablePadding>
                                                        <ListItemButton 
                                                            selected={selectedSkill?.skill_id === skill.skill_id}
                                                            onClick={() => handleSelectSkill(skill)}
                                                            sx={{ borderRadius: 1 }}
                                                        >
                                                            <ListItemIcon sx={{ minWidth: 35 }}>
                                                                {isRated ? <CheckCircleIcon color="success" fontSize="small" /> : <SchoolIcon color="action" fontSize="small" />}
                                                            </ListItemIcon>
                                                            <ListItemText 
                                                                primary={skill.skill_name}
                                                                secondary={isRated ? `Rated: ${isRated.rating}/5` : null}
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                                        No skills found.
                                    </Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Rating Area */}
                    {/* UPDATED: Height automatically adjusts on mobile so the form isn't squished */}
                    <Grid item sx={{ flexGrow: 1, height: { xs: 'auto', md: '100%' }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }} ref={formRef}> 
                        <Paper sx={{ 
                            p: { xs: 3, md: 4 }, 
                            height: '100%',
                            width: '100%', 
                            overflowY: { xs: 'visible', md: 'auto' },
                            borderRadius: 3,
                            boxShadow: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: selectedSkill ? 'flex-start' : 'center'
                        }}>
                            {selectedSkill ? (
                                <>
                                    <Typography variant="h5" gutterBottom>
                                        Rate your knowledge
                                    </Typography>
                                    <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom sx={{ wordBreak: 'break-word' }}>
                                        {selectedSkill.skill_name}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        Code: {selectedSkill.skill_code}
                                    </Typography>
                                    <Divider sx={{ my: 3 }} />
                                    
                                    <form onSubmit={submit} style={{ width: '100%' }}>
                                        <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
                                            <FormLabel component="legend" sx={{ mb: 2 }}>Select your proficiency level:</FormLabel>
                                            <RadioGroup
                                                value={data.rating}
                                                onChange={(e) => setData('rating', e.target.value)}
                                            >
                                                {likertScale.map((option) => (
                                                    <Paper 
                                                        key={option.value} 
                                                        variant="outlined" 
                                                        sx={{ 
                                                            mb: 2, 
                                                            p: 1,
                                                            width: '100%',
                                                            bgcolor: data.rating === option.value ? '#e3f2fd' : 'transparent',
                                                            borderColor: data.rating === option.value ? '#2196f3' : 'rgba(0, 0, 0, 0.12)'
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value={option.value}
                                                            control={<Radio />}
                                                            label={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                    <Typography fontWeight="bold" sx={{ mr: 1, minWidth: '20px' }}>{option.value}</Typography>
                                                                    <Typography variant="body2" color="text.secondary">- {option.label}</Typography>
                                                                </Box>
                                                            }
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </Paper>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>

                                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                                            <Button 
                                                size="large"
                                                variant="contained" 
                                                type="submit" 
                                                fullWidth={window.innerWidth < 600}
                                                disabled={!data.rating || processing}
                                                startIcon={<CheckCircleIcon />}
                                            >
                                                Confirm Rating
                                            </Button>
                                        </Box>
                                    </form>
                                </>
                            ) : (
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    bgcolor: '#f5f5f5', 
                                    borderStyle: 'dashed', 
                                    p: { xs: 4, md: 6 },
                                    borderRadius: 3,
                                    width: '100%'
                                }}>
                                    <StarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        Select a skill from the list<br/>to begin assessment
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </AuthenticatedLayout>
    );
}