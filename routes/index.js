var express = require('express');
var router = express.Router();
var accountController = require('../controllers/index')

/* GET home page. */
router.get('/', accountController.getAccount)
router.post('/', accountController.loginAuthentication)
router.get('/register', accountController.getRegister)
router.post('/register', accountController.register)

router.post('/getlogin', accountController.getLogin)
router.get('/getprofile/:id', accountController.getProfileById)
router.get('/getall', accountController.getAll)

module.exports = router;