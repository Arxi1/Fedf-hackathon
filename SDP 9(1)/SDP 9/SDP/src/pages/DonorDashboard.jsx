import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  History,
  Package,
  Clock,
  MapPin,
  CheckCircle,
  Truck,
  AlertTriangle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/donations';

const DonorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('donate');
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: '',
    expiryDate: '',
    pickupLocation: '',
    type: 'prepared',
    description: '',
    contactInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0,
    completed: 0
  });

  // Fetch data
  const fetchDonations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Filter for this donor
      const myItems = data.filter(d => d.donorId === user.uid);
      setMyDonations(myItems);

      // Calculate stats
      const newStats = {
        total: myItems.length,
        active: myItems.filter(d => d.status === 'available').length,
        claimed: myItems.filter(d => d.status === 'claimed').length,
        completed: myItems.filter(d => d.status === 'distributed').length
      };
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodItem || !formData.quantity) return;
    setLoading(true);

    const payload = {
      ...formData,
      donorId: user.uid,
      donorName: `Donor ${user.uid.slice(-3)}`,
      status: 'available',
      createdAt: new Date().toISOString()
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setFormData({
        foodItem: '',
        quantity: '',
        expiryDate: '',
        pickupLocation: '',
        type: 'prepared',
        description: '',
        contactInfo: ''
      });

      setActiveTab('history');
      fetchDonations();
    } catch (error) {
      console.error("Error adding donation: ", error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <Package className="text-success" size={16} />;
      case 'claimed': return <Truck className="text-warning" size={16} />;
      case 'distributed': return <CheckCircle className="text-info" size={16} />;
      default: return <AlertTriangle className="text-muted" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'claimed': return 'In Progress';
      case 'distributed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Food Donor Dashboard</h2>
            <div className="d-flex gap-2">
              <Link to="/donor/profile" className="btn btn-outline-primary">
                <i className="fas fa-user me-1"></i>Profile
              </Link>
              <Link to="/donor/settings" className="btn btn-outline-secondary">
                <i className="fas fa-cog me-1"></i>Settings
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Package size={24} />
                  </div>
                  <h4 className="mb-1">{stats.total}</h4>
                  <p className="text-muted mb-0">Total Donations</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="mb-1">{stats.active}</h4>
                  <p className="text-muted mb-0">Active Listings</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Truck size={24} />
                  </div>
                  <h4 className="mb-1">{stats.claimed}</h4>
                  <p className="text-muted mb-0">In Progress</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <History size={24} />
                  </div>
                  <h4 className="mb-1">{stats.completed}</h4>
                  <p className="text-muted mb-0">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded">
            <div className="container-fluid">
              <span className="navbar-brand mb-0 h1">Manage Donations</span>
              <div className="navbar-nav ms-auto">
                <button
                  onClick={() => setActiveTab('donate')}
                  className={`nav-link btn ${activeTab === 'donate' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                >
                  <PlusCircle size={16} className="me-1" />
                  New Donation
                </button>
                <button
                  onClick={() => { setActiveTab('history'); fetchDonations(); }}
                  className={`nav-link btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  <History size={16} className="me-1" />
                  My History
                </button>
              </div>
            </div>
          </nav>

          {activeTab === 'donate' ? (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <PlusCircle className="text-success me-2" size={20} />
                  List Surplus Food for Donation
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Food Item Name *</label>
                      <input
                        required
                        type="text"
                        className="form-control"
                        placeholder="e.g., 20 Fresh Baguettes, Vegetable Curry (5kg)"
                        value={formData.foodItem}
                        onChange={e => setFormData({ ...formData, foodItem: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Quantity/Weight *</label>
                      <input
                        required
                        type="text"
                        className="form-control"
                        placeholder="e.g., 5 kg, 20 pieces"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="prepared">Prepared Meals</option>
                        <option value="grocery">Packaged Goods</option>
                        <option value="produce">Fresh Produce</option>
                        <option value="bakery">Bakery Items</option>
                        <option value="dairy">Dairy Products</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expiry Date/Time *</label>
                      <input
                        required
                        type="datetime-local"
                        className="form-control"
                        value={formData.expiryDate}
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                      <small className="text-muted">When will this food expire?</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Pickup Location *</label>
                      <input
                        required
                        type="text"
                        className="form-control"
                        placeholder="Full address with landmarks"
                        value={formData.pickupLocation}
                        onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Additional details about the food (ingredients, storage requirements, etc.)"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Information</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Phone number or additional contact details"
                        value={formData.contactInfo}
                        onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      disabled={loading}
                      type="submit"
                      className="btn btn-primary"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Posting...
                        </>
                      ) : (
                        <>
                          <PlusCircle size={16} className="me-1" />
                          List Donation
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setFormData({
                        foodItem: '',
                        quantity: '',
                        expiryDate: '',
                        pickupLocation: '',
                        type: 'prepared',
                        description: '',
                        contactInfo: ''
                      })}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="row">
              {myDonations.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info text-center py-5">
                    <Package size={48} className="text-muted mb-3" />
                    <h5>No donations listed yet</h5>
                    <p>Start by adding your first food donation to help feed those in need.</p>
                    <button
                      onClick={() => setActiveTab('donate')}
                      className="btn btn-primary"
                    >
                      <PlusCircle size={16} className="me-1" />
                      Add Your First Donation
                    </button>
                  </div>
                </div>
              ) : (
                myDonations.map(donation => (
                  <div key={donation.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span className={`badge ${donation.type === 'prepared' ? 'bg-primary' : donation.type === 'grocery' ? 'bg-secondary' : 'bg-success'}`}>
                          {donation.type}
                        </span>
                        <div className="d-flex align-items-center">
                          {getStatusIcon(donation.status)}
                          <span className={`badge ms-1 ${donation.status === 'available' ? 'bg-success' : donation.status === 'claimed' ? 'bg-warning' : 'bg-info'}`}>
                            {getStatusText(donation.status)}
                          </span>
                        </div>
                      </div>

                      <div className="card-body">
                        <h5 className="card-title">{donation.foodItem}</h5>
                        <p className="card-text mb-2">
                          <strong>Qty:</strong> {donation.quantity}
                        </p>

                        {donation.description && (
                          <p className="card-text text-muted small mb-2">
                            {donation.description}
                          </p>
                        )}

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <Clock size={14} className="text-muted me-2" />
                            <small className="text-muted">
                              Expires: {new Date(donation.expiryDate).toLocaleDateString()} at {new Date(donation.expiryDate).toLocaleTimeString()}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <MapPin size={14} className="text-muted me-2" />
                            <small className="text-muted text-truncate">{donation.pickupLocation}</small>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="text-center">
                          {donation.status === 'available' && (
                            <span className="text-success">
                              <CheckCircle size={16} className="me-1" />
                              Available for pickup
                            </span>
                          )}
                          {donation.status === 'claimed' && (
                            <span className="text-warning">
                              <Truck size={16} className="me-1" />
                              Recipient is on the way
                            </span>
                          )}
                          {donation.status === 'distributed' && (
                            <span className="text-info">
                              <CheckCircle size={16} className="me-1" />
                              Successfully distributed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
