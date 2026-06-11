import { useState } from 'react';
import { BarChart3, LogOut } from 'lucide-react';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import RoomSeekerForm from './components/RoomSeekerForm';
import PropertyOwnerForm from './components/PropertyOwnerForm';
import SuccessScreen from './components/SuccessScreen';
import SavedData from './components/SavedData';
import './App.css';

// Get API base URL from Vite env variables, default to port 5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [lastSubmission, setLastSubmission] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen('role');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setScreen(role === 'seeker' ? 'seekerForm' : 'ownerForm');
  };

  const handleSubmitSuccess = (role, submittedData) => {
    setLastSubmission(submittedData);
    setScreen('success');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    setLastSubmission(null);
    setScreen('login');
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-brand" onClick={() => setScreen(user ? 'role' : 'login')}>
          <span className="brand-logo">RoomEase</span>
          <span className="brand-badge">Melbourne</span>
        </div>
        
        {user && (
          <nav className="header-nav">
            <span className="user-welcome">Hello, <strong>{user.email}</strong></span>
            
            <button 
              type="button" 
              className={`nav-link ${screen === 'savedData' ? 'active' : ''}`}
              onClick={() => setScreen('savedData')}
              title="View Database Board"
            >
              <BarChart3 size={20} className="nav-icon" />
              Database Board
            </button>

            <button 
              type="button" 
              className="btn-logout" 
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={20} className="nav-icon" />
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {screen === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}

        {screen === 'role' && (
          <RoleSelection user={user} onRoleSelect={handleRoleSelect} />
        )}

        {screen === 'seekerForm' && (
          <RoomSeekerForm
            user={user}
            apiUrl={API_URL}
            onSubmitSuccess={handleSubmitSuccess}
            onBack={() => setScreen('role')}
          />
        )}

        {screen === 'ownerForm' && (
          <PropertyOwnerForm
            user={user}
            apiUrl={API_URL}
            onSubmitSuccess={handleSubmitSuccess}
            onBack={() => setScreen('role')}
          />
        )}

        {screen === 'success' && (
          <SuccessScreen
            role={selectedRole}
            data={lastSubmission}
            onViewDashboard={() => setScreen('savedData')}
            onReset={() => setScreen('role')}
          />
        )}

        {screen === 'savedData' && (
          <SavedData
            apiUrl={API_URL}
            onBackToRoleSelect={() => setScreen(selectedRole ? (selectedRole === 'seeker' ? 'seekerForm' : 'ownerForm') : 'role')}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} RoomEase - Melbourne Student Housing Services</p>
        <p className="footer-subtext">BUS4012 Assignment 03 - Real-time Full-Stack Demo</p>
      </footer>
    </div>
  );
}

export default App;
