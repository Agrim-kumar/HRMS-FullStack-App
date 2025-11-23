const { Employee, Team, Log } = require('../models');

// Get all employees
const listEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { organisation_id: req.user.orgId },
      include: [{
        model: Team,
        as: 'teams',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(employees);
  } catch (error) {
    next(error);
  }
};

// Get single employee
const getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      where: { id, organisation_id: req.user.orgId },
      include: [{
        model: Team,
        as: 'teams',
        attributes: ['id', 'name', 'description'],
        through: { attributes: ['assigned_at'] }
      }]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

// Create employee
const createEmployee = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const employee = await Employee.create({
      organisation_id: req.user.orgId,
      first_name,
      last_name,
      email,
      phone
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_created',
      meta: { employeeId: employee.id, first_name, last_name, email }
    });

    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

// Update employee
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone } = req.body;

    const employee = await Employee.findOne({
      where: { id, organisation_id: req.user.orgId }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update({
      first_name: first_name || employee.first_name,
      last_name: last_name || employee.last_name,
      email: email || employee.email,
      phone: phone !== undefined ? phone : employee.phone
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_updated',
      meta: { employeeId: employee.id, updates: { first_name, last_name, email, phone } }
    });

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

// Delete employee
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      where: { id, organisation_id: req.user.orgId }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employeeData = { ...employee.toJSON() };
    await employee.destroy();

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_deleted',
      meta: { employeeId: id, ...employeeData }
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
