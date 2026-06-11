import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

function SavedData({ apiUrl, onBackToRoleSelect }) {
  const [activeTab, setActiveTab] = useState('seekers');
  const [seekers, setSeekers] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'seekers') {
        const res = await fetch(`${apiUrl}/api/room-seekers`);
        if (!res.ok) throw new Error('Failed to fetch room seekers');
        const data = await res.json();
        setSeekers(data);
      } else {
        const res = await fetch(`${apiUrl}/api/property-listings`);
        if (!res.ok) throw new Error('Failed to fetch property listings');
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      setError(err.message || 'Could not connect to the backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="card dashboard-card">
      <div className="card-header">
        <div className="header-action-row">
          <button type="button" className="btn btn-link" onClick={onBackToRoleSelect}>
            <ArrowLeft size={18} />
            Go to Role Form
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'rotating' : ''} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <h2>RoomEase Database Board</h2>
        <p className="card-subtitle">Showing real-time records saved in Supabase</p>
      </div>

      <div className="tabs-header">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'seekers' ? 'active' : ''}`}
          onClick={() => setActiveTab('seekers')}
        >
          Room Seekers ({seekers.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Property Listings ({listings.length})
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-content">
        {isLoading && <div className="loading-spinner">Loading records from database...</div>}

        {!isLoading && activeTab === 'seekers' && (
          <div className="records-grid">
            {seekers.length === 0 ? (
              <p className="no-records">No room seeker profiles found in the database.</p>
            ) : (
              seekers.map((seeker) => (
                <div key={seeker.id || seeker.created_at} className="record-card seeker-record">
                  <div className="record-card-header">
                    <h4>{seeker.full_name}</h4>
                    <span className="badge badge-amber">{seeker.room_type}</span>
                  </div>
                  <div className="record-details">
                    <p><strong>Preferred Suburb:</strong> {seeker.suburb}</p>
                    <p><strong>Weekly Budget:</strong> ${seeker.min_budget} - ${seeker.max_budget}</p>
                    <p><strong>Move-in Date:</strong> {seeker.move_in_date}</p>
                    <div className="badge-row">
                      <span className={`pill-badge ${seeker.smoking_allowed ? 'pill-allowed' : 'pill-disallowed'}`}>
                        Smoking: {seeker.smoking_allowed ? 'Yes' : 'No'}
                      </span>
                      <span className={`pill-badge ${seeker.pets_allowed ? 'pill-allowed' : 'pill-disallowed'}`}>
                        Pets: {seeker.pets_allowed ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {seeker.lifestyle_notes && (
                      <div className="record-notes">
                        <strong>Lifestyle Notes:</strong>
                        <p>{seeker.lifestyle_notes}</p>
                      </div>
                    )}
                    <span className="timestamp">
                      Submitted: {new Date(seeker.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!isLoading && activeTab === 'listings' && (
          <div className="records-grid">
            {listings.length === 0 ? (
              <p className="no-records">No property listings found in the database.</p>
            ) : (
              listings.map((listing) => (
                <div key={listing.id || listing.created_at} className="record-card listing-record">
                  <div className="record-card-header">
                    <h4>{listing.suburb}</h4>
                    <span className="badge badge-teal">{listing.room_type}</span>
                  </div>
                  <div className="record-details">
                    <p><strong>Rent:</strong> ${listing.weekly_rent} / week</p>
                    <p><strong>Address:</strong> {listing.address}</p>
                    <p><strong>Owner:</strong> {listing.owner_name} ({listing.email})</p>
                    <p><strong>Available Date:</strong> {listing.availability_date}</p>
                    {listing.amenities && (
                      <p><strong>Amenities:</strong> {listing.amenities}</p>
                    )}
                    {listing.description && (
                      <div className="record-notes">
                        <strong>Description:</strong>
                        <p>{listing.description}</p>
                      </div>
                    )}
                    <span className="timestamp">
                      Submitted: {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedData;
