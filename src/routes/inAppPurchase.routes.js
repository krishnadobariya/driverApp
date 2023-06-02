const router = require('express').Router();

const {
    insertInAppPurchase
} = require('../controllers/inAppPurchase.controller');


router.post('/insert/:user_id', insertInAppPurchase);

module.exports = router;