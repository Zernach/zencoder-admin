import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-900 mb-4">404</div>
        <div className="text-2xl font-bold text-gray-700 uppercase tracking-tight mb-2">
          Page Not Found
        </div>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 border-2 border-gray-900 bg-gray-900 text-white px-6 py-3 text-sm font-medium uppercase hover:bg-gray-800"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
