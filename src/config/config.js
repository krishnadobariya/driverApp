require("dotenv").config();

let CONFIG = {};

CONFIG.email = process.env.EMAIL || "0083.work@gmail.com";
CONFIG.password = process.env.PASSWORD || "izlsnoyieiqtaray";

module.exports = CONFIG;