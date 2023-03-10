const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: 'dat4u94dd',
    api_key: '556128978412287',
    api_secret: 'DXThe3sMdJljhdXAJGCms5dvHhg'
})

module.exports = cloudinary;