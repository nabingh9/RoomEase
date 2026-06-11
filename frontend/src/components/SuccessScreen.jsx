import React from 'react';
import { CheckCircle } from 'lucide-react';

function SuccessScreen({ role, data, onViewDashboard, onReset }) {
  return (
    <div className="card success-card">
      <div className="success-icon-wrapper">
        <CheckCircle size={64} className="success-icon" strokeWidth={1.5} />
      </div>
      
      <h2>Submission Successful!</h2>
      <p className="success-message">
        Your accommodation details have been securely saved to the database.
      </p>

      <div className="summary-box">
        <h3>Saved Details</h3>
        
        {role === 'seeker' ? (
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Name:</span>
              <span className="summary-value">{data.full_name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Preferred Suburb:</span>
              <span className="summary-value">{data.suburb}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Budget Range:</span>
              <span className="summary-value">${data.min_budget} - ${data.max_budget} / week</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Room Type:</span>
              <span className="summary-value">{data.room_type}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Move-in Date:</span>
              <span className="summary-value">{data.move_in_date}</span>
            </div>
          </div>
        ) : (
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Owner Name:</span>
              <span className="summary-value">{data.owner_name}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Suburb:</span>
              <span className="summary-value">{data.suburb}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Room Type:</span>
              <span className="summary-value">{data.room_type}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Weekly Rent:</span>
              <span className="summary-value">${data.weekly_rent} / week</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Availability Date:</span>
              <span className="summary-value">{data.availability_date}</span>
            </div>
          </div>
        )}
      </div>

      <div className="success-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={onViewDashboard}>
          View Saved Records (Database Board)
        </button>
        <button type="button" className="btn btn-outline btn-block" onClick={onReset}>
          Create Another Submission
        </button>
      </div>

      <div className="privacy-notice text-center">
        <p>Your details are stored securely. You can modify or delete your information at any time by contacting student housing support.</p>
      </div>
    </div>
  );
}

export default SuccessScreen;
