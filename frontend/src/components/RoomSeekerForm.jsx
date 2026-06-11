import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

function RoomSeekerForm({ user, onSubmitSuccess, onBack, apiUrl }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: user.email || '',
    suburb: '',
    minBudget: '',
    maxBudget: '',
    roomType: 'Private',
    moveInDate: '',
    smokingAllowed: false,
    petsAllowed: false,
    lifestyleNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = "Invalid email format. Must contain '@'.";
    }
    if (!formData.suburb.trim()) newErrors.suburb = 'Preferred suburb is required.';
    
    if (formData.minBudget === '' || formData.minBudget === undefined) {
      newErrors.minBudget = 'Minimum budget is required.';
    } else if (parseFloat(formData.minBudget) < 0) {
      newErrors.minBudget = 'Budget cannot be negative.';
    }

    if (formData.maxBudget === '' || formData.maxBudget === undefined) {
      newErrors.maxBudget = 'Maximum budget is required.';
    } else {
      const minVal = parseFloat(formData.minBudget);
      const maxVal = parseFloat(formData.maxBudget);
      if (maxVal < 0) {
        newErrors.maxBudget = 'Budget cannot be negative.';
      } else if (!isNaN(minVal) && maxVal < minVal) {
        newErrors.maxBudget = 'Max budget must be greater than or equal to min budget.';
      }
    }

    if (!formData.roomType) newErrors.roomType = 'Room type is required.';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      suburb: formData.suburb.trim(),
      min_budget: parseFloat(formData.minBudget),
      max_budget: parseFloat(formData.maxBudget),
      room_type: formData.roomType,
      move_in_date: formData.moveInDate,
      smoking_allowed: formData.smokingAllowed,
      pets_allowed: formData.petsAllowed,
      lifestyle_notes: formData.lifestyleNotes.trim(),
    };

    try {
      const response = await fetch(`${apiUrl}/api/room-seekers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validation_errors) {
          // Map backend validation errors back to frontend fields
          const backendErrors = {};
          if (data.validation_errors.full_name) backendErrors.fullName = data.validation_errors.full_name;
          if (data.validation_errors.email) backendErrors.email = data.validation_errors.email;
          if (data.validation_errors.suburb) backendErrors.suburb = data.validation_errors.suburb;
          if (data.validation_errors.min_budget) backendErrors.minBudget = data.validation_errors.min_budget;
          if (data.validation_errors.max_budget) backendErrors.maxBudget = data.validation_errors.max_budget;
          if (data.validation_errors.room_type) backendErrors.roomType = data.validation_errors.room_type;
          if (data.validation_errors.move_in_date) backendErrors.moveInDate = data.validation_errors.move_in_date;
          setErrors(backendErrors);
        } else {
          setSubmitError(data.error || 'Server error occurred while submitting.');
        }
      } else {
        // Success
        onSubmitSuccess('seeker', data);
      }
    } catch (err) {
      setSubmitError('Failed to connect to the server. Please check if the Flask backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="header-action-row">
          <button type="button" className="btn btn-link" onClick={onBack}>
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
        <h2>Room Seeker Preferences</h2>
        <p className="card-subtitle">Tell us what kind of student accommodation you are searching for</p>
      </div>

      {submitError && <div className="alert alert-danger">{submitError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your name"
            className={errors.fullName ? 'input-error' : ''}
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email address"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="suburb">Preferred Suburb in Melbourne *</label>
          <input
            type="text"
            id="suburb"
            name="suburb"
            value={formData.suburb}
            onChange={handleChange}
            placeholder="e.g. Carlton, Clayton, CBD, Brunswick"
            className={errors.suburb ? 'input-error' : ''}
          />
          {errors.suburb && <span className="error-text">{errors.suburb}</span>}
        </div>

        <div className="form-row">
          <div className="form-group col-6">
            <label htmlFor="minBudget">Min Weekly Budget ($) *</label>
            <input
              type="number"
              id="minBudget"
              name="minBudget"
              value={formData.minBudget}
              onChange={handleChange}
              placeholder="e.g. 150"
              className={errors.minBudget ? 'input-error' : ''}
            />
            {errors.minBudget && <span className="error-text">{errors.minBudget}</span>}
          </div>

          <div className="form-group col-6">
            <label htmlFor="maxBudget">Max Weekly Budget ($) *</label>
            <input
              type="number"
              id="maxBudget"
              name="maxBudget"
              value={formData.maxBudget}
              onChange={handleChange}
              placeholder="e.g. 300"
              className={errors.maxBudget ? 'input-error' : ''}
            />
            {errors.maxBudget && <span className="error-text">{errors.maxBudget}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group col-6">
            <label htmlFor="roomType">Room Type *</label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className={errors.roomType ? 'input-error' : ''}
            >
              <option value="Private">Private Room</option>
              <option value="Shared">Shared Room</option>
              <option value="Studio">Entire Studio</option>
            </select>
            {errors.roomType && <span className="error-text">{errors.roomType}</span>}
          </div>

          <div className="form-group col-6">
            <label htmlFor="moveInDate">Expected Move-in Date *</label>
            <input
              type="date"
              id="moveInDate"
              name="moveInDate"
              value={formData.moveInDate}
              onChange={handleChange}
              className={errors.moveInDate ? 'input-error' : ''}
            />
            {errors.moveInDate && <span className="error-text">{errors.moveInDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-section-label">Preferences & Rules</label>
          <div className="checkbox-row">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="smokingAllowed"
                checked={formData.smokingAllowed}
                onChange={handleChange}
              />
              <span className="checkbox-label">Smoking Allowed</span>
            </label>

            <label className="checkbox-container">
              <input
                type="checkbox"
                name="petsAllowed"
                checked={formData.petsAllowed}
                onChange={handleChange}
              />
              <span className="checkbox-label">Pets Allowed</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lifestyleNotes">Lifestyle Notes & Roommate Preferences</label>
          <textarea
            id="lifestyleNotes"
            name="lifestyleNotes"
            rows="3"
            value={formData.lifestyleNotes}
            onChange={handleChange}
            placeholder="Tell us about your habits (study schedule, cleanliness, hobbies, etc.)."
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting to database...' : 'Submit Preferences'}
        </button>
      </form>

      <div className="privacy-notice text-center">
        <p>
          <strong>Privacy Notice:</strong> RoomEase matches roommate profiles securely. Your budget and suburbs choices are visible to matching hosts only.
        </p>
      </div>
    </div>
  );
}

export default RoomSeekerForm;
