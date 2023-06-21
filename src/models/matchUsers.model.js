const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const matchUsers_schema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true,
        ref : 'auth'
    },
    match_id_one: {
        type: ObjectId,
        default: null
    },
    match_id_two: {
        type: ObjectId,
        default: null
    },
    match_id_three: {
        type: ObjectId,
        default: null
    },
    match_id_four: {
        type: ObjectId,
        default: null
    },
    match_id_five: {
        type: ObjectId,
        default: null
    },
    match_id_six: {
        type: ObjectId,
        default: null
    },
    match_id_seven: {
        type: ObjectId,
        default: null
    },
    match_id_eight: {
        type: ObjectId,
        default: null
    },
    match_id_nine: {
        type: ObjectId,
        default: null
    },
    match_id_ten: {
        type: ObjectId,
        default: null
    },
    match_id_eleven: {
        type: ObjectId,
        default: null
    },
    match_id_twelve: {
        type: ObjectId,
        default: null
    },
    match_id_thirteen: {
        type: ObjectId,
        default: null
    },
    match_id_fourteen: {
        type: ObjectId,
        default: null
    },
    match_id_fifteen: {
        type: ObjectId,
        default: null
    },
    match_id_sixteen: {
        type: ObjectId,
        default: null
    },
    match_id_seventeen: {
        type: ObjectId,
        default: null
    },
    match_id_eighteen: {
        type: ObjectId,
        default: null
    },
    match_id_nineteen: {
        type: ObjectId,
        default: null
    },
    match_id_twenty: {
        type: ObjectId,
        default: null
    },
    credit: {
        type: String,
        default: null
    }
}, {
    timestamps: true
}, {
    collection: 'matchUsers'
})

module.exports = mongoose.model('matchUsers', matchUsers_schema);
