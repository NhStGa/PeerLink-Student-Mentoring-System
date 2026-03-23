import { useState, useEffect } from 'react';
import { Dialog, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function ImageCarouselModal({ open, onClose, images, initialIndex = 0 }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Reset the index whenever the modal is opened
    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [open, initialIndex]);

    // Safety check: if no images, don't render anything
    if (!images || images.length === 0) return null;

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'hidden',
                }
            }}
            BackdropProps={{
                sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' } // Cinematic dark backdrop
            }}
        >
            {/* Close Button */}
            <IconButton 
                onClick={onClose} 
                sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 10 }}
            >
                <CloseIcon fontSize="large" />
            </IconButton>

            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                
                {/* Previous Arrow (Only show if there is a previous image) */}
                {images.length > 1 && currentIndex > 0 && (
                    <IconButton 
                        onClick={handlePrev} 
                        sx={{ position: 'absolute', left: { xs: 8, md: 32 }, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                    >
                        <ArrowBackIosNewIcon fontSize="large" />
                    </IconButton>
                )}

                {/* The Image */}
                <Box
                    component="img"
                    // Adjust this path if your database stores the URL differently!
                    src={`/storage/${images[currentIndex].image_path}`} 
                    alt={`Review image ${currentIndex + 1}`}
                    sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 2 }}
                />

                {/* Next Arrow (Only show if there is a next image) */}
                {images.length > 1 && currentIndex < images.length - 1 && (
                    <IconButton 
                        onClick={handleNext} 
                        sx={{ position: 'absolute', right: { xs: 8, md: 32 }, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                    >
                        <ArrowForwardIosIcon fontSize="large" />
                    </IconButton>
                )}
            </Box>
            
            {/* Image Counter (e.g., "1 / 3") */}
            {images.length > 1 && (
                <Typography sx={{ color: 'white', textAlign: 'center', mt: 2 }}>
                    {currentIndex + 1} / {images.length}
                </Typography>
            )}
        </Dialog>
    );
}