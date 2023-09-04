const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
	newDraw,
	getActiveDraw,
	getDrawForAdmin,
	publishWinners,
	getLastDraw,
	updateDraw,
} = require('../controllers/drawController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const upload = multer({});

// crete new draw => /api/v1/draw/new
router
	.route('/new/draw')
	.post(isAuthenticatedUser, authorizeRoles('admin'), newDraw);

// get active draw => /api/v1/draw/active
router.route('/active/draw').get(isAuthenticatedUser, getActiveDraw);

// get draw for admin => /api/v1/draw/admin
router
	.route('/admin/draw')
	.get(isAuthenticatedUser, authorizeRoles('admin'), getDrawForAdmin);

// publish winners
router.post(
	'/winners/publish',
	upload.none(),
	isAuthenticatedUser,
	authorizeRoles('admin'),
	publishWinners
);

// get last draw
router.route('/last/draw').get(isAuthenticatedUser, getLastDraw);

// update draw
router
	.route('/update/draw/:id')
	.put(upload.none(), isAuthenticatedUser, authorizeRoles('admin'), updateDraw);

module.exports = router;
