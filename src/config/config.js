require("dotenv").config();

let CONFIG = {};

CONFIG.email = process.env.EMAIL || "5876.urvi@gmail.com";
CONFIG.password = process.env.PASSWORD || "xojojghoarmbytgp";

module.exports = CONFIG;