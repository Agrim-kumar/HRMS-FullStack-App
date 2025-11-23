const { Team, Employee, EmployeeTeam, Log } = require('../models');

// Get all teams
const listTeams = async (req, res, next) => {
  try {
    const teams = await Team.findAll({
      where: { organisation_id: req.user.orgId },
      include: [{
        model: Employee,
        as: 'employees',
        attributes: ['id', 'first_name', 'last_name', 'email'],
        through: { attributes: [] }
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(teams);
  } catch (error) {
    next(error);
  }
};

// Get single team
const getTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findOne({
      where: { id, organisation_id: req.user.orgId },
      include: [{
        model: Employee,
        as: 'employees',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        through: { attributes: ['assigned_at'] }
      }]
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
};

// Create team
const createTeam = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      organisation_id: req.user.orgId,
      name,
      description
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'team_created',
      meta: { teamId: team.id, name, description }
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

// Update team
const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await Team.findOne({
      where: { id, organisation_id: req.user.orgId }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await team.update({
      name: name || team.name,
      description: description !== undefined ? description : team.description
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'team_updated',
      meta: { teamId: team.id, updates: { name, description } }
    });

    res.json(team);
  } catch (error) {
    next(error);
  }
};

// Delete team
const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await Team.findOne({
      where: { id, organisation_id: req.user.orgId }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const teamData = { ...team.toJSON() };
    await team.destroy();

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'team_deleted',
      meta: { teamId: id, ...teamData }
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign employee to team
const assignEmployee = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Verify team belongs to org
    const team = await Team.findOne({
      where: { id: teamId, organisation_id: req.user.orgId }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Verify employee belongs to org
    const employee = await Employee.findOne({
      where: { id: employeeId, organisation_id: req.user.orgId }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if already assigned
    const existing = await EmployeeTeam.findOne({
      where: { employee_id: employeeId, team_id: teamId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Employee already assigned to this team' });
    }

    // Create assignment
    await EmployeeTeam.create({
      employee_id: employeeId,
      team_id: teamId
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_assigned_to_team',
      meta: { employeeId, teamId, employeeName: `${employee.first_name} ${employee.last_name}`, teamName: team.name }
    });

    res.json({ message: 'Employee assigned to team successfully' });
  } catch (error) {
    next(error);
  }
};

// Unassign employee from team
const unassignEmployee = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    // Verify team belongs to org
    const team = await Team.findOne({
      where: { id: teamId, organisation_id: req.user.orgId }
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Find and delete assignment
    const assignment = await EmployeeTeam.findOne({
      where: { employee_id: employeeId, team_id: teamId }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Employee not assigned to this team' });
    }

    await assignment.destroy();

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_unassigned_from_team',
      meta: { employeeId, teamId }
    });

    res.json({ message: 'Employee unassigned from team successfully' });
  } catch (error) {
    next(error);
  }
};

// Get logs
const getLogs = async (req, res, next) => {
  try {
    const logs = await Log.findAll({
      where: { organisation_id: req.user.orgId },
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  assignEmployee,
  unassignEmployee,
  getLogs
};
