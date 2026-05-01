import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; 
import { useState } from 'react';
import { 
    Container, Box, Typography, Paper, TextField, 
    Button, Stack, Grid, Divider, IconButton, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AvailableBookingSchedule({ auth, schedules = [] }) {
    
    // --- Form State ---
    const { data, setData, post, processing, errors, reset } = useForm({
        available_date: '', 
        start_time: '',
        end_time: '',
        max_booking: 2, 
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mentor.schedule.store'), {
            onSuccess: () => reset('start_time', 'end_time') 
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this time slot?')) {
            router.delete(route('mentor.schedule.destroy', id));
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedH = h % 12 || 12;
        return `${formattedH}:${minutes} ${ampm}`;
    };

    // --- Calendar Date Logic ---
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const [selectedDate, setSelectedDate] = useState(todayStr); 

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); 
    
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Get the schedules specifically for the selected date
    const selectedSchedules = schedules
        .filter(s => s.available_date === selectedDate)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)); 

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Booking Schedule" />

            <Container maxWidth="xl" sx={{ py: 2 }}>
                
                <Box sx={{ mb: 4 }}>
                    <Link href={route('mentor.dashboard')}>
                        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ textTransform: 'none', mb: 2, ml: -1 }}>
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                        Manage Your Availability
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Define specific dates and times you are available to conduct mentoring sessions.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    
                    {/* LEFT COLUMN: Summary Calendar */}
                    <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                        <Paper sx={{ 
                            p: { xs: 2, md: 4 }, 
                            borderRadius: 3, 
                            boxShadow: 3, 
                            bgcolor: '#f8fafc', 
                            height: { xs: 'auto', md: 882 }, // FIXED HEIGHT: Exact match to the right column
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <IconButton onClick={handlePrevMonth} sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <Typography variant="h5" fontWeight="bold" color="primary.main">
                                    {monthName}
                                </Typography>
                                <IconButton onClick={handleNextMonth} sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </Box>
                            
                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: { xs: 500, sm: '100%' }, overflowX: 'auto' }}>
                                
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 0.5, sm: 1 }, mb: 1 }}>
                                    {daysOfWeek.map(day => (
                                        <Typography key={day} align="center" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{day.substring(0, 3)}</Box>
                                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{day.substring(0, 1)}</Box>
                                        </Typography>
                                    ))}
                                </Box>

                                {/* UPDATED: gridAutoRows='1fr' forces the calendar blocks to stretch beautifully and evenly fill the fixed 882px height! */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr', gap: { xs: 0.5, sm: 1 }, flexGrow: 1 }}>
                                    
                                    {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                                        <Box key={`empty-${index}`} sx={{ p: 1, bgcolor: 'transparent' }} />
                                    ))}

                                    {Array.from({ length: daysInMonth }).map((_, index) => {
                                        const dateNum = index + 1;
                                        const formattedCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
                                        
                                        const daySchedules = schedules.filter(s => s.available_date === formattedCellDate);
                                        const isToday = new Date().getDate() === dateNum && new Date().getMonth() === month && new Date().getFullYear() === year;
                                        const isSelected = selectedDate === formattedCellDate;

                                        return (
                                            <Paper 
                                                key={dateNum} 
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedDate(formattedCellDate);
                                                    setData('available_date', formattedCellDate); 
                                                }} 
                                                sx={{ 
                                                    p: { xs: 0.5, sm: 1 }, 
                                                    bgcolor: isSelected ? '#e3f2fd' : (isToday ? '#fff8e1' : '#ffffff'), 
                                                    borderColor: isSelected ? 'primary.main' : (isToday ? '#ffe082' : 'divider'),
                                                    borderWidth: isSelected ? 2 : 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: '#f1f5f9',
                                                        borderColor: 'primary.light'
                                                    }
                                                }}
                                            >
                                                <Typography 
                                                    variant="body2" 
                                                    fontWeight="bold" 
                                                    sx={{ 
                                                        color: isToday ? 'primary.main' : 'text.secondary',
                                                        mt: 0.5,
                                                        mb: 1,
                                                        fontSize: { xs: '0.85rem', sm: '1rem' }
                                                    }}
                                                >
                                                    {dateNum}
                                                </Typography>
                                                
                                                {daySchedules.length > 0 && (
                                                    <Chip 
                                                        label={`${daySchedules.length} slot${daySchedules.length > 1 ? 's' : ''}`} 
                                                        color="primary" 
                                                        size="small"
                                                        sx={{ 
                                                            fontSize: { xs: '0.6rem', sm: '0.7rem' }, 
                                                            height: { xs: 20, sm: 24 },
                                                            mt: 'auto'
                                                        }} 
                                                    />
                                                )}
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: Table (Fixed 350px) + Form (Fixed 500px) */}
                    <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                        <Stack spacing={4} sx={{ height: { xs: 'auto', md: 882 } }}>

                            {/* 1. The Daily Details Table (Fixed Height) */}
                            <Paper sx={{ 
                                height: 350, // FIXED HEIGHT
                                borderRadius: 3, 
                                boxShadow: 3, 
                                display: 'flex', 
                                flexDirection: 'column',
                                overflow: 'hidden' // Keeps border radius clean
                            }}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" align="center">
                                        Schedules for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </Typography>
                                </Box>
                                <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                    {/* Added stickyHeader so column names stay put when scrolling */}
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Time</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }} align="center">Cap.</TableCell>
                                                <TableCell align="right" sx={{ bgcolor: '#f1f5f9' }}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedSchedules.length > 0 ? (
                                                selectedSchedules.map((row) => (
                                                    <TableRow key={row.availability_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell component="th" scope="row" sx={{ fontSize: '0.8rem', fontWeight: 'medium' }}>
                                                            {formatTime(row.start_time)} - {formatTime(row.end_time)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={row.max_booking} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <IconButton 
                                                                color="error" 
                                                                size="small" 
                                                                onClick={() => handleDelete(row.availability_id)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                                            No time slots booked.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>

                            {/* 2. The Input Form (Fixed Height) */}
                            <Paper sx={{ 
                                height: 500, // FIXED HEIGHT
                                p: { xs: 3, md: 4 }, 
                                borderRadius: 3, 
                                boxShadow: 3, 
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Add Time Slot
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Select a specific date for this availability.
                                </Typography>
                                <Divider sx={{ mb: 4 }} />

                                <form onSubmit={handleSubmit} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Stack spacing={4} sx={{ flexGrow: 1 }}>
                                        
                                        <TextField
                                            fullWidth
                                            label="Select Date"
                                            type="date"
                                            value={data.available_date}
                                            onChange={(e) => {
                                                setData('available_date', e.target.value);
                                                setSelectedDate(e.target.value); 
                                            }}
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.available_date}
                                            helperText={errors.available_date}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />

                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="Start Time"
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }} 
                                                error={!!errors.start_time}
                                                helperText={errors.start_time}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />

                                            <TextField
                                                fullWidth
                                                label="End Time"
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }} 
                                                error={!!errors.end_time}
                                                helperText={errors.end_time}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        </Box>

                                        <TextField
                                            fullWidth
                                            label="Maximum Students per Session"
                                            type="number"
                                            value={data.max_booking}
                                            onChange={(e) => setData('max_booking', e.target.value)}
                                            inputProps={{ min: 1, max: 2 }} 
                                            error={!!errors.max_booking}
                                            helperText={errors.max_booking || "You can host up to 2 students at the same time."}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />

                                        <Box sx={{ mt: 'auto' }}>
                                            <Button 
                                                type="submit" 
                                                variant="contained" 
                                                size="large" 
                                                fullWidth
                                                startIcon={<SaveIcon />}
                                                disabled={processing}
                                                sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                                            >
                                                Save Time Slot
                                            </Button>
                                        </Box>

                                    </Stack>
                                </form>
                            </Paper>
                        </Stack>
                    </Grid>

                </Grid>
            </Container>
        </AuthenticatedLayout>
    );
}