import React from 'react';
import { Search, Home } from 'lucide-react';

function RoleSelection({ user, onRoleSelect }) {
  return (
    <div className="card role-card">
      <div className="card-header">
        <h2>Welcome, {user.email || 'user'}!</h2>
        <p className="card-subtitle">Please select your role to get started</p>
      </div>

      <div className="role-options">
        <div className="role-option-card seeker-option" onClick={() => onRoleSelect('seeker')}>
          <div className="role-icon">
            <Search size={48} strokeWidth={1.5} />
          </div>
          <h3>Room Seeker</h3>
          <p>I am a student looking for accommodation or flatmates in Melbourne.</p>
          <button type="button" className="btn btn-secondary btn-block">Select Seeker</button>
        </div>

        <div className="role-option-card owner-option" onClick={() => onRoleSelect('owner')}>
          <div className="role-icon">
            <Home size={48} strokeWidth={1.5} />
          </div>
          <h3>Property Owner</h3>
          <p>I have a room or property to list for student accommodation.</p>
          <button type="button" className="btn btn-primary-alt btn-block">Select Owner</button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
