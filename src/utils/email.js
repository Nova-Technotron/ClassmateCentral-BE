import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    // Configure your email service provider here (e.g., Gmail, SendGrid)
});

export const sendPasswordResetEmail = (email, token) => {
    const mailOptions = {
        from: 'your-email@example.com',
        to: email,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n`
            + `Please click on the following link, or paste this into your browser to complete the process:\n\n`
            + `${process.env.CLIENT_URL}/reset-password/${token}\n\n`
            + `If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
