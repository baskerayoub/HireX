const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send an interview invitation email
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.candidateName - Candidate's name
   * @param {string} options.jobTitle - Job position title
   * @param {string} options.date - Interview date (YYYY-MM-DD)
   * @param {string} options.startTime - Start time (HH:MM)
   * @param {string} options.endTime - End time (HH:MM)
   * @param {string} options.meetingLink - Video call link
   * @param {string} options.interviewerName - Name of the interviewer
   * @param {string} options.notes - Additional notes
   */
  async sendInterviewInvitation({
    to,
    candidateName,
    jobTitle,
    date,
    startTime,
    endTime,
    meetingLink,
    interviewerName,
    notes,
  }) {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f7fb; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #5523e9, #7c3aed); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 16px; }
    .details-card { background: #f8f6ff; border: 1px solid #e9e3ff; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9e3ff; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-size: 14px; font-weight: 600; }
    .detail-value { color: #1e293b; font-size: 14px; font-weight: 500; }
    .btn { display: inline-block; background: #5523e9; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 13px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HireX</h1>
      <p>Interview Invitation</p>
    </div>
    <div class="body">
      <p class="greeting">Hello ${candidateName},</p>
      <p style="color: #475569; line-height: 1.6;">
        We're excited to invite you to an interview for the <strong>${jobTitle}</strong> position.
        Please find the details below:
      </p>
      
      <div class="details-card">
        <div class="detail-row">
          <span class="detail-label">📅 Date</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time</span>
          <span class="detail-value">${startTime} – ${endTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👤 Interviewer</span>
          <span class="detail-value">${interviewerName || "HR Team"}</span>
        </div>
        ${meetingLink ? `
        <div class="detail-row">
          <span class="detail-label">🔗 Meeting</span>
          <span class="detail-value"><a href="${meetingLink}" style="color: #5523e9;">Join Meeting</a></span>
        </div>
        ` : ""}
      </div>

      ${notes ? `<p style="color: #475569; line-height: 1.6;"><strong>Notes:</strong> ${notes}</p>` : ""}

      ${meetingLink ? `
      <div style="text-align: center;">
        <a href="${meetingLink}" class="btn">Join Interview</a>
      </div>
      ` : ""}

      <p style="color: #475569; line-height: 1.6;">
        If you have any questions or need to reschedule, please don't hesitate to reach out.
      </p>
      <p style="color: #475569;">Best regards,<br><strong>The HireX Team</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} HireX. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const mailOptions = {
      from: `"HireX" <${process.env.SMTP_USER || "noreply@hirex.com"}>`,
      to,
      subject: `Interview Invitation: ${jobTitle} — ${formattedDate}`,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Interview email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email send error:", error);
      throw new Error("Failed to send email: " + error.message);
    }
  }

  /**
   * Send a generic notification email
   */
  async sendNotification({ to, subject, message }) {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background: #f5f7fb; padding: 32px;">
  <div style="max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.05);">
    <h2 style="color: #5523e9; margin-top: 0;">HireX</h2>
    <p style="color: #475569; line-height: 1.6;">${message}</p>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">© ${new Date().getFullYear()} HireX</p>
  </div>
</body>
</html>`;

    return this.transporter.sendMail({
      from: `"HireX" <${process.env.SMTP_USER || "noreply@hirex.com"}>`,
      to,
      subject,
      html,
    });
  }
}

module.exports = new EmailService();
