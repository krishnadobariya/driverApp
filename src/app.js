const express = require('express');
const app = express();
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();
require("./db/conn");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/images', express.static('images'));

// ---------- Define Routes Here ---------- //
const authRouter = require("./routes/auth.routes");
const chatRouter = require("./routes/chat.routes");
const eventRouter = require("./routes/event.routes");
const blogRouter = require("./routes/blog.routes");
const groupRouter = require("./routes/group.routes");
const groupListRouter = require("./routes/groupList.routes");
const userPost = require("./routes/userPost.routes");
const bannerPost = require("./routes/banner.routes");
const activityRouter = require('./routes/activity.routes');
const inAppPurchaseRouter = require('./routes/inAppPurchase.routes')

app.use("/auth", authRouter);
app.use("/blog", blogRouter); 
app.use("/chat", chatRouter);
app.use("/event", eventRouter);
app.use("/group", groupRouter);
app.use("/groupList", groupListRouter);
app.use("/userPost", userPost);
app.use("/banner", bannerPost);
app.use('/activity', activityRouter);
app.use("/inAppPurchase", inAppPurchaseRouter)
// ---------- End Define Routes Here ---------- //


// ---------- For cron that starts continuously ---------- //

const { userStatus, matchesCron } = require("./controllers/cronJob.controller");

cron.schedule('*/1 * * * * *', async () => {
    userStatus()
});

// const cronSchedule = '0 0 * * *'; // Runs at 12 AM every day
const cronSchedule = '*/5 * * * *';
cron.schedule(cronSchedule, () => {
  // console.log('Running cron job at 12 AM EDT');
  matchesCron()
}, {
  timezone: 'America/New_York' // Set the timezone to EDT
});

// ---------- End For cron that starts continuously ---------- //

module.exports = app;