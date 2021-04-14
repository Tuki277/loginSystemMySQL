var express = require('express');
var router = express.Router();
var accountController = require('../controllers/index')
const verifyToken = require('./../middleware/authUser')
const { authAdmin } = require('../middleware/authRole')

/* GET home page. */
router.get('/', accountController.getAccount)
router.post('/', accountController.loginAuthentication)
router.get('/register', accountController.getRegister)
router.post('/register', accountController.register)

router.post('/getlogin', accountController.getLogin)
router.get('/getprofile/:id', accountController.getProfileById)
router.get('/getall', accountController.getAll)

router.route('/addnoti')
    .post(verifyToken, authAdmin, accountController.postData)
    .get(accountController.getData)

router.route('/userstatus')
    .post(accountController.addUserStatus)
    .get(accountController.getUserStatus)

router.get('/getuserbyid/:id', accountController.getUserStatusById)
router.get('/getnotibyuser/:id', verifyToken, accountController.getNotiByUser)
router.patch('/updateaccount/:id', verifyToken, accountController.updateAccount)

module.exports = router;