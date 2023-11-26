const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const {
	createDeposit,
	getUserDeposits,
	getAllDeposits,
	deleteAllPendingDeposits,
	getSingleDeposit,
	approveDeposit,
	rejectDeposit,
	addSlNo,
	getDepositByTransactionId,
	addTxId,
	getAllTxId,
	findDepositsBySlNo,
	reRejectDeposit,
} = require('../controllers/depositController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
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
// get all deposits
router.get(
	'/admin/deposits',
	isAuthenticatedUser,
	authorizeRoles('admin', 'manager'),
	getAllDeposits
);
router.post('/new/deposit', isAuthenticatedUser, createDeposit);
router.get('/deposits/me', isAuthenticatedUser, getUserDeposits);

// delete all pending deposits
router.delete('/deposit/delete/pending', deleteAllPendingDeposits);

// get single deposit
router.get('/deposit/:id', isAuthenticatedUser, getSingleDeposit);

// approve deposit
router.put(
	'/deposit/approve',
	upload.none(),
	isAuthenticatedUser,
	authorizeRoles('admin', 'manager'),
	approveDeposit
);

// reject deposit
router.put(
	'/deposit/reject',
	upload.none(),
	isAuthenticatedUser,
	authorizeRoles('admin', 'manager'),
	rejectDeposit
);

// add sl no
router.put('/deposit/add/sl-no', addSlNo);

// get deposit by transaction id
router.get('/demo-deposits', getDepositByTransactionId);

// add tx id
router.post('/add/tx-id', addTxId);

// get all tx id
router.get('/all/tx-id', getAllTxId);

// find deposits by sl no
router.put('/find/deposits/sl-no', findDepositsBySlNo);

// re-reject deposit
router.put(
	'/deposit/re-reject/:id',
	isAuthenticatedUser,
	authorizeRoles('admin', 'manager'),
	reRejectDeposit
);
module.exports = router;
