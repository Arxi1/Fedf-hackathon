import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Utensils, 
  Truck, 
  BarChart3, 
  Users, 
  LogOut, 
  Leaf, 
  Clock, 
  MapPin,
  Search,
  Trash2,
  Lock,
  Mail
} from 'lucide-react';

// --- API Helper ---
const API_URL = 'http://localhost:5000/api/donations';

// --- Components ---

// 1. Role Selection / Login
const LoginScreen = ({ onSelectRole, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('donor');

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple validation (Simulated authentication)
    if (email && password) {
      // Using static IDs so your History persists across refreshes!
      const staticIds = {
        donor: 'donor_user_123',
        recipient: 'recipient_user_456',
        analyst: 'analyst_user_789',
        admin: 'admin_user_000'
      };

      onLogin({ uid: staticIds[selectedRole], email: email });
      onSelectRole(selectedRole);
    } else {
      alert("Please enter both email and password.");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-content" style={{ maxWidth: '480px' }}>
        <div className="login-header" style={{ marginBottom: '30px' }}>
          <div className="logo-circle">
            <Leaf className="icon-large text-white" />
          </div>
          <h1 className="app-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome Back</h1>
          <p className="app-subtitle">Log in to your FoodConnect dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="donation-form" style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail className="icon-small text-gray" /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '12px' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock className="icon-small text-gray" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '12px' }}
            />
          </div>

          <div className="form-group">
            <label>I am logging in as...</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ padding: '12px', backgroundColor: '#f9fafb' }}
            >
              <option value="donor">Food Donor (Restaurant/Store)</option>
              <option value="recipient">Recipient Organization (NGO)</option>
              <option value="analyst">Data Analyst</option>
              <option value="admin">Platform Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-primary full-width" 
            style={{ marginTop: '10px', padding: '14px', fontSize: '1.1rem' }}
          >
            Log In
          </button>
        </form>

        <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          Don't have an account? <span style={{ color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

