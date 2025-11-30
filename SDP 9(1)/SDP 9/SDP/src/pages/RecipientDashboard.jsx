import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle,
  Heart,
  Users,
  Building,
  Phone,
  Mail
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/donations';

const RecipientDashboard = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [myClaims, setMyClaims] = useState([]);
  const [stats, setStats] = useState({
    available: 0,
    claimed: 0,
    received: 0
  });

  const fetchDonations = async () => {
    try {
      const res = await fetch(API_URL);
      let data = await res.json();

      // Filter logic: Show available OR items I claimed
      data = data.filter(d =>
        d.status === 'available' || (d.status === 'claimed' && d.claimedBy === user.uid)
      );
      setDonations(data);

      // Calculate stats
      const newStats = {
        available: data.filter(d => d.status === 'available').length,
        claimed: data.filter(d => d.status === 'claimed' && d.claimedBy === user.uid).length,
        received: data.filter(d => d.status === 'distributed' && d.claimedBy === user.uid).length
      };
      setStats(newStats);

      // My claims
      const myClaimedItems = data.filter(d => d.claimedBy === user.uid);
      setMyClaims(myClaimedItems);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleClaim = async (id) => {
    if (confirm('Are you sure you want to claim this donation? You will be responsible for pickup and distribution.')) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'claimed', claimedBy: user.uid, claimedAt: new Date().toISOString() })
        });
        fetchDonations();
      } catch (e) {
        console.error(e);
        alert('Failed to claim donation. Please try again.');
      }
    }
  };

  const handleComplete = async (id) => {
    if (confirm('Confirm that this donation has been successfully distributed to those in need?')) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'distributed',
            distributedAt: new Date().toISOString()
          })
        });
        fetchDonations();
      } catch (e) {
        console.error(e);
        alert('Failed to mark as distributed. Please try again.');
      }
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesFilter = filter === 'all' || donation.type === filter;
    const matchesSearch = searchTerm === '' ||
      donation.foodItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Recipient Organization Dashboard</h2>
            <div className="d-flex gap-2">
              <Link to="/recipient/profile" className="btn btn-outline-primary">
                <Building size={16} className="me-1" />
                Organization Profile
              </Link>
              <Link to="/recipient/history" className="btn btn-outline-secondary">
                <CheckCircle size={16} className="me-1" />
                Distribution History
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Package size={24} />
                  </div>
                  <h4 className="mb-1">{stats.available}</h4>
                  <p className="text-muted mb-0">Available Donations</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Truck size={24} />
                  </div>
                  <h4 className="mb-1">{stats.claimed}</h4>
                  <p className="text-muted mb-0">My Claims</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Heart size={24} />
                  </div>
                  <h4 className="mb-1">{stats.received}</h4>
                  <p className="text-muted mb-0">Meals Distributed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8 mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search donations by food item, location, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Filter by Category</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {['all', 'prepared', 'grocery', 'produce', 'bakery', 'dairy'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Active Claims */}
          {myClaims.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-3">
                <Truck className="text-warning me-2" size={20} />
                My Active Claims
              </h5>
              <div className="row">
                {myClaims.map(donation => (
                  <div key={donation.id} className="col-md-6 col-lg-4 mb-3">
                    <div className="card border-warning h-100">
                      <div className="card-header bg-warning text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-light text-dark">{donation.type}</span>
                          <span className="badge bg-white text-warning">Claimed</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <h6 className="card-title">{donation.foodItem}</h6>
                        <p className="card-text mb-2">Qty: {donation.quantity}</p>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-1">
                            <MapPin size={14} className="text-muted me-2" />
                            <small className="text-muted">{donation.pickupLocation}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Clock size={14} className="text-muted me-2" />
                            <small className="text-muted">
                              Expires: {new Date(donation.expiryDate).toLocaleDateString()}
                            </small>
                          </div>
                        </div>

                        <div className="alert alert-warning py-2 mb-2">
                          <strong>Pickup Required!</strong> Please coordinate with donor for collection.
                        </div>

                        <button
                          onClick={() => handleComplete(donation.id)}
                          className="btn btn-success w-100"
                        >
                          <CheckCircle size={16} className="me-1" />
                          Mark as Distributed
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Donations */}
          <div className="mb-3">
            <h5 className="mb-3">
              <Package className="text-success me-2" size={20} />
              Available Food Donations ({filteredDonations.filter(d => d.status === 'available').length})
            </h5>
          </div>

          <div className="row">
            {filteredDonations.filter(d => d.status === 'available').length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info text-center py-5">
                  <Search size={48} className="text-muted mb-3" />
                  <h5>No donations available</h5>
                  <p>Check back later or try different search criteria.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilter('all'); }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              filteredDonations
                .filter(d => d.status === 'available')
                .map(donation => (
                  <div key={donation.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span className={`badge ${donation.type === 'prepared' ? 'bg-primary' : donation.type === 'grocery' ? 'bg-secondary' : 'bg-success'}`}>
                          {donation.type}
                        </span>
                        <span className="badge bg-success">Available</span>
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
                            <MapPin size={14} className="text-muted me-2" />
                            <small className="text-muted">{donation.pickupLocation}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <Clock size={14} className="text-muted me-2" />
                            <small className="text-muted">
                              Expires: {new Date(donation.expiryDate).toLocaleDateString()} at {new Date(donation.expiryDate).toLocaleTimeString()}
                            </small>
                          </div>
                          {donation.contactInfo && (
                            <div className="d-flex align-items-center">
                              <Phone size={14} className="text-muted me-2" />
                              <small className="text-muted">{donation.contactInfo}</small>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-footer">
                        <button
                          onClick={() => handleClaim(donation.id)}
                          className="btn btn-primary w-100"
                        >
                          <Heart size={16} className="me-1" />
                          Claim This Donation
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipientDashboard;
