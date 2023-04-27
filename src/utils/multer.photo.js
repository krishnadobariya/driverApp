const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/images');
    },
    filename: (req, file, cb) => {
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
        let fileName = "";
        for (let i = 1; i <= 6; i++) {
            const nCode = Math.floor(Math.random() * 36);
            fileName += chars[nCode];
        }

        cb(null, Date.now() + '-' + fileName + path.extname(file.originalname));
    },
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "video/mp4" || file.mimetype == "video/MOV" || file.mimetype == "video/avi" || file.mimetype == "video/wmv" || file.mimetype == "video/m3u8" || file.mimetype == "video/webm" || file.mimetype == "video/flv" || file.mimetype == "video/ts" || file.mimetype == "video/3gp" || file.mimetype == "image/png" || file.mimetype == "image/apng" || file.mimetype == "image/avif" || file.mimetype == "image/gif" || file.mimetype == "image/svg+xml" || file.mimetype == "video/quicktime" || file.mimetype == "image/webp" || file.mimetype == "application/octet-stream") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Not all photo formats are allowed'));
        }
    }
});

module.exports = upload;

// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'src/public/images');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + '-' + file.originalname);
//     },
// });

// var upload = multer({
//     storage: storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png" || file.mimetype == "image/apng" || file.mimetype == "image/avif" || file.mimetype == "image/gif" || file.mimetype == "image/svg+xml" || file.mimetype == "image/webp") {
//             cb(null, true);
//         } else {
//             cb(null, false);
//             return cb(new Error('Only jpg or jpeg allowed'));
//         }
//     }
// });

// module.exports = upload;