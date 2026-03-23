import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Container, Box, Typography, Paper, TextField, Button, 
    Stack, Grid, MenuItem, FormControl, InputLabel, Select, 
    FormHelperText, Radio, RadioGroup, FormControlLabel, Divider,
    IconButton, Chip, Checkbox, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import InfoIcon from '@mui/icons-material/Info';

export default function SessionBooking({ auth, schedules = [], skills = [], userBookedSchedules = [], relationships = [], customSchedules = [] }) {
    
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const [selectedDate, setSelectedDate] = useState(todayStr); 

    const { data, setData, post, processing, errors } = useForm({
        topic_title: '',
        topic_description: '',
        skill_id: '',
        location: '',
        mentor_id: '',
        availability_id: '',
        is_custom: false,
        session_date: todayStr,
        start_time: '',
        end_time: '',
    });

    const locations = ['Student Lounge', 'Canteen', 'G/F Kwago', '1/F Kwago', 'Library'];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.sessions.store'));
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedH = h % 12 || 12;
        return `${formattedH}:${minutes} ${ampm}`;
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDayClick = (dateStr) => {
        setSelectedDate(dateStr);
        setData(prev => ({ ...prev, session_date: dateStr, availability_id: '', is_custom: false, start_time: '', end_time: '' }));
    };

    const handleCustomToggle = (e) => {
        const isChecked = e.target.checked;
        setData(prev => ({
            ...prev,
            is_custom: isChecked,
            availability_id: isChecked ? '' : prev.availability_id
        }));
    };

    const mentorSchedules = data.mentor_id ? schedules.filter(s => s.mentor_id === data.mentor_id) : [];
    const filteredSchedules = data.mentor_id ? mentorSchedules.filter(s => s.available_date === selectedDate) : [];
    const dayCustomSchedules = customSchedules.filter(s => s.session_date === selectedDate);
    
    // NEW: Check if the user already has an off-schedule request for THIS specific mentor on this date
    const hasOffSchedWithSelectedMentor = dayCustomSchedules.some(s => s.mentor_id === data.mentor_id);

    const isSubmitDisabled = processing || 
        !data.mentor_id || 
        (data.is_custom && (!data.start_time || !data.end_time || hasOffSchedWithSelectedMentor)) || 
        (!data.is_custom && !data.availability_id);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Book a Session" />

            <Container maxWidth="xl" sx={{ py: 6 }}>
                
                <Box sx={{ mb: 4 }}>
                    <Link href={route('student.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        Book a Mentoring Session
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Fill out the details below and select an available time from your mentor.
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Session Details
                                </Typography>
                                <Divider sx={{ mb: 4 }} />

                                <Stack spacing={4}>

                                    <FormControl fullWidth error={!!errors.mentor_id}>
                                        <InputLabel>Select Your Mentor</InputLabel>
                                        <Select
                                            value={data.mentor_id}
                                            label="Select Your Mentor"
                                            onChange={(e) => {
                                                setData(prev => ({ 
                                                    ...prev, 
                                                    mentor_id: e.target.value,
                                                    availability_id: '',
                                                    is_custom: false,
                                                    start_time: '',
                                                    end_time: ''
                                                }));
                                            }}
                                            sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
                                        >
                                            {relationships.map((rel) => (
                                                <MenuItem key={rel.mentor_id} value={rel.mentor_id}>
                                                    {rel.mentor?.fname} {rel.mentor?.lname}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.mentor_id ? <FormHelperText>{errors.mentor_id}</FormHelperText> : <FormHelperText>Select a mentor to view their available schedule.</FormHelperText>}
                                    </FormControl>

                                    <TextField fullWidth label="Topic Title" placeholder="e.g., Help with Database Normalization" value={data.topic_title} onChange={(e) => setData('topic_title', e.target.value)} error={!!errors.topic_title} helperText={errors.topic_title} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                                    <TextField fullWidth multiline rows={4} label="Topic Description" placeholder="Briefly describe what you want to achieve or struggle with..." value={data.topic_description} onChange={(e) => setData('topic_description', e.target.value)} error={!!errors.topic_description} helperText={errors.topic_description} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                        <FormControl fullWidth error={!!errors.skill_id}>
                                            <InputLabel>Related Skill</InputLabel>
                                            <Select value={data.skill_id} label="Related Skill" onChange={(e) => setData('skill_id', e.target.value)} sx={{ borderRadius: 2 }}>
                                                {skills.map((skill) => (<MenuItem key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</MenuItem>))}
                                            </Select>
                                            {errors.skill_id && <FormHelperText>{errors.skill_id}</FormHelperText>}
                                        </FormControl>

                                        <FormControl fullWidth error={!!errors.location}>
                                            <InputLabel>Location</InputLabel>
                                            <Select value={data.location} label="Location" onChange={(e) => setData('location', e.target.value)} sx={{ borderRadius: 2 }}>
                                                {locations.map((loc) => (<MenuItem key={loc} value={loc}>{loc}</MenuItem>))}
                                            </Select>
                                            {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
                                        </FormControl>
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <EventAvailableIcon color="primary" />
                                            <Typography variant="h6" fontWeight="bold">
                                                Select Time
                                            </Typography>
                                        </Box>
                                        
                                        {!data.mentor_id ? (
                                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                Please select a mentor from the dropdown above to view their availability.
                                            </Alert>
                                        ) : (
                                            <>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                    Available slots for <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                                                </Typography>

                                                {!data.is_custom && (
                                                    <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 350, pr: 1, mb: 2 }}>
                                                        {filteredSchedules.length > 0 ? (
                                                            <FormControl error={!!errors.availability_id} sx={{ width: '100%' }}>
                                                                <RadioGroup value={data.availability_id} onChange={(e) => setData('availability_id', e.target.value)}>
                                                                    <Grid container spacing={2}>
                                                                        {filteredSchedules.map((schedule) => {
                                                                            const remainingSlots = schedule.max_booking - schedule.sessions_count;
                                                                            const isFull = remainingSlots <= 0;
                                                                            const hasAlreadyBooked = userBookedSchedules.includes(schedule.availability_id);
                                                                            const isDisabled = isFull || hasAlreadyBooked;

                                                                            return (
                                                                                <Grid size={{ xs: 12, sm: 6 }} key={schedule.availability_id}>
                                                                                    <Paper 
                                                                                        variant="outlined"
                                                                                        sx={{ 
                                                                                            p: 2, borderRadius: 2, height: '100%', transition: 'all 0.2s',
                                                                                            bgcolor: isDisabled ? '#f8fafc' : (data.availability_id == schedule.availability_id ? '#e3f2fd' : 'transparent'),
                                                                                            borderColor: isDisabled ? '#e2e8f0' : (data.availability_id == schedule.availability_id ? 'primary.main' : 'divider'),
                                                                                            opacity: isDisabled ? 0.6 : 1, 
                                                                                        }}
                                                                                    >
                                                                                        <FormControlLabel 
                                                                                            value={schedule.availability_id} 
                                                                                            control={<Radio disabled={isDisabled} />} 
                                                                                            sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                                                                                            label={
                                                                                                <Box sx={{ ml: 1 }}>
                                                                                                    <Typography variant="body1" color={isDisabled ? 'text.disabled' : 'primary.main'} fontWeight="bold" sx={{ textDecoration: isDisabled ? 'line-through' : 'none' }}>
                                                                                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                                                                    </Typography>
                                                                                                    
                                                                                                    {hasAlreadyBooked ? (
                                                                                                        <Chip label="Already Booked" size="small" color="info" variant="filled" sx={{ mt: 1, height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                                                                                                    ) : (
                                                                                                        <Chip label={isFull ? 'Fully Booked' : `${remainingSlots} slot${remainingSlots > 1 ? 's' : ''} left`} size="small" color={isFull ? 'error' : (remainingSlots === 1 ? 'warning' : 'success')} variant={isFull ? 'filled' : 'outlined'} sx={{ mt: 1, height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />
                                                                                                    )}
                                                                                                </Box>
                                                                                            }
                                                                                        />
                                                                                    </Paper>
                                                                                </Grid>
                                                                            );
                                                                        })}
                                                                    </Grid>
                                                                </RadioGroup>
                                                                {errors.availability_id && <FormHelperText>{errors.availability_id}</FormHelperText>}
                                                            </FormControl>
                                                        ) : (
                                                            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Your mentor has no set schedule for this date.
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                )}

                                                {data.mentor_id && filteredSchedules.length === 0 && (
                                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: data.is_custom ? '#fff8e1' : 'transparent', borderColor: data.is_custom ? '#ffe082' : 'divider' }}>
                                                        
                                                        {/* NEW: Block the form if they already have an off-schedule request for this mentor on this date */}
                                                        {hasOffSchedWithSelectedMentor ? (
                                                            <Alert severity="warning" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                                                                You already have an off-schedule request pending for this mentor on this date.
                                                            </Alert>
                                                        ) : (
                                                            <>
                                                                <FormControlLabel 
                                                                    control={<Checkbox checked={data.is_custom} onChange={handleCustomToggle} color="warning" />} 
                                                                    label={<Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><MoreTimeIcon fontSize="small"/> Request an Off-Schedule Session</Typography>} 
                                                                />
                                                                
                                                                {data.is_custom && (
                                                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                                                        <TextField 
                                                                            type="time" label="Proposed Start Time" value={data.start_time} onChange={e => setData('start_time', e.target.value)} 
                                                                            InputLabelProps={{ shrink: true }} fullWidth error={!!errors.start_time} helperText={errors.start_time} sx={{ bgcolor: 'white', borderRadius: 1 }} 
                                                                        />
                                                                        <TextField 
                                                                            type="time" label="Proposed End Time" value={data.end_time} onChange={e => setData('end_time', e.target.value)} 
                                                                            InputLabelProps={{ shrink: true }} fullWidth error={!!errors.end_time} helperText={errors.end_time || "Requires mentor approval"} sx={{ bgcolor: 'white', borderRadius: 1 }} 
                                                                        />
                                                                    </Box>
                                                                )}
                                                            </>
                                                        )}
                                                    </Paper>
                                                )}

                                                {dayCustomSchedules.length > 0 && (
                                                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                                        <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, fontWeight: 'bold' }}>
                                                            <InfoIcon fontSize="small" /> Your Existing Off-Schedule Requests for this Date
                                                        </Typography>
                                                        <Stack spacing={1}>
                                                            {dayCustomSchedules.map(req => (
                                                                <Paper key={req.session_id} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ffffff' }}>
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                                            {formatTime(req.start_time)} - {formatTime(req.end_time)}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Mentor: {req.mentor?.fname} {req.mentor?.lname}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Chip 
                                                                        label={req.status} 
                                                                        size="small" 
                                                                        color={req.status === 'Scheduled' || req.status === 'Approved' ? 'success' : 'warning'} 
                                                                        sx={{ fontSize: '0.65rem', height: 20 }} 
                                                                    />
                                                                </Paper>
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </Box>

                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        size="large" 
                                        fullWidth
                                        startIcon={<SendIcon />}
                                        disabled={isSubmitDisabled}
                                        sx={{ mt: 2, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                    >
                                        {data.is_custom ? "Submit Off-Schedule Request" : "Book Session Now"}
                                    </Button>

                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ position: 'sticky', top: 24 }}>
                                <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, bgcolor: '#f8fafc', opacity: data.mentor_id ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <CalendarMonthIcon color="primary" />
                                        <Typography variant="h6" fontWeight="bold">
                                            Pick a Date
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <IconButton onClick={handlePrevMonth} size="small" sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }} disabled={!data.mentor_id}><ChevronLeftIcon /></IconButton>
                                        <Typography variant="subtitle1" fontWeight="bold">{monthName}</Typography>
                                        <IconButton onClick={handleNextMonth} size="small" sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }} disabled={!data.mentor_id}><ChevronRightIcon /></IconButton>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
                                        {daysOfWeek.map(day => (<Typography key={day} align="center" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{day.substring(0, 3)}</Typography>))}
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                                        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                                            <Box key={`empty-${index}`} sx={{ p: 1 }} />
                                        ))}

                                        {Array.from({ length: daysInMonth }).map((_, index) => {
                                            const dateNum = index + 1;
                                            const formattedCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                                            
                                            const daySchedules = mentorSchedules.filter(s => s.available_date === formattedCellDate);
                                            // NEW: Check if there are any custom schedules mapped to this cell date
                                            const hasCustomSchedulesOnDay = customSchedules.some(s => s.session_date === formattedCellDate);
                                            
                                            const isSelected = selectedDate === formattedCellDate;
                                            const isToday = new Date().getDate() === dateNum && new Date().getMonth() === month && new Date().getFullYear() === year;

                                            return (
                                                <Paper 
                                                    key={dateNum} 
                                                    variant="outlined"
                                                    onClick={() => data.mentor_id ? handleDayClick(formattedCellDate) : null}
                                                    sx={{ 
                                                        height: 54, 
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                        bgcolor: isSelected ? 'primary.main' : (isToday ? '#fff8e1' : '#ffffff'), 
                                                        borderColor: isSelected ? 'primary.main' : (isToday ? '#ffe082' : 'divider'),
                                                        color: isSelected ? '#fff' : 'inherit',
                                                        cursor: data.mentor_id ? 'pointer' : 'default', 
                                                        transition: 'all 0.2s',
                                                        position: 'relative',
                                                        '&:hover': { bgcolor: (data.mentor_id && !isSelected) ? '#f1f5f9' : (isSelected ? 'primary.dark' : undefined) }
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                                                        {dateNum}
                                                    </Typography>

                                                    {/* Flex box to hold dots perfectly centered at the bottom */}
                                                    <Box sx={{ display: 'flex', gap: 0.5, position: 'absolute', bottom: 6 }}>
                                                        {daySchedules.length > 0 && !isSelected && (
                                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                        )}
                                                        {/* NEW: Orange Dot for Custom Schedules */}
                                                        {hasCustomSchedulesOnDay && !isSelected && (
                                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Box>
                        </Grid>

                    </Grid>
                </form>
            </Container>
        </AuthenticatedLayout>
    );
}