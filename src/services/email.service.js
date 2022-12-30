const nodemailer = require("nodemailer");
const CONFIG = require("../config/config");
const status = require("http-status");

var mailService = async (to, sub, html) => {
    try {

        let trasporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: CONFIG.email,
                pass: CONFIG.password
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        let mailOption = {
            from: CONFIG.email,
            to: to,
            subject: sub,
            html: html
        };

        trasporter.sendMail(mailOption, async (err, info) => {
            if (err) {
                return console.log("Err-sendMail::", err);
            } 
            console.log("Message Sent:-", info.accepted);
            console.log("Preview UTL:-", nodemailer.getTestMessageUrl(info));
        })

    } catch (error) {

        console.log("mailService-Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Error on mail service",
                status: false,
                code: 500,
                statusCode: 0,
                error: error.message
            }
        )

    }
}

module.exports.mailService = mailService;