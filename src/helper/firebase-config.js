var admin = require("firebase-admin");
var serviceAccount = require("../helper/city-riders-26c00-firebase-adminsdk-q9iib-3dc8ba4b7f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = admin


