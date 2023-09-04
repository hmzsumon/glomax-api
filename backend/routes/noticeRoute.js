const express = require('express');
const multer = require('multer');
const {
	createNotice,
	getAllNotices,
	getSingleNotice,
	updateNotice,
	findNoticeByActive,
	deleteNotice,
	activeNewNotice,
} = require('../controllers/noticeController');
const { isAuthenticatedUser } = require('../middleware/auth');

const upload = multer({});

const router = express.Router();

// create a new notice
router.route('/notice').post(upload.none(), isAuthenticatedUser, createNotice);

// get all notices
router.route('/notices').get(getAllNotices);

// get single notice
router.route('/notice/:id').get(getSingleNotice);

// update notice
router
	.route('/notice/:id')
	.put(upload.none(), isAuthenticatedUser, updateNotice);

// get active notices
router.route('/active-notices').get(findNoticeByActive);

// delete notice
router.route('/notice/:id').delete(isAuthenticatedUser, deleteNotice);

// update notice status
router.route('/notice/status/:id').put(isAuthenticatedUser, updateNotice);

// activate notice by id
router.route('/notice/activate/:id').put(activeNewNotice);

module.exports = router;
