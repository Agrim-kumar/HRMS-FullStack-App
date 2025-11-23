const Organisation = require('./organisation');
const User = require('./user');
const Employee = require('./employee');
const Team = require('./team');
const EmployeeTeam = require('./employeeTeam');
const Log = require('./log');

// Define associations
Organisation.hasMany(User, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
User.belongsTo(Organisation, { foreignKey: 'organisation_id' });

Organisation.hasMany(Employee, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
Employee.belongsTo(Organisation, { foreignKey: 'organisation_id' });

Organisation.hasMany(Team, { foreignKey: 'organisation_id', onDelete: 'CASCADE' });
Team.belongsTo(Organisation, { foreignKey: 'organisation_id' });

// Many-to-many: Employee <-> Team
Employee.belongsToMany(Team, { 
  through: EmployeeTeam, 
  foreignKey: 'employee_id',
  otherKey: 'team_id',
  as: 'teams'
});

Team.belongsToMany(Employee, { 
  through: EmployeeTeam, 
  foreignKey: 'team_id',
  otherKey: 'employee_id',
  as: 'employees'
});

module.exports = {
  Organisation,
  User,
  Employee,
  Team,
  EmployeeTeam,
  Log
};
