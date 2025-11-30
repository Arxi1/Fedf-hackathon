import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';

const Layout = ({ children, role, user, onLogout }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigationItems = {
    donor: [
      { path: '/donor', label: 'Dashboard', icon: Home },
      { path: '/donor/donations', label: 'My Donations', icon: Package },
      { path: '/donor/profile', label: 'Profile', icon: Users },
      { path: '/donor/settings', label: 'Settings', icon: Settings }
    ],
    recipient: [
      { path: '/recipient', label: 'Dashboard', icon: Home },
      { path: '/recipient/donations', label: 'Available Food', icon: Package },
      { path: '/recipient/claims', label: 'My Claims', icon: Users },
      { path: '/recipient/history', label: 'History', icon: BarChart3 },
      { path: '/recipient/profile', label: 'Organization', icon: Shield }
    ],
    analyst: [
      { path: '/analyst', label: 'Analytics', icon: BarChart3 },
      { path: '/analyst/reports', label: 'Reports', icon: Package },
      { path: '/analyst/trends', label: 'Trends', icon: Users },
      { path: '/analyst/settings', label: 'Settings', icon: Settings }
    ],
    admin: [
      { path: '/admin', label: 'Dashboard', icon: Shield },
      { path: '/admin/donations', label: 'All Donations', icon: Package },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/admin/settings', label: 'Settings', icon: Settings }
    ]
  };

  const currentNavItems = navigationItems[role] || [];

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div className={`bg-dark text-white ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
           style={{ width: '250px', minHeight: '100vh' }}>
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">
              <i className="fas fa-utensils me-2 text-warning"></i>
              FoodConnect
            </h5>
            <button
              className="btn btn-link text-white d-md-none p-0"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{ width: '40px', height: '40px' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="fw-bold">{user?.email || 'User'}</div>
                <small className="text-muted text-capitalize">{role} Account</small>
              </div>
            </div>
          </div>

          <nav className="nav flex-column">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                             (item.path !== `/${role}` && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link text-white d-flex align-items-center mb-2 ${
                    isActive ? 'bg-primary rounded px-3 py-2' : 'px-3 py-2'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} className="me-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <hr className="my-4" />

          <button
            onClick={handleLogout}
            className="btn btn-outline-light w-100 d-flex align-items-center"
          >
            <LogOut size={18} className="me-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Bar */}
        <div className="bg-white border-bottom d-flex align-items-center justify-content-between px-3 py-2">
          <button
            className="btn btn-link text-dark d-md-none p-0 me-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="d-flex align-items-center">
            <div className="input-group" style={{ width: '300px' }}>
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="d-flex align-items-center">
            <button className="btn btn-link text-dark position-relative me-3">
              <Bell size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>

            <div className="dropdown">
              <button
                className="btn btn-link text-dark dropdown-toggle d-flex align-items-center"
                type="button"
                data-bs-toggle="dropdown"
              >
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                     style={{ width: '32px', height: '32px' }}>
                  <Users size={16} className="text-white" />
                </div>
                <span className="d-none d-sm-inline">{user?.email?.split('@')[0] || 'User'}</span>
              </button>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to={`/${role}/profile`}>Profile</Link></li>
                <li><Link className="dropdown-item" to={`/${role}/settings`}>Settings</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
