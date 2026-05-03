import nodemailer from 'nodemailer'
import config from '../config/index.js';

const { SMTP_HOST, SMTP_PORT, SMTP_PASS, SMTP_USER } = config;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    ...(process.env.SMTP_USER && process.env.SMTP_PASS && {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    }),
})

export const sendEmail = async ({ to, subject, html }) => {
    return transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
    })
}
