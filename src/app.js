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

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/event", eventRouter);
app.use("/blog", blogRouter);
app.use("/group", groupRouter);
app.use("/groupList", groupListRouter);
app.use("/userPost", userPost);
// ---------- End Define Routes Here ---------- //


// ---------- For cron that starts continuously ---------- //
const { userStatus } = require("./controllers/cronJob.controller");
cron.schedule('*/1 * * * * *', async () => {

    userStatus()

});
// ---------- End For cron that starts continuously ---------- //

module.exports = app;