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
	getTransactions,
	getAdminTransactions,
	addParent4And5,
	updateAllUsersRankIsProcessing,
	claimRankBonus,
	updateAllUsersIsBlock,
	changeUserStatus,
	changeBlockStatus,
	updateRankRecords,
	getRankRecord,
	createAllActiveUserRankRecord,
	getRankMembers,
	getRankMembersByRank,
	removePreviousMonthTransactions,
	remove5AgoTransactions,
	checkUserBalance,
	updateAllUsersIsActive,
	changePassword,
	submitKyc,
	updateAllTotalCommission,
	addPaymentMethod,
	addPromoCode,
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
router.route('/logout/:email').post(isAuthenticatedUser, logout);

// get my team
router.route('/my-team/:id').get(isAuthenticatedUser, getTeam);

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

// get transactions
router.route('/transactions').get(isAuthenticatedUser, getTransactions);

// get admin transactions
router
	.route('/admin/transactions/:id')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getAdminTransactions);

// add parent 4 and 5
router.route('/add-parent-4-and-5').put(addParent4And5);

// update all users rank is processing
router
	.route('/update-all-users-rank-is-processing')
	.put(updateAllUsersRankIsProcessing);

// claim rank bonus
router.route('/claim-rank-bonus').put(isAuthenticatedUser, claimRankBonus);

// update all users is block
router.route('/update-all-users-is-block').put(updateAllUsersIsBlock);

// change user status
router.route('/change-user-status').put(changeUserStatus);

// change block status
router.route('/change-block-status').put(changeBlockStatus);

// update rank records
router.route('/update-rank-records').put(updateRankRecords);

// get rank record
router.route('/my-rank-record').get(isAuthenticatedUser, getRankRecord);

// create all active user rank record
router
	.route('/create-all-active-user-rank-record')
	.put(createAllActiveUserRankRecord);

// get rank members
router.route('/get-rank-members').get(isAuthenticatedUser, getRankMembers);

// get rank members by rank
router
	.route('/get-rank-members-by-rank/:rank')
	.get(isAuthenticatedUser, getRankMembersByRank);

// remove previous month transactions
router
	.route('/remove-previous-month-transactions')
	.delete(remove5AgoTransactions);

// check user balance
router.route('/check-user-balance').put(checkUserBalance);

// update all users is active
router.route('/update-all-users-is-active').put(updateAllUsersIsActive);

// change password
router.route('/change-password').put(isAuthenticatedUser, changePassword);

// submit kyc
router.route('/submit-kyc').post(isAuthenticatedUser, submitKyc);

// update all total commission
router.route('/update-all-total-commission').put(updateAllTotalCommission);

// add payment method
router.route('/add-payment-method').post(isAuthenticatedUser, addPaymentMethod);

// add promo code
router.route('/add-promo-code').post(addPromoCode);

module.exports = router;
