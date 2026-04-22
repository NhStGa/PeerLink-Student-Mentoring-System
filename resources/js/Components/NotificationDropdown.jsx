import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { 
    Badge, IconButton, Menu, MenuItem, Box, Typography, 
    Avatar, Divider, Button, Tooltip 
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CircleIcon from '@mui/icons-material/Circle';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function NotificationDropdown() {
    // Grab the globally shared notification data from Inertia
    const { unreadNotificationsCount, recentNotifications } = usePage().props.auth;

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Mark as read, then redirect!
    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            router.patch(route('notifications.read', notification.notification_id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (notification.action_url) {
                        router.visit(notification.action_url);
                    }
                }
            });
        } else if (notification.action_url) {
            router.visit(notification.action_url);
        }
        handleClose();
    };

    const handleMarkAllAsRead = () => {
        router.patch(route('notifications.read-all'), {}, {
            preserveScroll: true,
            onSuccess: () => handleClose()
        });
    };

    // Helper to make timestamps look nice (e.g., "5m ago")
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        return `${diffInDays}d ago`;
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton 
                    onClick={handleClick} 
                    color="inherit" 
                    sx={{ ml: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                    <Badge badgeContent={unreadNotificationsCount} color="error" overlap="circular">
                        {unreadNotificationsCount > 0 ? (
                            <NotificationsActiveIcon sx={{ animation: 'ring 2s ease-in-out infinite' }} />
                        ) : (
                            <NotificationsIcon />
                        )}
                    </Badge>
                </IconButton>
            </Tooltip>

            {/* CSS Animation for the ringing bell */}
            <style>{`
                @keyframes ring {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-15deg); }
                    30% { transform: rotate(10deg); }
                    40% { transform: rotate(-10deg); }
                    50% { transform: rotate(0); }
                    100% { transform: rotate(0); }
                }
            `}</style>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                PaperProps={{
                    elevation: 4,
                    sx: { width: 360, maxHeight: 500, mt: 5, borderRadius: 3 }
                }}
            >
                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Notifications
                    </Typography>
                    {unreadNotificationsCount > 0 && (
                        <Button 
                            size="small" 
                            startIcon={<DoneAllIcon />} 
                            onClick={handleMarkAllAsRead}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />

                {/* List */}
                {recentNotifications && recentNotifications.length > 0 ? (
                    recentNotifications.map((notif) => (
                        <MenuItem 
                            key={notif.notification_id} 
                            onClick={() => handleNotificationClick(notif)}
                            sx={{ 
                                py: 2, px: 2, 
                                display: 'flex', alignItems: 'flex-start', gap: 2,
                                bgcolor: notif.is_read ? 'transparent' : '#f0f9ff', // Light blue if unread
                                '&:hover': { bgcolor: notif.is_read ? '#f8fafc' : '#e0f2fe' },
                                whiteSpace: 'normal' // Prevent text cutoff
                            }}
                        >
                            <Avatar 
                                src={notif.sender ? `/storage/${notif.sender.profile_picture}` : null} // <--- Simply add this one prop!
                                sx={{ bgcolor: 'primary.main' }}
                            >
                                {notif.sender ? notif.sender.fname.charAt(0).toUpperCase() : 'S'}
                            </Avatar>
                            
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" fontWeight={notif.is_read ? 'medium' : 'bold'}>
                                    {notif.event_title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                                    {notif.message}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                    {formatTimeAgo(notif.created_at)}
                                </Typography>
                            </Box>

                            {!notif.is_read && (
                                <CircleIcon color="primary" sx={{ fontSize: 12, mt: 1 }} />
                            )}
                        </MenuItem>
                    ))
                ) : (
                    <Box sx={{ px: 4, py: 6, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                            You're all caught up!
                        </Typography>
                    </Box>
                )}
            </Menu>
        </>
    );
}