const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const inAppPurchase_schema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref : 'auth'
    },
    orderId: {
        type: String,
        required: true,
    },
    phone_type: {
        type: String,
        required: true
    },
    purchaseTime: {
        type: String,
        required: true
    },
    purchaseToken: {
        type: String,
        required: true
    },
    credit: {
        type: String,
        required: true
    },
    subscription_type: {
        type: String,      // 1 - map (month) and 2 - matches
        required: true
    }
}, {
    timestamps: true
}, {
    collection: 'inAppPurchase'
})

module.exports = mongoose.model('inAppPurchase', inAppPurchase_schema);
