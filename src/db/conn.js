const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://td:td_0083@cluster0.71szoqm.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Database Connected..")
})
.catch(() => {
    console.log("Database Not Connected")
})