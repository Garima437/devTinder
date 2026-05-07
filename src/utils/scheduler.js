const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const { sendConnectionRequestEmail } = require("./sendEmail");

const startScheduler = () => {
  // Runs every day at 8:00 AM IST (2:30 AM UTC)
  cron.schedule("30 2 * * *", async () => {
    console.log("⏰ Running 8 AM pending requests email job...");
    try {
      // Find all pending requests
      const pendingRequests = await ConnectionRequest.find({
        status: "interested"
      })
        .populate("fromUserId", "firstName")
        .populate("toUserId", "firstName emailId");

      // Group by toUserId to send one email per user
      const grouped = {};
      pendingRequests.forEach((req) => {
        if (!req.toUserId || !req.fromUserId) return;
        const email = req.toUserId.emailId;
        if (!grouped[email]) {
          grouped[email] = {
            toName: req.toUserId.firstName,
            toEmail: email,
            senders: []
          };
        }
        grouped[email].senders.push(req.fromUserId.firstName);
      });

      // Send one email per user with all pending requests
      for (const email in grouped) {
        const { toName, toEmail, senders } = grouped[email];
        await sendPendingRequestsEmail({ toName, toEmail, senders });
        console.log(`✅ Morning email sent to ${toEmail}`);
      }

    } catch (err) {
      console.error("❌ Scheduler error:", err.message);
    }
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log("✅ Email scheduler started - runs daily at 8 AM IST");
};

module.exports = { startScheduler };
