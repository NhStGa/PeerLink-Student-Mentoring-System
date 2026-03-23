import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Customize your primary color
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Disable uppercase text
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;