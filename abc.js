socket.on('checkInAppPurchase', async (arg) => {
    const userId = arg.user_id;
    const subscription_type = arg.subscription_type;
    const userRoom = `User${arg.user_id}`;

    if (subscription_type == 1) {

        const findData = await InAppPurchaseModel.find({ user_id: userId, subscription_type: 1 });
        console.log("findData", findData);

        if (findData[0] === undefined) {
            io.to(userRoom).emit("inAppPurchaseOrNot", "User In App Purchase Not Found");
        } else {

            const timestamp = parseFloat(findData[0].purchaseTime);
            const date = new Date(timestamp);
            console.log("date", date);
            console.log("findData[0].credit", findData[0].credit);

            // ---------------------------------------------------------------------
            // Convert input date to JavaScript Date object
            var datee = new Date(date);
            var monthsToAdd = parseFloat(findData[0].credit);

            // Add 3 months to the date
            datee.setMonth(datee.getMonth() + monthsToAdd);

            // Format the date as DD-MM-YYYY
            var day = datee.getDate();
            var month = datee.getMonth() + 1; // Months are zero-based
            var year = datee.getFullYear();

            // Padding with leading zeros if necessary
            day = day < 10 ? "0" + day : day;
            month = month < 10 ? "0" + month : month;

            // Formatted date string
            var formattedDate = day + "-" + month + "-" + year;

            console.log(formattedDate);
            // ---------------------------------------------------------------------

            const currentDate = new Date();

            const futureDate = new Date(date.getTime());
            futureDate.setMonth(futureDate.getMonth() + parseFloat(findData[0].credit));

            const remainingTimeMs = futureDate - currentDate;

            let remainingTime;
            let timeUnits = [];
            let remaining_time;

            if (remainingTimeMs >= 0) {
                if (remainingTimeMs < 24 * 60 * 60 * 1000) {
                    // Less than a day remaining
                    remainingTime = Math.floor(remainingTimeMs / (60 * 60 * 1000)); // Remaining hours
                    timeUnits.push({ unit: 'hours', value: remainingTime });
                } else if (remainingTimeMs < 30 * 24 * 60 * 60 * 1000) {
                    // Less than a month remaining
                    remainingTime = Math.floor(remainingTimeMs / (24 * 60 * 60 * 1000)); // Remaining days
                    timeUnits.push({ unit: 'days', value: remainingTime });
                    let remainingMs = remainingTimeMs % (24 * 60 * 60 * 1000);
                    remainingTime = Math.floor(remainingMs / (60 * 60 * 1000)); // Remaining hours
                    timeUnits.push({ unit: 'hours', value: remainingTime });
                } else {
                    // More than a month remaining
                    remainingTime = Math.floor(remainingTimeMs / (30 * 24 * 60 * 60 * 1000)); // Remaining months
                    timeUnits.push({ unit: 'months', value: remainingTime });
                    let remainingMs = remainingTimeMs % (30 * 24 * 60 * 60 * 1000);
                    remainingTime = Math.floor(remainingMs / (24 * 60 * 60 * 1000)); // Remaining days
                    timeUnits.push({ unit: 'days', value: remainingTime });
                    remainingMs %= 24 * 60 * 60 * 1000;
                    remainingTime = Math.floor(remainingMs / (60 * 60 * 1000)); // Remaining hours
                    timeUnits.push({ unit: 'hours', value: remainingTime });
                }

                remaining_time = `Remaining: ${timeUnits.map(unit => `${unit.value} ${unit.unit}`).join(', ')}`
            } else {
                remaining_time = `Remaining: 0 months, 0 days, 0 hours`
            }

            const sliceData = findData.slice(1)
            // console.log("sliceData", sliceData);
            
            // console.log("remaining_time", remaining_time);
            const resp = remaining_time.split(" ")
            
            let timing = `Remaining: 0 months, 0 days, 0 hours`;
            for (const [index, findTime] of sliceData.entries()) {

                if(index == 0 && resp[2] == "months,") {
                    timing = `Remaining: ${parseInt(resp[1]) + parseInt(findTime.credit)} ${resp[2]} ${resp[3]} ${resp[4]} ${resp[5]} ${resp[6]}`
                } else {

                    const split_timing = timing.split(" ")
                    if(resp[2] == "months,") {
                        timing = `Remaining: ${parseInt(split_timing[1]) + parseInt(findTime.credit)} ${split_timing[2]} ${resp[3]} ${resp[4]} ${resp[5]} ${resp[6]}`
                    } else if(resp[2] == "days,") {
                        timing = `Remaining: ${parseInt(split_timing[1]) + parseInt(findTime.credit)} ${split_timing[2]} ${resp[1]} ${resp[2]} ${resp[3]} ${resp[4]}`
                    } else {
                        timing = `Remaining: ${parseInt(split_timing[1]) + parseInt(findTime.credit)} ${split_timing[2]} 0 days, ${resp[3]} ${resp[4]}`
                    }
                    
                }

            }     
            console.log("timing", timing);               

            const findMonth = timing.split(" ")
            console.log("findMonth[1]", findMonth[1]);

            // Add the remaining time to the current date
            var future_Date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + parseInt(findMonth[1]),
                currentDate.getDate() + parseInt(findMonth[3]),
                currentDate.getHours() + parseInt(findMonth[5]),
                currentDate.getMinutes(),
                currentDate.getSeconds()
            );

            // Format the future date as DD-MM-YYYY
            var formattedDate = ("0" + future_Date.getDate()).slice(-2) + "-" +
                ("0" + (future_Date.getMonth() + 1)).slice(-2) + "-" +
                future_Date.getFullYear();

            console.log("formattedDate", formattedDate);

            const response = {
                validity: formattedDate,
                remaining_time: timing,
                success: 1
            }
            io.to(userRoom).emit("inAppPurchaseOrNot", response);
        }

    } else {
        console.log("subscription_type = 2");

        const findData = await InAppPurchaseModel.find({ user_id: userId, subscription_type: 2 });
        console.log("findData", findData);

        if (findData[0] === undefined) {
            io.to(userRoom).emit("inAppPurchaseOrNot", "User In App Purchase Not Found");
        } else {
            const resArr = [];

            for (const checkCredit of findData) {

                if (checkCredit.credit == 0) {
                    const response = {
                        InAppPurchase_id: checkCredit._id,
                        message: "Pack is over",
                        success: 0
                    };
                    resArr.push(response);
                } else {
                    const response = {
                        InAppPurchase_id: checkCredit._id,
                        message: "Pack is running",
                        success: 1
                    };
                    resArr.push(response);
                }

            }

            console.log("resArr", resArr);
            io.to(userRoom).emit("inAppPurchaseOrNot", resArr);
        }

    }

});