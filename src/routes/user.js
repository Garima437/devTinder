




// const express = require("express");
// const userRouter = express.Router();
// const { userAuth } = require("../middlewares/auth");
// const ConnectionRequest = require("../models/connectionRequest");
// const User = require("../models/user");
// const Message = require("../models/message"); // ✅ Added Message Model

// const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// // 1. Get Received Requests
// userRouter.get("/received", userAuth, async (req, res) => {
//     try {
//         const loggedInUser = req.user;
//         const connectionRequests = await ConnectionRequest.find({
//             toUserId: loggedInUser._id,
//             status: "interested",
//         })
//         .populate("fromUserId", USER_SAFE_DATA)
//         .sort({ createdAt: -1 });

//         res.status(200).json({
//             message: "Requests fetched successfully",
//             data: connectionRequests,
//         });
//     } catch (err) {
//         res.status(500).json({ message: "Server error" });
//     }
// });

// // 2. Get All Connections (Matches)
// userRouter.get("/connections", userAuth, async (req, res) => {
//     try {
//         const loggedInUser = req.user;

//         const connectionRequests = await ConnectionRequest.find({
//             $or: [
//                 { toUserId: loggedInUser._id, status: "accepted" },
//                 { fromUserId: loggedInUser._id, status: "accepted" },
//             ],
//         })
//         .populate("fromUserId", USER_SAFE_DATA)
//         .populate("toUserId", USER_SAFE_DATA);

//         const data = connectionRequests.map((row) => {
//             if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
//                 return row.toUserId;
//             }
//             return row.fromUserId;
//         });

//         res.json({ data });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// // 3. The Feed (Users you haven't interacted with)
// userRouter.get("/feed", userAuth, async (req, res) => {
//     try {
//         const loggedInUser = req.user;
//         const page = parseInt(req.query.page) || 0;
//         const limit = 10;

//         const connectionRequests = await ConnectionRequest.find({
//             $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
//         }).select("fromUserId toUserId");

//         const excludeUserIds = new Set();
//         excludeUserIds.add(loggedInUser._id.toString());

//         connectionRequests.forEach((req) => {
//             excludeUserIds.add(req.fromUserId.toString());
//             excludeUserIds.add(req.toUserId.toString());
//         });

//         const users = await User.find({
//             _id: { $nin: Array.from(excludeUserIds) },
//         })
//         .select(USER_SAFE_DATA)
//         .skip(page * limit)
//         .limit(limit);

//         res.status(200).json({ data: users });
//     } catch (err) {
//         res.status(500).json({ message: "Failed to load feed" });
//     }
// });

// // 4. Chat History Route ✅ ADDED
// userRouter.get("/chat/:connectionId", userAuth, async (req, res) => {
//     try {
//         const { connectionId } = req.params;

//         // Fetch messages belonging to this connection
//         const messages = await Message.find({ connectionId })
//             .sort({ createdAt: 1 }); // Oldest first to newest at bottom

//         res.status(200).json({ data: messages });
//     } catch (err) {
//         res.status(500).json({ message: "Error fetching history" });
//     }
// });

// // 5. Roommate Matches (Based on habits)
// userRouter.get("/matches", userAuth, async (req, res) => {
//     try {
//         const loggedInUser = req.user;

//         const matches = await User.find({
//             _id: { $ne: loggedInUser._id },
//             gender: loggedInUser.gender,
//             $and: [
//                 { sleepHabit: loggedInUser.sleepHabit },
//                 { foodPreference: loggedInUser.foodPreference }
//             ]
//         }).select("firstName lastName photoUrl sleepHabit foodPreference cleanliness");

//         res.json({ data: matches });
//     } catch (err) {
//         res.status(400).json({ message: "Error fetching matches: " + err.message });
//     }
// });

// module.exports = userRouter;




const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const Message = require("../models/message");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

/* ================= 1. GET RECEIVED REQUESTS ================= */
userRouter.get("/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Requests fetched successfully",
            data: connectionRequests,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

/* ================= 2. GET ALL CONNECTIONS (MATCHES) ================= */
userRouter.get("/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" },
            ],
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        // ✅ FIXED: Added null checks to prevent crashing if a user is deleted
        const data = connectionRequests.map((row) => {
            if (!row.fromUserId || !row.toUserId) return null;

            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        }).filter(Boolean); // Remove any null entries

        res.json({ data });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* ================= 3. THE FEED ================= */
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 0;
        const limit = 10;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        }).select("fromUserId toUserId");

        const excludeUserIds = new Set();
        excludeUserIds.add(loggedInUser._id.toString());

        connectionRequests.forEach((reqDoc) => {
            excludeUserIds.add(reqDoc.fromUserId.toString());
            excludeUserIds.add(reqDoc.toUserId.toString());
        });

        const users = await User.find({
            _id: { $nin: Array.from(excludeUserIds) },
        })
        .select(USER_SAFE_DATA)
        .skip(page * limit)
        .limit(limit);

        res.status(200).json({ data: users });
    } catch (err) {
        res.status(500).json({ message: "Failed to load feed" });
    }
});

/* ================= 4. CHAT HISTORY ================= */
userRouter.get("/chat/:connectionId", userAuth, async (req, res) => {
    try {
        const { connectionId } = req.params;

        // Fetch messages belonging to this connection
        const messages = await Message.find({ connectionId })
            .sort({ createdAt: 1 });

        res.status(200).json({ data: messages });
    } catch (err) {
        res.status(500).json({ message: "Error fetching history" });
    }
});

module.exports = userRouter;