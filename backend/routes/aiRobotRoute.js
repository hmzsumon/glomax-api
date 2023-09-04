const express = require('express');
const {
	newAiRobot,
	loggedInUserAiRobot,
	cancelAiRobot,
	editAiRobot,
	updateAiRobot,
	getAllAiRobot,
	updateAiRobotAutoCreate,
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

module.exports = router;
