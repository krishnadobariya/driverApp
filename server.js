const http = require("http");
require('dotenv').config();
const cron = require("node-cron");
const { Server } = require("socket.io");
const app = require("./src/app");
const socket = require("./src/webSocket/socket");

const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`SETUP :- App listening on port ${port}!`)
})

const io = new Server(server);
require("./src/webSocket/socket")(io);

// ---------- For cron that starts continuously ---------- //
cron.schedule('*/1 * * * * *', async () => {
    // io.emit('userStatusWithNoti', 'This is a message from the server!');
    // socket.emit('userStatusWithNoti', 'Cron job executed!');
});
// ---------- End For cron that starts continuously ---------- //