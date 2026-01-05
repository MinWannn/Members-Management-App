import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-20 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Members App
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    A comprehensive solution for managing organization members, subscriptions, and payments.
                </p>

                <div className="my-12 text-left max-w-3xl mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Key Features:</h2>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <span className="font-bold text-gray-900 mr-2">Member Management:</span>
                            <span className="text-gray-600">Easily register, approve, and manage member profiles.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-gray-900 mr-2">Subscription Tracking:</span>
                            <span className="text-gray-600">Flexible plans with automated renewal reminders and expiration handling.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-gray-900 mr-2">Financial Overview:</span>
                            <span className="text-gray-600">Track payments, revenue, and generate reports.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-gray-900 mr-2">Action History:</span>
                            <span className="text-gray-600">Detailed logs of all system activities for transparency.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-200 my-12 max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4">
                        Demo Credentials
                    </h3>
                    <div className="space-y-2 text-gray-700">
                        <p>
                            <span className="font-medium">Super Admin Email:</span> admin@demo.com
                        </p>
                        <p>
                            <span className="font-medium">Password:</span> admin123
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Use these credentials to log in and explore the admin dashboard.
                    </p>
                </div>

                <div className="mt-12 flex gap-4 justify-center">
                    <Link
                        to="/login"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
