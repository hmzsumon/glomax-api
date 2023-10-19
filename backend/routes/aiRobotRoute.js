const express = require('express');
const {
	newAiRobot,
	loggedInUserAiRobot,
	cancelAiRobot,
	editAiRobot,
	updateAiRobot,
	getAllAiRobot,
	updateAiRobotAutoCreate,
	updateAllUsersAiRobot,
	getAllAiRobotAdmin,
	getSingleAiRobotAdmin,
	claimAiRobotProfit,
} = require('../controllers/aiRobotController');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
router.route('/aiRobot/new').post(isAuthenticatedUser, newAiRobot);

// my aiRobot
router.route('/aiRobot/me').get(isAuthenticatedUser, loggedInUserAiRobot);

// cancel aiRobot
router.route('/aiRobot/cancel').put(isAuthenticatedUser, cancelAiRobot);

// edit aiRobot
router.route('/aiRobot/edit').put(isAuthenticatedUser, editAiRobot);

// update aiRobot
router.route('/aiRobot/update').put(updateAiRobot);

// get all aiRobot
router.route('/aiRobot/all').get(isAuthenticatedUser, getAllAiRobot);

// update aiRobot auto create
router.route('/aiRobot/autoCreate').put(updateAiRobotAutoCreate);

// update all users aiRobot
router.route('/aiRobot/updateAll').put(updateAllUsersAiRobot);

// get all aiRobot admin
router
	.route('/admin/aiRobot/all')
	.get(
		isAuthenticatedUser,
		authorizeRoles('admin', 'manager'),
		getAllAiRobotAdmin
	);

// get single aiRobot admin
router
	.route('/admin/aiRobot/:id')
	.get(
		isAuthenticatedUser,
		authorizeRoles('admin', 'manager'),
		getSingleAiRobotAdmin
	);

// claim aiRobot profit
router
	.route('/aiRobot/claimProfit')
	.put(isAuthenticatedUser, claimAiRobotProfit);

module.exports = router;
