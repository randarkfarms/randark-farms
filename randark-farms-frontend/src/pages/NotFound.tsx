import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-surface-dark">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-700">404</h1>
        <p className="text-xl font-semibold mt-4">Page Not Found</p>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-6">
          <Home size={16} className="mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;