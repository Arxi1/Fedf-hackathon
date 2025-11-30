import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Truck,
  CheckCircle,
  Calendar,
  MapPin,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/donations';

const AnalystDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0,
    distributed: 0,
    byType: { prepared: 0, grocery: 0, produce: 0, bakery: 0, dairy: 0 },
    byStatus: { available: 0, claimed: 0, distributed: 0 },
    recentActivity: [],
    topDonors: [],
    topRecipients: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();

      // Calculate comprehensive stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      const filteredData = timeRange === '30d' ? data.filter(d => new Date(d.createdAt) >= thirtyDaysAgo) : data;

      const newStats = {
        total: filteredData.length,
        active: filteredData.filter(d => d.status === 'available').length,
        claimed: filteredData.filter(d => d.status === 'claimed').length,
        distributed: filteredData.filter(d => d.status === 'distributed').length,
        byType: {
          prepared: filteredData.filter(d => d.type === 'prepared').length,
          grocery: filteredData.filter(d => d.type === 'grocery').length,
          produce: filteredData.filter(d => d.type === 'produce').length,
          bakery: filteredData.filter(d => d.type === 'bakery').length,
          dairy: filteredData.filter(d => d.type === 'dairy').length,
        },
        byStatus: {
          available: filteredData.filter(d => d.status === 'available').length,
          claimed: filteredData.filter(d => d.status === 'claimed').length,
          distributed: filteredData.filter(d => d.status === 'distributed').length,
        },
        recentActivity: filteredData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10),
        topDonors: getTopContributors(filteredData, 'donor'),
        topRecipients: getTopContributors(filteredData, 'recipient'),
        monthlyTrends: calculateMonthlyTrends(filteredData)
      };

      setStats(newStats);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTopContributors = (data, type) => {
    const contributors = {};
    data.forEach(item => {
      const key = type === 'donor' ? item.donorId : item.claimedBy;
      const name = type === 'donor' ? item.donorName : `Recipient ${key?.slice(-3) || 'Unknown'}`;
      if (key) {
        contributors[key] = contributors[key] || { name, count: 0 };
        contributors[key].count++;
      }
    });

    return Object.values(contributors)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const calculateMonthlyTrends = (data) => {
    const monthlyData = {};
    data.forEach(item => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = monthlyData[monthKey] || { month: monthKey, donations: 0, distributed: 0 };
      monthlyData[monthKey].donations++;
      if (item.status === 'distributed') {
        monthlyData[monthKey].distributed++;
      }
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const exportData = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Donations', stats.total],
      ['Active Listings', stats.active],
      ['In Progress', stats.claimed],
      ['Completed', stats.distributed],
      [''],
      ['Food Types', ''],
      ['Prepared Meals', stats.byType.prepared],
      ['Packaged Goods', stats.byType.grocery],
      ['Fresh Produce', stats.byType.produce],
      ['Bakery Items', stats.byType.bakery],
      ['Dairy Products', stats.byType.dairy]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodconnect-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center py-5">
          <RefreshCw className="spinner-border text-primary" size={48} />
          <p className="mt-3">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">FoodConnect Analytics Dashboard</h2>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
              <button onClick={exportData} className="btn btn-outline-primary">
                <Download size={16} className="me-1" />
                Export Data
              </button>
              <Link to="/analyst/reports" className="btn btn-outline-secondary">
                <BarChart3 size={16} className="me-1" />
                Detailed Reports
              </Link>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Package size={24} />
                  </div>
                  <h4 className="mb-1">{stats.total}</h4>
                  <p className="text-muted mb-0">Total Donations</p>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    Platform Activity
                  </small>
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
                  <small className="text-info">
                    Available for pickup
                  </small>
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
                  <small className="text-warning">
                    Being picked up
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{width: '50px', height: '50px'}}>
                    <Users size={24} />
                  </div>
                  <h4 className="mb-1">{stats.distributed}</h4>
                  <p className="text-muted mb-0">Meals Saved</p>
                  <small className="text-success">
                    Successfully distributed
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Food Type Distribution */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <PieChart className="text-primary me-2" size={20} />
                    Food Type Distribution
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-capitalize">{type}</span>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1 mx-3" style={{ height: '8px', width: '100px' }}>
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="badge bg-primary">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <Users className="text-success me-2" size={20} />
                    Top Contributors
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <h6 className="text-muted mb-3">Top Donors</h6>
                      {stats.topDonors.slice(0, 3).map((donor, index) => (
                        <div key={index} className="d-flex justify-content-between mb-2">
                          <span className="text-truncate" style={{ maxWidth: '120px' }}>{donor.name}</span>
                          <span className="badge bg-success">{donor.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="col-6">
                      <h6 className="text-muted mb-3">Top Recipients</h6>
                      {stats.topRecipients.slice(0, 3).map((recipient, index) => (
                        <div key={index} className="d-flex justify-content-between mb-2">
                          <span className="text-truncate" style={{ maxWidth: '120px' }}>{recipient.name}</span>
                          <span className="badge bg-info">{recipient.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <Calendar className="text-info me-2" size={20} />
                Recent Activity
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
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.map(donation => (
                      <tr key={donation.id}>
                        <td className="fw-bold">{donation.foodItem}</td>
                        <td>
                          <span className={`badge ${donation.type === 'prepared' ? 'bg-primary' : donation.type === 'grocery' ? 'bg-secondary' : 'bg-success'}`}>
                            {donation.type}
                          </span>
                        </td>
                        <td>{donation.donorName}</td>
                        <td>
                          <span className={`badge ${donation.status === 'available' ? 'bg-success' : donation.status === 'claimed' ? 'bg-warning' : 'bg-info'}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td>{donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'Just now'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          {stats.monthlyTrends.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <TrendingUp className="text-warning me-2" size={20} />
                  Monthly Trends
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {stats.monthlyTrends.map((month, index) => (
                    <div key={month.month} className="col-md-2 mb-3">
                      <div className="card text-center">
                        <div className="card-body">
                          <h6 className="text-muted">{month.month}</h6>
                          <div className="mb-2">
                            <span className="badge bg-primary me-1">{month.donations}</span>
                            <small className="text-muted">donated</small>
                          </div>
                          <div>
                            <span className="badge bg-success">{month.distributed}</span>
                            <small className="text-muted">distributed</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;
