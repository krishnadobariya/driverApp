const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const userQuestionSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        required: true
    },
    que_one: {
        type: String,
        required: true
    },
    que_two: {
        type: String,
        required: true
    },
    que_three: {
        type: String,
        required: true
    },
    que_four: {
        type: String,
        required: true
    },
    que_five: {
        type: String,
        required: true
    },
    que_six: {
        type: String,
        required: true
    },
    que_seven: {
        type: String,
        required: true
    },
    que_eight: {
        type: String,
        required: true
    },
    que_nine: {
        type: String,
        required: true
    },
    que_ten: {
        type: String,
        required: true
    },
}, {
    timestamps: true
}, {
    collection: 'userQuestions'
});

module.exports = mongoose.model('userQuestions', userQuestionSchema);