import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Download,
  RefreshCw,
  Settings,
  UserPlus,
  BarChart3
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/donations';

const AdminDashboard = () => {
  const [allDonations, setAllDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0,
    distributed: 0,
    flagged: 0
  });

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setAllDonations(data);
      setFilteredDonations(data);

      // Calculate stats
      const newStats = {
        total: data.length,
        active: data.filter(d => d.status === 'available').length,
        claimed: data.filter(d => d.status === 'claimed').length,
        distributed: data.filter(d => d.status === 'distributed').length,
        flagged: data.filter(d => d.flagged || new Date(d.expiryDate) < new Date()).length
      };
      setStats(newStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    let filtered = allDonations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(donation =>
        donation.foodItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(donation => donation.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(donation => donation.type === typeFilter);
    }

    setFilteredDonations(filtered);
  }, [allDonations, searchTerm, statusFilter, typeFilter]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to permanently remove this listing? This action cannot be undone.')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchDonations();
      } catch (e) {
        console.error(e);
        alert('Failed to delete donation. Please try again.');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'claimed') {
        updateData.claimedBy = 'admin_override';
        updateData.claimedAt = new Date().toISOString();
      } else if (newStatus === 'distributed') {
        updateData.distributedAt = new Date().toISOString();
      }

      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      fetchDonations();
    } catch (e) {
      console.error(e);
      alert('Failed to update status. Please try again.');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'Food Item', 'Type', 'Quantity', 'Donor', 'Status', 'Created', 'Expiry', 'Location'],
      ...filteredDonations.map(d => [
        d.id,
        d.foodItem,
        d.type,
        d.quantity,
        d.donorName,
        d.status,
        d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '',
        new Date(d.expiryDate).toLocaleDateString(),
        d.pickupLocation
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-donations-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'bg-success',
      claimed: 'bg-warning',
      distributed: 'bg-info'
    };
    return badges[status] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    const badges = {
      prepared: 'bg-primary',
      grocery: 'bg-secondary',
      produce: 'bg-success',
      bakery: 'bg-warning',
      dairy: 'bg-info'
    };
    return badges[type] || 'bg-dark';
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center py-5">
          <RefreshCw className="spinner-border text-primary" size={48} />
          <p className="mt-3">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <Shield className="text-danger me-2" size={24} />
              Platform Administration
            </h2>
            <div className="d-flex gap-2">
              <button onClick={fetchDonations} className="btn btn-outline-primary">
                <RefreshCw size={16} className="me-1" />
                Refresh
              </button>
              <button onClick={exportData} className="btn btn-outline-success">
                <Download size={16} className="me-1" />
                Export Data
              </button>
              <Link to="/admin/settings" className="btn btn-outline-secondary">
                <Settings size={16} className="me-1" />
                Settings
              </Link>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="row mb-4">
            <div className="col-md-2 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    <Package size={20} />
                  </div>
                  <h5 className="mb-1">{stats.total}</h5>
                  <p className="text-muted mb-0 small">Total</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    <CheckCircle size={20} />
                  </div>
                  <h5 className="mb-1">{stats.active}</h5>
                  <p className="text-muted mb-0 small">Active</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    <RefreshCw size={20} />
                  </div>
                  <h5 className="mb-1">{stats.claimed}</h5>
                  <p className="text-muted mb-0 small">In Progress</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    <Users size={20} />
                  </div>
                  <h5 className="mb-1">{stats.distributed}</h5>
                  <p className="text-muted mb-0 small">Completed</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    <AlertTriangle size={20} />
                  </div>
                  <h5 className="mb-1">{stats.flagged}</h5>
                  <p className="text-muted mb-0 small">Flagged</p>
                </div>
              </div>
            </div>
            <div className="col-md-2 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '40px', height: '40px'}}>
                    <BarChart3 size={20} />
                  </div>
                  <h5 className="mb-1">{Math.round((stats.distributed / stats.total) * 100) || 0}%</h5>
                  <p className="text-muted mb-0 small">Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search donations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="claimed">Claimed</option>
                    <option value="distributed">Distributed</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="prepared">Prepared Meals</option>
                    <option value="grocery">Packaged Goods</option>
                    <option value="produce">Fresh Produce</option>
                    <option value="bakery">Bakery Items</option>
                    <option value="dairy">Dairy Products</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Donations Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                All Platform Donations ({filteredDonations.length})
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Food Item</th>
                      <th>Type</th>
                      <th>Donor</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Expires</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map(donation => {
                      const isExpired = new Date(donation.expiryDate) < new Date();
                      return (
                        <tr key={donation.id} className={isExpired ? 'table-danger' : ''}>
                          <td>
                            <div>
                              <strong>{donation.foodItem}</strong>
                              <br />
                              <small className="text-muted">Qty: {donation.quantity}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getTypeBadge(donation.type)}`}>
                              {donation.type}
                            </span>
                          </td>
                          <td>{donation.donorName}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className={`badge ${getStatusBadge(donation.status)} me-2`}>
                                {donation.status}
                              </span>
                              {isExpired && (
                                <AlertTriangle size={14} className="text-danger" title="Expired" />
                              )}
                            </div>
                          </td>
                          <td>
                            {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <span className={isExpired ? 'text-danger fw-bold' : ''}>
                              {new Date(donation.expiryDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/admin/donation/${donation.id}`}
                                className="btn btn-outline-info"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </Link>
                              <button
                                onClick={() => handleStatusChange(donation.id, donation.status === 'available' ? 'claimed' : 'available')}
                                className="btn btn-outline-warning"
                                title="Toggle Status"
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(donation.id)}
                                className="btn btn-outline-danger"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredDonations.length === 0 && (
                <div className="text-center py-5">
                  <Package size={48} className="text-muted mb-3" />
                  <h5>No donations found</h5>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
