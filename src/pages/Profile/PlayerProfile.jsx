import React, { useEffect, useState, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { MapPin, Trophy, Calendar, Edit3, Save, X } from 'lucide-react';
import './PlayerProfile.css';

const PlayerProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: '',
    location: '',
  });

  // Fetch profile and bookings data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bookingsData = await apiFetch('/api/bookings/my/');
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);

        setProfileData({
          name: user?.first_name || user?.username || 'Player',
          email: user?.email || 'Not available',
          phone: user?.phone || '+1 (555) 000-0000',
          location: user?.location || 'Not set',
          bio: user?.bio || 'Sports enthusiast | Futsal lover',
          avatar: user?.avatar || '/default-avatar.png',
        });

        setFormData({
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          bio: user?.bio || '',
          phone: user?.phone || '',
          location: user?.location || '',
        });
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    updateUser(formData);
    setProfileData(prev => ({
      ...prev,
      name: `${formData.first_name} ${formData.last_name}`,
      ...formData,
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
    setIsEditing(false);
  };

  // Calculate stats
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(b => b.status === 'BOOKED').length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* HEADER SECTION */}
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profileData?.avatar || '/default-avatar.png'} alt="Profile" />
        </div>
        <div className="profile-info">
          <h1>{profileData?.name || 'Player'}</h1>
          <p className="profile-email">{profileData?.email}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{totalBookings}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat">
              <span className="stat-number">{upcomingBookings}</span>
              <span className="stat-label">Upcoming</span>
            </div>
            <div className="stat">
              <span className="stat-number">{completedBookings}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={handleCancelEdit}>
                <X size={16} />
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveProfile}>
                <Save size={16} />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="profile-content">
        {/* PERSONAL INFO */}
        <div className="profile-section">
          <h2>Personal Information</h2>

          {!isEditing ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Phone</label>
                <p>{profileData?.phone}</p>
              </div>
              <div className="info-item">
                <label>Location</label>
                <div className="location-display">
                  <MapPin size={16} />
                  {profileData?.location}
                </div>
              </div>
              <div className="info-item full">
                <label>Bio</label>
                <p>{profileData?.bio}</p>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        {/* RECENT BOOKINGS */}
        <div className="profile-section">
          <h2>Recent Bookings</h2>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} />
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.slice(0, 3).map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <h4>{booking.ground_name}</h4>
                    <p>{booking.date} • {booking.start_time} - {booking.end_time}</p>
                  </div>
                  <div className={`booking-status status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(PlayerProfile);