import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Paper, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SubscriptionCard from '../components/SubscriptionCard';
import PaymentHistory from '../components/PaymentHistory';
import ActionHistory from '../components/ActionHistory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Manual Upgrade Dialog State
    const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
    const [upgradeForm, setUpgradeForm] = useState({
        member_type: 'Τακτικό',
        duration_months: 12,
        amount: 500,
        payment_method: 'bank_transfer',
        notes: ''
    });
    const [upgrading, setUpgrading] = useState(false);

    // Role Change Dialog State
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [changingRole, setChangingRole] = useState(false);

    // Edit Profile State
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        fathers_name: '',
        id_number: '',
        email: '',
        phone: '',
        address: ''
    });
    const [savingEdit, setSavingEdit] = useState(false);

    // Notification state
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Pricing map
    const pricingMap = {
        'Τακτικό': { 1: 50, 3: 140, 6: 270, 9: 390, 12: 500 },
        'Υποστηρικτής': { 1: 30, 3: 85, 6: 160, 9: 230, 12: 300 }
    };

    const fetchData = async () => {
        try {
            const [userRes, subRes, payRes] = await Promise.all([
                api.get(`/users/${id}`),
                api.get(`/subscriptions/user/${id}`),
                api.get(`/payments/user/${id}`)
            ]);

            setMember(userRes.data);
            setSubscriptions(subRes.data);
            setPayments(payRes.data);

            // Fetch history
            try {
                const histRes = await api.get(`/users/${id}/history`);
                setHistory(histRes.data);
            } catch (err) {
                console.log('History endpoint not available');
                setHistory([]);
            }
        } catch (error) {
            console.error('Error fetching member details:', error);
            setNotification({ open: true, message: 'Error loading member details', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Update amount when member_type or duration changes
    useEffect(() => {
        const price = pricingMap[upgradeForm.member_type]?.[upgradeForm.duration_months];
        if (price) {
            setUpgradeForm(prev => ({ ...prev, amount: price }));
        }
    }, [upgradeForm.member_type, upgradeForm.duration_months]);

    const handleManualUpgrade = async () => {
        try {
            setUpgrading(true);
            await api.post(`/subscriptions/manual-upgrade/${id}`, upgradeForm);
            setNotification({ open: true, message: 'Subscription upgraded successfully!', severity: 'success' });
            setOpenUpgradeDialog(false);
            fetchData();
            // Reset form
            setUpgradeForm({
                member_type: 'Τακτικό',
                duration_months: 12,
                amount: 500,
                payment_method: 'bank_transfer',
                notes: ''
            });
        } catch (error) {
            console.error('Error upgrading subscription:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error upgrading subscription',
                severity: 'error'
            });
        } finally {
            setUpgrading(false);
        }
    };

    const handleRoleChange = async () => {
        try {
            setChangingRole(true);
            await api.patch(`/users/${id}/role`, { role: newRole });
            setNotification({ open: true, message: `Role successfully changed to ${newRole}!`, severity: 'success' });
            setOpenRoleDialog(false);
            fetchData();
        } catch (error) {
            console.error('Error changing role:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error changing role',
                severity: 'error'
            });
        } finally {
            setChangingRole(false);
        }
    };

    const openRoleChangeDialog = () => {
        setNewRole(member?.role === 'superadmin' ? 'user' : 'superadmin');
        setOpenRoleDialog(true);
    };

    const handleEditClick = () => {
        console.log('Member data for edit:', member);
        setEditForm({
            first_name: member.first_name || '',
            last_name: member.last_name || '',
            fathers_name: member.fathers_name || '',
            id_number: member.id_number || '',
            email: member.email || '',
            phone: member.phone || '',
            address: member.address || '',
            member_type: member.member_type // Preserve member type
        });
        setOpenEditDialog(true);
    };

    const handleEditSubmit = async () => {
        try {
            setSavingEdit(true);
            const res = await api.put(`/users/${id}`, editForm);
            setMember(res.data); // Update local state
            setNotification({ open: true, message: 'Profile updated successfully!', severity: 'success' });
            setOpenEditDialog(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error updating profile',
                severity: 'error'
            });
        } finally {
            setSavingEdit(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/members')} sx={{ mb: 2 }}>
                Back to Members
            </Button>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Member Details</Typography>
                        <Typography variant="h5" gutterBottom>{member?.first_name} {member?.last_name}</Typography>
                        <Typography><strong>Father's Name:</strong> {member?.fathers_name || '-'}</Typography>
                        <Typography><strong>ID Number:</strong> {member?.id_number || '-'}</Typography>
                        <Typography><strong>Email:</strong> {member?.email}</Typography>
                        <Typography><strong>Phone:</strong> {member?.phone || 'N/A'}</Typography>
                        <Typography><strong>Address:</strong> {member?.address || 'N/A'}</Typography>
                        <Typography><strong>Type:</strong> {member?.member_type || 'N/A'}</Typography>
                        <Typography><strong>Status:</strong> {member?.status}</Typography>
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography><strong>Role:</strong>
                                <Box component="span" sx={{
                                    ml: 1,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 1,
                                    bgcolor: member?.role === 'superadmin' ? 'error.main' : 'primary.main',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold'
                                }}>
                                    {member?.role === 'superadmin' ? 'SuperAdmin' : 'User'}
                                </Box>
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Button variant="outlined" size="small" onClick={handleEditClick}>
                                Edit Details
                            </Button>
                        </Box>
                    </Paper>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setOpenUpgradeDialog(true)}
                        sx={{ mb: 2 }}
                    >
                        Manual Subscription Upgrade
                    </Button>

                    <Button
                        variant="outlined"
                        color="warning"
                        fullWidth
                        onClick={openRoleChangeDialog}
                        sx={{ mb: 2 }}
                    >
                        {member?.role === 'superadmin' ? 'Demote to User' : 'Promote to SuperAdmin'}
                    </Button>
                </Grid>

                <Grid item xs={12} md={8}>
                    <SubscriptionCard subscription={subscriptions[0]} />
                    <PaymentHistory payments={payments} />
                    <ActionHistory history={history} userId={id} />
                </Grid>
            </Grid>

            {/* Manual Upgrade Dialog */}
            <Dialog open={openUpgradeDialog} onClose={() => !upgrading && setOpenUpgradeDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Manual Subscription Upgrade</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Member Type"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.member_type}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, member_type: e.target.value })}
                        >
                            <MenuItem value="Τακτικό">Τακτικό (Regular)</MenuItem>
                            <MenuItem value="Υποστηρικτής">Υποστηρικτής (Supporter)</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Duration"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.duration_months}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, duration_months: parseInt(e.target.value) })}
                        >
                            <MenuItem value={1}>1 Month</MenuItem>
                            <MenuItem value={3}>3 Months</MenuItem>
                            <MenuItem value={6}>6 Months</MenuItem>
                            <MenuItem value={9}>9 Months</MenuItem>
                            <MenuItem value={12}>12 Months</MenuItem>
                        </TextField>

                        <TextField
                            label="Amount (€)"
                            type="number"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.amount}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, amount: parseFloat(e.target.value) })}
                            helperText="Amount is auto-filled based on pricing, but can be adjusted"
                        />

                        <TextField
                            select
                            label="Payment Method"
                            fullWidth
                            margin="normal"
                            value={upgradeForm.payment_method}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, payment_method: e.target.value })}
                        >
                            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                        </TextField>

                        <TextField
                            label="Notes"
                            multiline
                            rows={3}
                            fullWidth
                            margin="normal"
                            value={upgradeForm.notes}
                            onChange={(e) => setUpgradeForm({ ...upgradeForm, notes: e.target.value })}
                            placeholder="Add any notes about this payment..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpgradeDialog(false)} disabled={upgrading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleManualUpgrade}
                        variant="contained"
                        disabled={upgrading}
                    >
                        {upgrading ? 'Processing...' : 'Upgrade Subscription'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Profile Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Member Details</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="First Name"
                                fullWidth
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                            />
                            <TextField
                                label="Last Name"
                                fullWidth
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                            />
                        </Box>
                        <TextField
                            label="Father's Name"
                            fullWidth
                            value={editForm.fathers_name}
                            onChange={(e) => setEditForm({ ...editForm, fathers_name: e.target.value })}
                        />
                        <TextField
                            label="ID Number"
                            fullWidth
                            value={editForm.id_number}
                            onChange={(e) => setEditForm({ ...editForm, id_number: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                        <TextField
                            label="Phone"
                            fullWidth
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                        <TextField
                            label="Address"
                            fullWidth
                            multiline
                            rows={2}
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" disabled={savingEdit}>
                        {savingEdit ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Role Change Dialog */}
            <Dialog open={openRoleDialog} onClose={() => !changingRole && setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {newRole === 'superadmin' ? 'Promote to SuperAdmin' : 'Demote to User'}
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <strong>Warning:</strong> This action will change the user's access level.
                    </Alert>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to {newRole === 'superadmin' ? 'promote' : 'demote'} <strong>{member?.first_name} {member?.last_name}</strong>?
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Current Role:</strong> {member?.role === 'superadmin' ? 'SuperAdmin' : 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>New Role:</strong> {newRole === 'superadmin' ? 'SuperAdmin' : 'User'}
                        </Typography>
                    </Box>
                    {newRole === 'superadmin' && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            SuperAdmins have full access to all system features including user management, statistics, and system settings.
                        </Alert>
                    )}
                    {newRole === 'user' && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Note: You cannot demote the last superadmin in the system.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRoleDialog(false)} disabled={changingRole}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRoleChange}
                        variant="contained"
                        color="warning"
                        disabled={changingRole}
                    >
                        {changingRole ? 'Processing...' : 'Confirm Role Change'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
            {/* Debug: Show raw member data */}
            <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    DEBUG DATA: {JSON.stringify(member, null, 2)}
                </Typography>
            </Box>

        </Container>
    );
};

export default MemberDetail;
