import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <Container maxWidth="xl">
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Members App
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                    A comprehensive solution for managing organization members, subscriptions, and payments.
                </Typography>

                <Box sx={{ my: 4, textAlign: 'left' }}>
                    <Typography variant="h6" gutterBottom>Key Features:</Typography>
                    <ul>
                        <li><Typography><strong>Member Management:</strong> Easily register, approve, and manage member profiles.</Typography></li>
                        <li><Typography><strong>Subscription Tracking:</strong> Flexible plans with automated renewal reminders and expiration handling.</Typography></li>
                        <li><Typography><strong>Financial Overview:</strong> Track payments, revenue, and generate reports.</Typography></li>
                        <li><Typography><strong>Action History:</strong> Detailed logs of all system activities for transparency.</Typography></li>
                    </ul>
                </Box>

                <Paper elevation={3} sx={{ p: 3, my: 4, bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Demo Credentials
                    </Typography>
                    <Typography variant="body1">
                        <strong>Super Admin Email:</strong> admin@demo.com
                    </Typography>
                    <Typography variant="body1">
                        <strong>Password:</strong> admin123
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Use these credentials to log in and explore the admin dashboard.
                    </Typography>
                </Paper>

                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="contained" size="large" component={Link} to="/login">
                        Login
                    </Button>
                    <Button variant="outlined" size="large" component={Link} to="/register">
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LandingPage;
