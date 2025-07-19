import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-6xl font-bold text-bangus-cyan">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Forbidden</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Link to="/" className="px-4 py-2 w-full bg-bangus-cyan text-white rounded hover:bg-bangus-teal transition-colors">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;