const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email credentials not set. Skipping email.');
        console.log(`To: ${to}, Subject: ${subject}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Members App'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to avoid blocking the main flow, but log it
    }
};

const sendRegistrationNotificationToAdmin = async (user) => {
    const subject = 'New Member Registration';
    const html = `
    <h2>New Member Registration</h2>
    <p>A new member has registered and is pending approval.</p>
    <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Member Type:</strong> ${user.member_type}</p>
    <p>Please log in to the admin dashboard to approve or deny this request.</p>
  `;
    // In a real app, you'd fetch admin emails from DB or config
    // For now, sending to the configured email user (assuming it's the admin)
    await sendEmail(process.env.EMAIL_USER, subject, html);
};

const sendRegistrationConfirmationToUser = async (user) => {
    const subject = 'Registration Received - Pending Approval';
    const html = `
    <h2>Registration Received</h2>
    <p>Hello ${user.first_name} ${user.last_name},</p>
    <p>Thank you for registering. Your account is currently under review.</p>
    <p>You will receive another email once your account has been approved.</p>
  `;
    await sendEmail(user.email, subject, html);
};

const sendApprovalEmail = async (user) => {
    const subject = 'Account Approved';
    const html = `
    <h2>Account Approved</h2>
    <p>Hello ${user.first_name} ${user.last_name},</p>
    <p>Your account has been approved! You can now log in and access your profile.</p>
    <p>Thank you for joining us.</p>
  `;
    await sendEmail(user.email, subject, html);
};

const sendDenialEmail = async (user) => {
    const subject = 'Account Registration Denied';
    const html = `
    <h2>Registration Denied</h2>
    <p>Hello ${user.first_name} ${user.last_name},</p>
    <p>Unfortunately, your registration has been denied.</p>
    <p>If you believe this is an error, please contact us.</p>
  `;
    await sendEmail(user.email, subject, html);
};

module.exports = {
    sendEmail,
    sendRegistrationNotificationToAdmin,
    sendRegistrationConfirmationToUser,
    sendApprovalEmail,
    sendDenialEmail
};
