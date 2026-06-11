import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

function PropertyOwnerForm({ user, onSubmitSuccess, onBack, apiUrl }) {
  const [formData, setFormData] = useState({
    ownerName: '',
    email: user.email || '',
    address: '',
    suburb: '',
    roomType: 'Private',
    weeklyRent: '',
    availabilityDate: '',
    amenities: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = "Invalid email format. Must contain '@'.";
    }
    if (!formData.address.trim()) newErrors.address = 'Property address is required.';
    if (!formData.suburb.trim()) newErrors.suburb = 'Suburb is required.';
    if (!formData.roomType) newErrors.roomType = 'Room type is required.';
    
    if (formData.weeklyRent === '' || formData.weeklyRent === undefined) {
      newErrors.weeklyRent = 'Weekly rent is required.';
    } else {
      const rentVal = parseFloat(formData.weeklyRent);
      if (isNaN(rentVal)) {
        newErrors.weeklyRent = 'Rent must be a numeric value.';
      } else if (rentVal <= 0) {
        newErrors.weeklyRent = 'Rent must be greater than zero.';
      }
    }

    if (!formData.availabilityDate) newErrors.availabilityDate = 'Availability date is required.';

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
      owner_name: formData.ownerName.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      suburb: formData.suburb.trim(),
      room_type: formData.roomType,
      weekly_rent: parseFloat(formData.weeklyRent),
      availability_date: formData.availabilityDate,
      amenities: formData.amenities.trim(),
      description: formData.description.trim(),
    };

    try {
      const response = await fetch(`${apiUrl}/api/property-listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.validation_errors) {
          const backendErrors = {};
          if (data.validation_errors.owner_name) backendErrors.ownerName = data.validation_errors.owner_name;
          if (data.validation_errors.email) backendErrors.email = data.validation_errors.email;
          if (data.validation_errors.address) backendErrors.address = data.validation_errors.address;
          if (data.validation_errors.suburb) backendErrors.suburb = data.validation_errors.suburb;
          if (data.validation_errors.room_type) backendErrors.roomType = data.validation_errors.room_type;
          if (data.validation_errors.weekly_rent) backendErrors.weeklyRent = data.validation_errors.weekly_rent;
          if (data.validation_errors.availability_date) backendErrors.availabilityDate = data.validation_errors.availability_date;
          setErrors(backendErrors);
        } else {
          setSubmitError(data.error || 'Server error occurred while submitting.');
        }
      } else {
        // Success
        onSubmitSuccess('owner', data);
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
        <h2>Property Listing Form</h2>
        <p className="card-subtitle">List your accommodation details for Melbourne students</p>
      </div>

      {submitError && <div className="alert alert-danger">{submitError}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="ownerName">Owner Name *</label>
          <input
            type="text"
            id="ownerName"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Owner's full name"
            className={errors.ownerName ? 'input-error' : ''}
          />
          {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Owner's contact email"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="address">Property Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. 12 Swanston Street"
            className={errors.address ? 'input-error' : ''}
          />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="suburb">Suburb *</label>
          <input
            type="text"
            id="suburb"
            name="suburb"
            value={formData.suburb}
            onChange={handleChange}
            placeholder="e.g. Carlton, Clayton, Melbourne CBD"
            className={errors.suburb ? 'input-error' : ''}
          />
          {errors.suburb && <span className="error-text">{errors.suburb}</span>}
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
            <label htmlFor="weeklyRent">Weekly Rent ($) *</label>
            <input
              type="number"
              id="weeklyRent"
              name="weeklyRent"
              value={formData.weeklyRent}
              onChange={handleChange}
              placeholder="e.g. 280"
              className={errors.weeklyRent ? 'input-error' : ''}
            />
            {errors.weeklyRent && <span className="error-text">{errors.weeklyRent}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="availabilityDate">Availability Date *</label>
          <input
            type="date"
            id="availabilityDate"
            name="availabilityDate"
            value={formData.availabilityDate}
            onChange={handleChange}
            className={errors.availabilityDate ? 'input-error' : ''}
          />
          {errors.availabilityDate && <span className="error-text">{errors.availabilityDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="amenities">Amenities</label>
          <input
            type="text"
            id="amenities"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            placeholder="e.g. Wi-Fi, Ensuite Bathroom, Fridge, Heating"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Property Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the room and the house vibe."
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting to database...' : 'Submit Listing'}
        </button>
      </form>

      <div className="privacy-notice text-center">
        <p>
          <strong>Privacy Notice:</strong> RoomEase displays listings to authenticated students looking for accommodation in Melbourne. Exact addresses are shared privately.
        </p>
      </div>
    </div>
  );
}

export default PropertyOwnerForm;
