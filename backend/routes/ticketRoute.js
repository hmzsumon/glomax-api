const express = require('express');
const multer = require('multer');
const {
	createTickets,
	raffleDraw,
	getTickets,
	buyTicket,
	getUserTickets,
	getUserLuckyBoxes,
	openLuckyBox,
	getDrawByDate,
	getAllSoldTickets,
	publishWinners,
	getAllWinners,
	getRemainingTickets,
} = require('../controllers/ticketController');
const router = express.Router();

const upload = multer({});

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

// create some tickets
router.post(
	'/tickets',
	// isAuthenticatedUser,
	// authorizeRoles('admin'),
	upload.none(),
	createTickets
);

router.get('/draw', raffleDraw);

// generate some winners

// get tickets with limit and skip
router.get('/tickets', getTickets);

// buy a ticket by id
router.post('/ticket/buy/:id', isAuthenticatedUser, buyTicket);

// get logged in user's tickets
router.get('/user/tickets', isAuthenticatedUser, getUserTickets);

// get logged in user's lucky box
router.get('/lucky-boxes', isAuthenticatedUser, getUserLuckyBoxes);

// open lucky box
router.post('/lucky-boxes/:id', isAuthenticatedUser, openLuckyBox);

// find tickets by draw date
router.get('/raffle-draw', getDrawByDate);

// get all isSold tickets
router.get('/sold/tickets', getAllSoldTickets);

// get all winners
router.get('/winners', getAllWinners);

// get remaining tickets
router.get('/remaining/tickets', getRemainingTickets);

module.exports = router;
