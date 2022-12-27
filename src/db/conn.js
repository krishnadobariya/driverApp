const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://driverApp:driverApp@cluster0.kod8wg5.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Database Connected..")
})
.catch(() => {
    console.log("Database Not Connected")
})

//mongodb+srv://driverApp:driverApp@cluster0.kod8wg5.mongodb.net/?retryWrites=true&w=majority
// mongodb://localhost:27017/cityRiders