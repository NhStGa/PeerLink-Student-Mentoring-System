import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Container,
    Avatar,
    Button,
    Tooltip,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Groups as GroupsIcon,
    Assessment as AssessmentIcon, 
    AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

// IMPORTED NOTIFICATION COMPONENT
import NotificationDropdown from '@/Components/NotificationDropdown';

export default function AuthenticatedLayout({ user, header, children }) {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    // Build navigation items based on user role
    const navItems = [
        { name: 'Dashboard', href: 'dashboard', icon: <DashboardIcon /> },
    ];

    if (user.role === 'admin') {
        navItems.push({ name: 'Skills and Subjects', href: 'admin.skills.index', icon: <AssessmentIcon /> });
        navItems.push({ name: 'Academic Status', href: 'admin.academic.index', icon: <AccountBalanceIcon /> }); 
    } else {
        navItems.push({ name: 'Skill Assessment', href: 'skills.assess', icon: <AssessmentIcon /> });
    }

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Student Mentoring
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={route(item.href)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Mobile menu icon */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Logo */}
                        <GroupsIcon sx={{ display: { xs: 'none', sm: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            href={route('dashboard')}
                            sx={{
                                mr: 2,
                                display: { xs: 'none', sm: 'flex' },
                                fontWeight: 700,
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Student Mentoring
                        </Typography>

                        {/* Desktop Navigation */}
                        {/* Flex-end pushes items to the right, creating the [Dashboard] [Skills] [User] layout */}
                        <Box 
                            sx={{ 
                                flexGrow: 1, 
                                display: { xs: 'none', sm: 'flex' }, 
                                justifyContent: 'flex-end', 
                                mr: 2 
                            }}
                        >
                            {navItems.map((item) => (
                                <Button
                                    key={item.name}
                                    component={Link}
                                    href={route(item.href)}
                                    sx={{ my: 2, color: 'white', display: 'block', ml: 2 }}
                                >
                                    {item.name}
                                </Button>
                            ))}
                        </Box>

                        {/* Right Side Icons: Notifications & User Profile */}
                        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                            
                            {/* NEW: Inserted the Notification Dropdown Here! */}
                            <NotificationDropdown />

                            {/* User Menu */}
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                                    <Avatar 
                                        src={user.avatar_url} 
                                        alt={user.fname} 
                                        sx={{ bgcolor: 'secondary.main' }}
                                    >
                                        {user.fname ? user.fname.charAt(0).toUpperCase() : 'U'}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem disabled>
                                    <Typography textAlign="center" fontWeight="600">
                                        {user.fname} {user.lname}
                                    </Typography>
                                </MenuItem>
                                <MenuItem disabled>
                                    <Typography textAlign="center" variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </MenuItem>
                                <Divider />
                                
                                <MenuItem
                                    component={Link}
                                    href={route('profile.show')}
                                    onClick={handleCloseUserMenu}
                                >
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography textAlign="center">Profile</Typography>
                                </MenuItem>

                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>

            {/* Page Header */}
            {header && (
                <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                    <Container maxWidth="xl" sx={{ py: 3 }}>
                        {header}
                    </Container>
                </Box>
            )}

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', py: 3 }}>
                {children}
            </Box>
        </Box>
    );
}