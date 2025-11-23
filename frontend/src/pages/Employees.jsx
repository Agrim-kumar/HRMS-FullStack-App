import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EmployeeForm from '../components/EmployeeForm';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // NEW: Search state
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.post('/employees', data);
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await api.put(`/employees/${editingEmployee.id}`, data);
      setEditingEmployee(null);
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
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

  // NEW: Filtering logic
  const filteredEmployees = employees.filter(employee => 
    employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>HRMS</h1>
        <div style={styles.navButtons}>
          <button onClick={() => navigate('/employees')} style={{...styles.navButton, ...styles.navButtonActive}}>
            Employees
          </button>
          <button onClick={() => navigate('/teams')} style={styles.navButton}>
            Teams
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        <div style={styles.header}>
          <h2>Employee Directory</h2>
          <div style={styles.headerActions}>
            {/* NEW: Search Input */}
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button onClick={() => setShowForm(true)} style={styles.addButton}>
              + Add Employee
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {/* Use filteredEmployees */}
          {filteredEmployees.map((employee) => (
            <div key={employee.id} style={styles.card}>
              <h3 style={styles.employeeName}>{employee.first_name} {employee.last_name}</h3>
              <p style={styles.cardText} title="Email">📧 **{employee.email}**</p>
              {employee.phone && <p style={styles.cardText} title="Phone">📞 {employee.phone}</p>}
              
              {employee.teams && employee.teams.length > 0 && (
                <div style={styles.teams}>
                  <strong>Teams:</strong>
                  <div style={styles.teamTags}>
                    {employee.teams.map((team) => (
                      <span key={team.id} style={styles.tag}>{team.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {!employee.teams || employee.teams.length === 0 && (
                <div style={styles.teams}>
                  <strong>Teams:</strong>
                  <span style={styles.tagEmpty}>Not assigned</span>
                </div>
              )}

              <div style={styles.cardActions}>
                <button 
                  onClick={() => handleEdit(employee)} 
                  style={{...styles.actionButton, ...styles.editButton}}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(employee.id)} 
                  style={{...styles.actionButton, ...styles.deleteButton}}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Updated empty message */}
        {filteredEmployees.length === 0 && (
          <div style={styles.empty}>
            <p>{searchTerm ? 'No employees match your search. Try a different name or email.' : 'No employees yet. Click "Add Employee" to get started.'}</p>
          </div>
        )}
      </div>

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={editingEmployee ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
        />
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
  // NEW: Styles for aligning search and add button
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  // NEW: Search input style
  searchInput: {
    padding: '10px 15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '15px',
    width: '300px', // Fixed width for search bar
    transition: 'border-color 0.3s'
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px'
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  employeeName: {
    marginBottom: '10px',
    color: '#333',
    fontSize: '20px',
    fontWeight: '600'
  },
  cardText: {
    margin: '6px 0',
    color: '#555',
    fontSize: '15px',
  },
  teams: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  teamTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px'
  },
  tag: {
    backgroundColor: '#e9f7fe',
    color: '#007bff',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500'
  },
  tagEmpty: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500'
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
  }
};

export default Employees;