// 2. Donor Dashboard
const DonorDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('donate');
  const [formData, setFormData] = useState({
    foodItem: '',
    quantity: '',
    expiryDate: '',
    pickupLocation: '',
    type: 'prepared'
  });
  const [loading, setLoading] = useState(false);
  const [myDonations, setMyDonations] = useState([]);

  // Fetch data
  const fetchDonations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // Filter for this donor locally
      // This includes ALL statuses (Available, Claimed, Distributed) -> This is your History
      const myItems = data.filter(d => d.donorId === user.uid);
      setMyDonations(myItems);
    } catch (err) {
      console.error("Error fetching donations:", err);
    }
  };

  // Fetch immediately on load
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
      donorName: `Donor ${user.uid.slice(-3)}`, // Just for display
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setFormData({ foodItem: '', quantity: '', expiryDate: '', pickupLocation: '', type: 'prepared' });
      
      // Switch to history tab and refresh list
      setActiveTab('history');
      fetchDonations(); 
    } catch (error) {
      console.error("Error adding document: ", error);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-row">
        <h2 className="dashboard-title">Donor Dashboard</h2>
        <div className="tab-group">
          <button
            onClick={() => setActiveTab('donate')}
            className={`tab-btn ${activeTab === 'donate' ? 'active' : ''}`}
          >
            New Donation
          </button>
          <button
            onClick={() => { setActiveTab('history'); fetchDonations(); }}
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            My Donations (History)
          </button>
        </div>
      </div>

      {activeTab === 'donate' ? (
        <div className="form-card">
          <h3 className="form-title">
            <PlusCircle className="icon-medium text-emerald" />
            List Surplus Food
          </h3>
          <form onSubmit={handleSubmit} className="donation-form">
            <div className="form-group">
              <label>Food Item Name</label>
              <input
                required
                type="text"
                placeholder="e.g., 20 Fresh Baguettes"
                value={formData.foodItem}
                onChange={e => setFormData({ ...formData, foodItem: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity/Weight</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., 5 kg"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="prepared">Prepared Meals</option>
                  <option value="grocery">Packaged Goods</option>
                  <option value="produce">Fresh Produce</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Expiry Date/Time</label>
              <input
                required
                type="datetime-local"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                required
                type="text"
                placeholder="Address or Instructions"
                value={formData.pickupLocation}
                onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="btn-primary full-width"
            >
              {loading ? 'Posting...' : 'List Donation'}
            </button>
          </form>
        </div>
      ) : (
        <div className="cards-grid">
          {myDonations.length === 0 && (
            <div className="empty-state">
              No donations listed yet. Start by adding one!
            </div>
          )}
          {myDonations.map(donation => (
            <DonationCard key={donation.id} donation={donation} role="donor" />
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Recipient Dashboard
const RecipientDashboard = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchDonations = async () => {
    try {
      const res = await fetch(API_URL);
      let data = await res.json();
      
      // Filter logic: Show available OR items I claimed
      data = data.filter(d => 
        d.status === 'available' || (d.status === 'claimed' && d.claimedBy === user.uid)
      );
      setDonations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 5000); // Auto-refresh
    return () => clearInterval(interval);
  }, [user]);

  const handleClaim = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'claimed', claimedBy: user.uid })
      });
      fetchDonations(); 
    } catch (e) { console.error(e); }
  };

  const handleComplete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'distributed' })
      });
      fetchDonations();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-section">
        <h2 className="dashboard-title">Available Food Donations</h2>
        <div className="filter-bar">
          {['all', 'prepared', 'grocery', 'produce'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="cards-grid">
        {donations
          .filter(d => filter === 'all' || d.type === filter)
          .map(donation => (
            <div key={donation.id} className="card-wrapper">
               <DonationCard 
                 donation={donation} 
                 role="recipient" 
                 onClaim={() => handleClaim(donation.id)}
                 onComplete={() => handleComplete(donation.id)}
                 currentUserId={user.uid}
               />
            </div>
          ))}
        {donations.length === 0 && (
          <div className="empty-search-state">
            <Search className="icon-xl text-gray" />
            <p>No food donations available right now. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Analyst Dashboard
const AnalystDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    claimed: 0,
    distributed: 0,
    byType: { prepared: 0, grocery: 0, produce: 0 }
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(API_URL);
      const docs = await res.json();
      
      const newStats = {
        total: docs.length,
        active: docs.filter(d => d.status === 'available').length,
        claimed: docs.filter(d => d.status === 'claimed').length,
        distributed: docs.filter(d => d.status === 'distributed').length,
        byType: {
          prepared: docs.filter(d => d.type === 'prepared').length,
          grocery: docs.filter(d => d.type === 'grocery').length,
          produce: docs.filter(d => d.type === 'produce').length,
        }
      };
      setStats(newStats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Impact Analytics</h2>
      
      <div className="stats-grid">
        <StatCard title="Total Donations" value={stats.total} icon={BarChart3} type="blue" />
        <StatCard title="Active Listings" value={stats.active} icon={AlertCircle} type="emerald" />
        <StatCard title="In Progress" value={stats.claimed} icon={Truck} type="orange" />
        <StatCard title="Meals Saved" value={stats.distributed} type="purple" icon={Truck} /> 
      </div>
      {/* (Chart components omitted for brevity, they are visual only) */}
    </div>
  );
};

// 5. Admin Dashboard
const AdminDashboard = () => {
  const [allDonations, setAllDonations] = useState([]);

  const fetchDonations = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAllDonations(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this listing?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchDonations();
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Platform Administration</h2>
      <div className="table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Donor</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allDonations.map(d => (
                <tr key={d.id}>
                  <td className="font-medium">{d.foodItem}</td>
                  <td className="text-gray">{d.donorName}</td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="text-sm">
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Just now'}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDelete(d.id)}
                      className="btn-icon-danger"
                    >
                      <Trash2 className="icon-small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const DonationCard = ({ 
  donation, 
  role, 
  onClaim, 
  onComplete,
  currentUserId 
}) => {
  const isClaimedByMe = donation.status === 'claimed' && donation.claimedBy === currentUserId;

  return (
    <div className="donation-card">
      <div className="card-header">
        <span className={`category-tag ${donation.type}`}>
          {donation.type}
        </span>
        <StatusBadge status={donation.status} />
      </div>
      
      <h3 className="card-title">{donation.foodItem}</h3>
      <p className="card-qty">Qty: {donation.quantity}</p>
      
      <div className="card-details">
        <div className="detail-row">
          <Clock className="icon-small text-gray-light" />
          <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <MapPin className="icon-small text-gray-light" />
          <span className="truncate">{donation.pickupLocation}</span>
        </div>
      </div>

      <div className="card-footer">
        {role === 'recipient' && donation.status === 'available' && (
          <button 
            onClick={onClaim}
            className="btn-blue full-width"
          >
            Claim Donation
          </button>
        )}
        {role === 'recipient' && isClaimedByMe && (
          <div className="pending-actions">
            <div className="status-message pending">
              Pending Pickup
            </div>
            <button 
              onClick={onComplete}
              className="btn-emerald full-width"
            >
              Mark Distributed
            </button>
          </div>
        )}
        {role === 'donor' && (
          <div className="donor-status-msg">
            {donation.status === 'available' ? 'Waiting for recipient...' : 
             donation.status === 'claimed' ? 'Recipient is on the way!' : 
             'Successfully Distributed'}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`status-badge ${status}`}>
      {status}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, type }) => (
  <div className="stat-card">
    <div className={`stat-icon-wrapper ${type}`}>
      <Icon className={`icon-large text-${type}`} />
    </div>
    <div>
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

// --- Main Application Component ---
function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const handleLogout = () => {
    setRole(null);
    setUser(null);
  };

  if (!role) {
    return <LoginScreen onSelectRole={setRole} onLogin={setUser} />;
  }

  return (
    <div className="app-root">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-content">
            <div className="nav-brand">
              <div className="brand-icon">
                <Leaf className="icon-medium text-emerald" />
              </div>
              <span className="brand-name">FoodConnect</span>
              <span className="role-badge">
                {role.toUpperCase()} View
              </span>
            </div>
            <div className="nav-actions">
              <button 
                onClick={handleLogout}
                className="btn-text"
              >
                <LogOut className="icon-small" />
                <span className="desktop-only">Exit Role</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {role === 'donor' && <DonorDashboard user={user} />}
        {role === 'recipient' && <RecipientDashboard user={user} />}
        {role === 'analyst' && <AnalystDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;