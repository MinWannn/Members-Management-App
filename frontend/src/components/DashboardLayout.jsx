import Navigation from './Navigation';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Navigation />

            {/* Main Content */}
            <div className="flex-1 bg-gray-50 overflow-auto">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;
