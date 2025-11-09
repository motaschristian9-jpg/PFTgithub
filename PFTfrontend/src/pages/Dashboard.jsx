import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in URL params (from Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    const newUser = urlParams.get('new_user');

    if (token) {
      // Store token and clean URL
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, '/dashboard');

      // Show success message for new users or Google login
      if (newUser === '1') {
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Welcome! Your account has been created successfully.',
          confirmButtonColor: '#10B981',
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back! You have been logged in successfully.',
          confirmButtonColor: '#10B981',
        });
      }
    }

    if (error) {
      // Handle error from Google OAuth
      console.error('Google OAuth error:', error);
      window.history.replaceState({}, document.title, '/dashboard');
      navigate('/login');
    }

    // Check if user is authenticated
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Dashboard</h1>
        <p className="text-center mb-4">Welcome to your dashboard!</p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
