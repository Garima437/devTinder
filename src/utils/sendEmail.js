const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConnectionRequestEmail = async ({ toEmail, toName, fromName }) => {
  try {
    await transporter.sendMail({
      from: `"DevTinder" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `${fromName} sent you a connection request on DevTinder!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="color: #3b82f6; text-align: center;">👩‍💻 DevTinder</h1>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: white;">Hey ${toName}! 👋</h2>
            <p style="color: #9ca3af; font-size: 16px;">
              <strong style="color: #3b82f6;">${fromName}</strong> has sent you a connection request on DevTinder.
            </p>
            <p style="color: #9ca3af;">
              Log in to accept or reject the request.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://13.60.253.32/requests" 
               style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View Request
            </a>
          </div>
          <p style="color: #4b5563; font-size: 12px; text-align: center; margin-top: 24px;">
            DevTinder - Connect with developers worldwide
          </p>
        </div>
      `,
    });
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
};

module.exports = { sendConnectionRequestEmail };

const sendPendingRequestsEmail = async ({ toName, toEmail, senders }) => {
  try {
    const senderList = senders.map(name => `<li style="color: #3b82f6; padding: 4px 0;">👨‍💻 ${name}</li>`).join("");
    
    await transporter.sendMail({
      from: `"DevTinder" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `You have ${senders.length} pending connection request(s) on DevTinder!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="color: #3b82f6; text-align: center;">👩‍💻 DevTinder</h1>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: white;">Good Morning, ${toName}! ☀️</h2>
            <p style="color: #9ca3af; font-size: 16px;">
              You have <strong style="color: #3b82f6;">${senders.length} pending connection request(s)</strong> waiting for you:
            </p>
            <ul style="list-style: none; padding: 0; margin: 16px 0;">
              ${senderList}
            </ul>
            <p style="color: #9ca3af;">Log in to accept or reject these requests.</p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="http://13.60.253.32/requests" 
               style="background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View Requests
            </a>
          </div>
          <p style="color: #4b5563; font-size: 12px; text-align: center; margin-top: 24px;">
            DevTinder - Connect with developers worldwide
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("❌ Morning email failed:", err.message);
  }
};

module.exports = { sendConnectionRequestEmail, sendPendingRequestsEmail };
