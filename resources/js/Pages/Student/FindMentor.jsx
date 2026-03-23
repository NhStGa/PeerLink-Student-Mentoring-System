import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Container, Typography, Box, Grid, Paper, TextField, 
    InputAdornment, Chip, Avatar, Button, Divider, Alert, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified'; 
import StarIcon from '@mui/icons-material/Star';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function FindMentor({ auth, mentors, error }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- Dynamic Search & Rank Engine ---
    const filteredAndSortedMentors = useMemo(() => {
        if (!searchTerm) return mentors; 

        const lowerSearch = searchTerm.toLowerCase();

        const matchedMentors = mentors.map(mentor => {
            const nameMatch = mentor.name.toLowerCase().includes(lowerSearch);
            const matchedSkills = mentor.skills.filter(s => 
                s.name.toLowerCase().includes(lowerSearch) || 
                (s.code && s.code.toLowerCase().includes(lowerSearch))
            );

            const hasSkillMatch = matchedSkills.length > 0;
            const maxSkillRating = hasSkillMatch ? Math.max(...matchedSkills.map(s => s.rating)) : 0;

            return {
                ...mentor,
                isMatch: nameMatch || hasSkillMatch,
                maxSkillRating,
            };
        }).filter(m => m.isMatch); 

        return matchedMentors.sort((a, b) => {
            if (b.maxSkillRating !== a.maxSkillRating) {
                return b.maxSkillRating - a.maxSkillRating; 
            }
            return a.name.localeCompare(b.name);
        });

    }, [mentors, searchTerm]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Find a Mentor" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                
                {/* BACK BUTTON */}
                <Box sx={{ mb: 2 }}>
                    <Link href={route('student.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ ml: -1, textTransform: 'none', fontWeight: 'bold' }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                </Box>

                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                        Find Your Mentor
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Connect with approved student mentors within your department.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="warning" sx={{ mb: 4, justifyContent: 'center' }}>
                        {error}
                    </Alert>
                )}

                {/* SEARCH BAR */}
                <Paper sx={{ p: 2, mb: 4, borderRadius: 3, boxShadow: 2, maxWidth: 600, mx: 'auto' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by mentor name, or specific skill (e.g. Java, Web Design)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: '#f8fafc' }
                        }}
                    />
                </Paper>

                {/* MENTOR GRID */}
                <Grid container spacing={3}>
                    {filteredAndSortedMentors.length > 0 ? (
                        filteredAndSortedMentors.map((mentor) => {
                            // Safely parse the mentor's average rating, default to 0.0
                            const avgRating = mentor.my_rating ? Number(mentor.my_rating).toFixed(1) : '0.0';

                            return (
                                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={mentor.id}>
                                    <Paper 
                                        sx={{ 
                                            p: 3, 
                                            borderRadius: 3, 
                                            height: 380, 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            borderColor: mentor.mentorship_status === 'Approved' ? 'success.main' : 'transparent',
                                            borderWidth: mentor.mentorship_status === 'Approved' ? 2 : 0,
                                            borderStyle: 'solid',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                        }}
                                    >
                                        {/* CARD HEADER */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar 
                                                    src={mentor.avatar_url}
                                                    sx={{ width: 50, height: 50, bgcolor: 'primary.main', mr: 2 }}
                                                    >
                                                    {mentor.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                                                            {mentor.name}
                                                        </Typography>
                                                        <Tooltip title="Verified Mentor" placement="top" arrow>
                                                            <VerifiedIcon color="success" sx={{ fontSize: 20, cursor: 'pointer' }} />
                                                        </Tooltip>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {mentor.year_level}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* UPDATED RATING BOX */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff8e1', px: 1, py: 0.5, borderRadius: 1 }}>
                                                <StarIcon sx={{ color: '#ffc107', fontSize: 22, mr: 0.5 }} />
                                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                                    {avgRating}/5
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* PROGRAM CODE & STATUS INDICATOR */}
                                        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', fontWeight: 'bold' }}>
                                                <SchoolIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} /> {mentor.program}
                                            </Typography>
                                            
                                            {mentor.mentorship_status === 'Pending' && (
                                                <Chip label="Request Pending" size="small" color="warning" icon={<AccessTimeFilledIcon />} sx={{ height: 20, fontSize: '0.65rem' }} />
                                            )}
                                            {mentor.mentorship_status === 'Approved' && (
                                                <Chip label="My Mentor" size="small" color="success" icon={<CheckCircleIcon />} sx={{ height: 20, fontSize: '0.65rem' }} />
                                            )}
                                        </Box>

                                        <Box sx={{ mb: 2, minHeight: 40 }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontStyle: 'italic', 
                                                    color: 'text.secondary',
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 2, 
                                                    overflow: 'hidden',
                                                    lineHeight: 1.4
                                                }}
                                            >
                                                "{mentor.bio}"
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        <Box sx={{ mb: 2, flexGrow: 1, overflow: 'hidden' }}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                                <AutoAwesomeIcon sx={{ fontSize: 16, mr: 0.5, color: '#ed6c02' }} /> Top Skills
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {mentor.skills.length > 0 ? (
                                                    mentor.skills
                                                        .sort((a, b) => b.rating - a.rating)
                                                        .slice(0, 4)
                                                        .map(skill => (
                                                            <Chip 
                                                                key={skill.id} 
                                                                label={`${skill.name} (${skill.rating}/5)`} 
                                                                size="small" 
                                                                variant="outlined"
                                                                color={searchTerm && skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 'primary' : 'default'}
                                                                sx={{ 
                                                                    fontWeight: searchTerm && skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ? 'bold' : 'normal',
                                                                    bgcolor: searchTerm && skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ? '#e3f2fd' : 'transparent'
                                                                }}
                                                            />
                                                        ))
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">No skills assessed yet.</Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* UPDATED: Route to Mentor Info Page */}
                                        <Button 
                                            component={Link}
                                            href={route('student.mentor.info', mentor.id)}
                                            variant={mentor.mentorship_status === 'Approved' ? "contained" : "outlined"} 
                                            color={mentor.mentorship_status === 'Approved' ? "success" : "primary"}
                                            fullWidth 
                                            sx={{ mt: 'auto', textTransform: 'none', borderRadius: 2, borderWidth: mentor.mentorship_status === 'Approved' ? 0 : 2, '&:hover': { borderWidth: mentor.mentorship_status === 'Approved' ? 0 : 2 } }}
                                        >
                                            View Mentor
                                        </Button>
                                    </Paper>
                                </Grid>
                            );
                        })
                    ) : (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h5" color="text.secondary" gutterBottom>
                                    No mentors found.
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {searchTerm 
                                        ? `We couldn't find anyone matching "${searchTerm}" in your department.` 
                                        : "There are no approved mentors in your department right now."}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </AuthenticatedLayout>
    );
}