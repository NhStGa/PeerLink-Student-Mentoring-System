import { Box, Typography, Avatar } from '@mui/material';
import { Groups } from '@mui/icons-material';

export default function ApplicationLogo(props) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                mb: 2
            }}
        >
            <Avatar
                sx={{
                    width: 70,
                    height: 70,
                    bgcolor: 'primary.main'
                }}
            >
                <Groups sx={{ fontSize: 45 }} />
            </Avatar>
            <Typography 
                variant="h5" 
                sx={{ 
                    fontWeight: 600,
                    color: 'text.primary'
                }}
            >
                Student Peer Mentoring System
            </Typography>
        </Box>
    );
}