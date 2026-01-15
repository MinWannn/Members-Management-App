import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Button, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SubscriptionCard from '../components/SubscriptionCard';
import PaymentHistory from '../components/PaymentHistory';
import ActionHistory from '../components/ActionHistory';
import BankAccountInfo from '../components/BankAccountInfo';
import StripePaymentForm from '../components/StripePaymentForm';

const UserProfile = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(user); // Initialize with context user, but update with fetch
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, payRes, histRes, profileRes] = await Promise.all([
                    api.get(`/subscriptions/user/${user.id}`),
                    api.get(`/payments/user/${user.id}`),
                    api.get(`/export/user/${user.id}/history`, { responseType: 'json' }).catch(() => ({ data: [] })),
                    api.get('/auth/me').catch(() => ({ data: user })) // Fallback to context user if fail
                ]);

                setSubscriptions(subRes.data);
                setPayments(payRes.data);
                if (profileRes.data) {
                    setProfile(profileRes.data);
                }
                // setHistory(histRes.data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Personal Information</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                                <Typography variant="body1">{profile.first_name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                                <Typography variant="body1">{profile.last_name}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Father's Name</Typography>
                                <Typography variant="body1">{profile.fathers_name || '-'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">ID Number</Typography>
                                <Typography variant="body1">{profile.id_number || '-'}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                <Typography variant="body1">{profile.email}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                <Typography variant="body1">{profile.phone || '-'}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                <Typography variant="body1">{profile.address || '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    <SubscriptionCard subscription={subscriptions[0]} />
                    <PaymentHistory payments={payments} />
                    {/* <ActionHistory history={history} userId={user.id} /> */}
                </Grid>

                <Grid item xs={12} md={4}>
                    <BankAccountInfo />
                    <StripePaymentForm />
                </Grid>
            </Grid>
        </Container>
    );
};

export default UserProfile;
