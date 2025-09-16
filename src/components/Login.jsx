import React from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loading, error } = useAuth();

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="login-title">
          <LogIn className="inline mr-2" />
          UIC ChemSphere Login
        </h2>

        {loading ? (
          <>
            <div className="loading-spinner"></div>
            <p>Checking authentication...</p>
          </>
        ) : (
          <>
            <p className="mb-4 text-gray-600">
              Please sign in with your Google account
            </p>

            {error && (
              <div className="error-message mb-4">
                {error}
              </div>
            )}

            <button 
              onClick={login} 
              className="login-button google-login"
              disabled={loading}
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google logo" 
                className="w-5 h-5 mr-2"
              />
              Sign in with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
