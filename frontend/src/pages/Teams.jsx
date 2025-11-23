import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import TeamForm from '../components/TeamForm';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [assigningTeam, setAssigningTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalSearchTerm, setModalSearchTerm] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.post('/teams', data);
      setShowForm(false);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await api.put(`/teams/${editingTeam.id}`, data);
      setEditingTeam(null);
      setShowForm(false);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update team');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleAssign = async (teamId, employeeId) => {
    try {
      await api.post(`/teams/${teamId}/assign`, { employeeId });
      handleCloseModal(); // Use the new close function
      fetchTeams();
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign employee');
    }
  };

  const handleUnassign = async (teamId, employeeId) => {
    if (!window.confirm('Remove this employee from the team?')) return;
    
    try {
      await api.post(`/teams/${teamId}/unassign`, { employeeId });
      fetchTeams();
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unassign employee');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // NEW: Function to close modal and clear search
  const handleCloseModal = () => {
    setAssigningTeam(null);
    setModalSearchTerm('');
  };

  const getUnassignedEmployees = (team, filterTerm = '') => {
    const assignedIds = team.employees?.map(e => e.id) || [];
    const unassigned = employees.filter(emp => !assignedIds.includes(emp.id));
    
    if (!filterTerm) return unassigned;

    const lowerCaseFilter = filterTerm.toLowerCase();
    return unassigned.filter(employee => 
      employee.first_name.toLowerCase().includes(lowerCaseFilter) ||
      employee.last_name.toLowerCase().includes(lowerCaseFilter) ||
      employee.email.toLowerCase().includes(lowerCaseFilter)
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  const availableEmployees = assigningTeam ? getUnassignedEmployees(assigningTeam, modalSearchTerm) : [];

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>HRMS</h1>
        <div style={styles.navButtons}>
          <button onClick={() => navigate('/employees')} style={styles.navButton}>
            Employees
          </button>
          <button onClick={() => navigate('/teams')} style={{...styles.navButton, ...styles.navButtonActive}}>
            Teams
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <h2>Team Management</h2>
          <button onClick={() => setShowForm(true)} style={styles.addButton}>
            + Add Team
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {teams.map((team) => (
            <div key={team.id} style={styles.card}>
              <h3 style={styles.teamName}>{team.name}</h3>
              {team.description && <p style={styles.cardText}>{team.description}</p>}
              
              <div style={styles.members}>
                <strong>Members ({team.employees?.length || 0}):</strong>
                {team.employees && team.employees.length > 0 ? (
                  <div style={styles.memberList}>
                    {team.employees.map((employee) => (
                      <div key={employee.id} style={styles.member}>
                        <span>{employee.first_name} {employee.last_name}</span>
                        <button
                          onClick={() => handleUnassign(team.id, employee.id)}
                          style={styles.removeButton}
                          title="Remove from team"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.emptyText}>No members yet</p>
                )}
              </div>

              <div style={styles.cardActions}>
                <button 
                  onClick={() => handleEdit(team)} 
                  style={{...styles.actionButton, ...styles.editButton}}
                >
                  Edit
                </button>
                <button 
                  onClick={() => { setAssigningTeam(team); setModalSearchTerm(''); }}
                  style={{...styles.actionButton, ...styles.assignButton}}
                >
                  Assign
                </button>
                <button 
                  onClick={() => handleDelete(team.id)} 
                  style={{...styles.actionButton, ...styles.deleteButton}}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div style={styles.empty}>
            <p>No teams yet. Click "Add Team" to get started.</p>
          </div>
        )}
      </div>

      {showForm && (
        <TeamForm
          team={editingTeam}
          onSubmit={editingTeam ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingTeam(null);
          }}
        />
      )}

      {assigningTeam && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            
            {/* NEW: Modal Header container for title and close button */}
            <div style={styles.modalHeader}> 
              <h2 style={styles.modalTitle}>{assigningTeam.name}</h2>
              <button 
                onClick={handleCloseModal} 
                style={styles.closeButton}
                title="Close"
              >
                ×
              </button>
            </div>
            
            <p style={styles.modalSubTitle}>Select an employee to assign to this team:</p> {/* Added for clarity */}

            <input
              type="text"
              placeholder="Search employee to assign..."
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
              style={styles.modalSearchInput}
            />

            <div style={styles.employeeList}>
              {availableEmployees.length > 0 ? (
                availableEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    style={styles.employeeItem}
                    onClick={() => handleAssign(assigningTeam.id, employee.id)}
                  >
                    <span style={styles.employeeNameItem}>{employee.first_name} {employee.last_name}</span>
                    <span style={styles.employeeEmail}>{employee.email}</span>
                  </div>
                ))
              ) : (
                <p style={styles.emptyText}>
                  {employees.length === assigningTeam.employees.length 
                    ? 'All employees are already assigned to a team.' 
                    : modalSearchTerm 
                    ? 'No employees match your search.'
                    : 'All available employees are already assigned to this team.'
                  }
                </p>
              )}
            </div>
            
            {/* Removed the old cancel button */}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5'
  },
  nav: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  navTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700'
  },
  navButtons: {
    display: 'flex',
    gap: '10px'
  },
  navButton: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'background-color 0.3s'
  },
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'white',
  },
  logoutButton: {
    padding: '10px 18px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'background-color 0.3s'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '15px'
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background-color 0.3s'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '5px solid #c62828'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px'
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  teamName: {
    marginBottom: '10px',
    color: '#333',
    fontSize: '20px',
    fontWeight: '600'
  },
  cardText: {
    margin: '6px 0',
    color: '#555',
    fontSize: '15px'
  },
  members: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  memberList: {
    marginTop: '10px'
  },
  member: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize: '15px'
  },
  removeButton: {
    backgroundColor: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  emptyText: {
    color: '#999',
    fontSize: '14px',
    marginTop: '10px'
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  actionButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s'
  },
  editButton: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  assignButton: {
    backgroundColor: '#ffc107',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
    fontSize: '18px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '20px',
    color: '#6c757d'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px', // Slightly less padding for a smaller feel
    borderRadius: '10px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  // NEW: Container for title and close button
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '15px',
    marginBottom: '15px',
  },
  // UPDATED: Modal Title for team name
  modalTitle: {
    margin: 0,
    fontSize: '24px', // Standard size, not too large
    color: '#333',
    fontWeight: '600',
  },
  // NEW: Close button style
  closeButton: {
    backgroundColor: 'transparent',
    color: '#6c757d',
    border: 'none',
    fontSize: '30px',
    fontWeight: 'lighter',
    cursor: 'pointer',
    padding: '0 5px',
    lineHeight: '1',
    transition: 'color 0.2s',
  },
  modalSubTitle: {
    fontSize: '15px',
    color: '#555',
    marginBottom: '15px'
  },
  modalSearchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  employeeList: {
    marginTop: '0px', // Adjusted since search input is now above
    marginBottom: '10px'
  },
  employeeItem: {
    padding: '15px',
    backgroundColor: '#e9f7fe',
    borderRadius: '8px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.1s',
  },
  employeeNameItem: {
    fontWeight: '600',
    color: '#007bff',
    display: 'block'
  },
  employeeEmail: {
    display: 'block',
    fontSize: '13px',
    color: '#6c757d',
    marginTop: '4px'
  },
};

export default Teams;