const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const matchUsers_schema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref : 'auth'
    },
    match_user: {
        type: Array
    },
    credit: {
        type: String,
        default: null
    },
    match_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
}, {
    collection: 'matchUsers'
})

module.exports = mongoose.model('matchUsers', matchUsers_schema);
// 6492950878d27be3b89d97b3
// 648173cb19a4de60e5bdc67f