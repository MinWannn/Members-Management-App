import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const menuItems = user?.role === 'superadmin' ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/members', label: 'All Members', icon: '👥' },
        { path: '/admin/add-member', label: 'Add Member', icon: '➕' },
        { path: '/admin/expiring', label: 'Expiring Members', icon: '⏰' },
        { path: '/admin/statistics', label: 'Statistics', icon: '📈' },
        { path: '/admin/logs', label: 'Activity Logs', icon: '📋' },
        { path: '/admin/tools', label: 'Admin Tools', icon: '🔧' },
        { path: '/admin/export', label: 'Export PDF', icon: '📄' },
    ] : [
        { path: '/profile', label: 'My Profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-gray-700">
                    <h1 className="text-2xl font-bold">Members App</h1>
                    <p className="text-sm text-gray-400 mt-1">Management System</p>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-lg font-semibold">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-400">{user?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area - will be filled by children */}
            <div className="flex-1 bg-gray-50">
                {/* This will be wrapped around page content */}
            </div>
        </div>
    );
};

export default Navigation;
