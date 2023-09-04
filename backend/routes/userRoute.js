const express = require('express');
const multer = require('multer');
const {
	seedUser,
	registerUser,
	verifyEmail,
	getUsers,
	createPassword,
	loginUser,
	logout,
	getTeam,
	resendEmailVerification,
	registerDone,
	checkUserByEmail,
	loadUser,
	getLevel1Members,
	changeEmail,
	verifyCodeForChangeEmail,
	addPhoneNumber,
	securityVerify,
	changePhoneNumber,
	updateProfilePicture,
	updateFullName,
	adminLogin,
	getUserDetails,
} = require('../controllers/userController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();
const upload = multer({});

const storage = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			return cb(res.status(400).end('only jpg, png, jpeg is allowed'), false);
		}
		cb(null, true);
	},
});

// seed user
router.route('/seed').post(seedUser);

// register user
router.route('/register').post(upload.none(), registerUser);

// verify email
router.route('/verify-email').post(verifyEmail);

// get all users
router
	.route('/admin/users')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);

// create password
router.route('/create-password').post(createPassword);

// login user
router.route('/login').post(loginUser);

// logout user
router.route('/logout/:email').post(logout);

// get my team
router.route('/my-team/:id').get(getTeam);

// resend email verification
router.route('/resend-email-verification').post(resendEmailVerification);

// register done
router.route('/register-done').post(registerDone);

// check user by email
router.route('/check-user-by-email').post(checkUserByEmail);

// load user
router.route('/load-user').get(isAuthenticatedUser, loadUser);

// get level 1 members
router
	.route('/get-level-1-members/:id')
	.get(isAuthenticatedUser, getLevel1Members);

// change email
router.route('/change-email').put(changeEmail);

// verify code for change email
router.route('/verify-code-for-change-email').post(verifyCodeForChangeEmail);

// add phone number
router.route('/add-phone-number').put(addPhoneNumber);

// security verify
router.route('/security-verify').post(securityVerify);

// change phone number
router.route('/change-phone-number').put(changePhoneNumber);

// update profile picture
router
	.route('/update-profile-picture')
	.put(storage.single('image'), updateProfilePicture);

// update full name
router.route('/update-full-name').put(updateFullName);

// admin login
router.route('/admin-login').post(adminLogin);

// get user details by id
router
	.route('/admin/user/:id')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails);

module.exports = router;
