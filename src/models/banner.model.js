const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema({
    image: {
        type: Array
    }
}, {
    timestamps: true
}, {
    collection: 'banner'
});

module.exports = mongoose.model('banner', bannerSchema);
