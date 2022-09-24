const express = require('express');
const app = express();
const cors = require("cors");
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

app.use("/auth", authRouter);
app.use("/chat", chatRouter);

module.exports = app;