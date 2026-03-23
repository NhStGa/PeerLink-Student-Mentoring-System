import { useRef, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Box, Button, Typography, Avatar, Card, CardContent, CircularProgress } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

export default function UpdateProfilePicture() {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        profile_picture: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);
            // Create a temporary URL to preview the image before uploading
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        post(route('profile.avatar.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Inertia will automatically update the user.avatar_url prop globally!
            },
        });
    };

    return (
        <Card sx={{ mb: 4, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Profile Picture
                </Typography>
                
                <Box sx={{ position: 'relative', mt: 2, mb: 3 }}>
                    <Avatar 
                        src={previewUrl} 
                        alt={user.fname}
                        sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main', boxShadow: 3 }}
                    >
                        {!previewUrl && (user.fname ? user.fname.charAt(0).toUpperCase() : 'U')}
                    </Avatar>
                </Box>

                <form onSubmit={handleUpload} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Hidden File Input */}
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/jpg, image/gif"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<PhotoCameraIcon />}
                            onClick={() => fileInputRef.current.click()}
                            disabled={processing}
                        >
                            Select Image
                        </Button>
                        
                        {data.profile_picture && (
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                            >
                                {processing ? <CircularProgress size={24} color="inherit" /> : 'Save Picture'}
                            </Button>
                        )}
                    </Box>

                    {errors.profile_picture && (
                        <Typography color="error" variant="caption" sx={{ mt: 2 }}>
                            {errors.profile_picture}
                        </Typography>
                    )}

                    {recentlySuccessful && (
                        <Typography color="success.main" variant="caption" sx={{ mt: 2, fontWeight: 'bold' }}>
                            Profile picture updated successfully!
                        </Typography>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}