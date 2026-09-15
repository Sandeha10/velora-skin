import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailService {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(' ')[0] : 'Valued Customer';
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  // Create SMTP transporter dynamically based on environment
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Compile Pug template and dispatch via SMTP
  async send(template, subject, templateData = {}) {
    const templatePath = path.join(__dirname, `../views/emails/${template}.pug`);

    // 1. Render Pug template to raw HTML
    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject,
      ...templateData,
    });

    // 2. Build plain-text fallback
    const text = convert(html, {
      wordwrap: 130,
    });

    // 3. Define mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    // 4. Send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Velora Skin Collective');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your Velora Skin Password Reset Token (Valid 10 min)');
  }

  // Send Order Receipt Email
  async sendOrderReceipt(order) {
    const subject = `Velora Skin Confirmation — Receipt #${order._id}`;
    await this.send('orderReceipt', subject, { order });
  }
}