const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const notificationSchema = mongoose.Schema({
    group_id :{
        type: ObjectId,
        // required: true
    },
    user_id:{
        type: ObjectId,
        required: true
    },
    req_user_id: {
        type: ObjectId,
        // required: true
    },
    notification_msg : {
        type : String,
        required : true
    },
    notification_img : {
        type : String,
        required : true
    },
    user_name : {
        type : String,
        required : true
    },
    notification_type :{
        type : Number, //invite - 1, group join req. - 2, accepted req. - 3, matches - 4, following request - 5, follow request accept - 6
        required : true
    }
}, {
    timestamps: true
}, {
    collection: 'notification'
});

module.exports = mongoose.model('notification', notificationSchema);