const http = require("http");
require('dotenv').config();
const { Server } = require("socket.io");
const app = require("./src/app");

const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`SETUP :- App listening on port ${port}!`)
})

const io = new Server(server);
require("./src/webSocket/socket")(io);