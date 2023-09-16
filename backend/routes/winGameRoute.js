const express = require('express');
const multer = require('multer');
const {
	getAllWinGames,
	getActiveTest,
	getActive1mWinGame,
	getActive3mWinGame,
	getActive5mWinGame,
	winGameCreateTrade,
	updateWinGame,
	getWinGamesResults,
	loggedInUserRecords,
	testSocket,
	updateAllWinGame,
	getParticipantsByGameId,
} = require('../controllers/winGameController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// get all win games
router.get('/win-games', getAllWinGames);

// get active test
router.get('/active-test', getActiveTest);

// get 1m active win game
router.get('/active-1m-win-game', getActive1mWinGame);

// get 3m active win game
router.get('/active-3m-win-game', getActive3mWinGame);

// get 5m active win game
router.get('/active-5m-win-game', getActive5mWinGame);

// win game create trade
router.post('/win-game-create-trade', winGameCreateTrade);

// update win game
router.put('/update-win-game', updateWinGame);

// get win games results
router.get('/win-games-results/:game_type', getWinGamesResults);

// get logged in user records
router.get('/logged-in-user-records/:id', loggedInUserRecords);

// test socket
router.get('/test-socket', testSocket);

// update all win game
router.put('/update-all-win-game', updateAllWinGame);

// get participants by game id
router.get(
	'/get-participants/:game_id',
	isAuthenticatedUser,
	authorizeRoles('admin'),
	getParticipantsByGameId
);
module.exports = router;
