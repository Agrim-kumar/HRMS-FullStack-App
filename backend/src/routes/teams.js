const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  assignEmployee,
  unassignEmployee,
  getLogs
} = require('../controllers/teamController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', listTeams);
router.get('/logs', getLogs);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:teamId/assign', assignEmployee);
router.post('/:teamId/unassign', unassignEmployee);

module.exports = router;
