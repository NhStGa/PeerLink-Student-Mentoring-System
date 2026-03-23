import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Container, Paper, Typography, TextField, Button, Box } from '@mui/material';

export default function Apply({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        motivation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mentor.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mentor Application</h2>}
        >
            <Head title="Apply for Mentor" />

            <Container maxWidth="md" sx={{ py: 6 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Apply to be a Peer Mentor
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        As a 4th-year student, you can guide juniors. Please tell us why you want to join.
                    </Typography>

                    <form onSubmit={submit}>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Reason for Application"
                            placeholder="I want to be a mentor because..."
                            value={data.motivation}
                            onChange={(e) => setData('motivation', e.target.value)}
                            error={!!errors.motivation}
                            helperText={errors.motivation}
                            required
                        />

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Link href={route('profile.show')}>
                                <Button color="inherit">Cancel</Button>
                            </Link>
                            <Button type="submit" variant="contained" disabled={processing}>
                                Submit Application
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}