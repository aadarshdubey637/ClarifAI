import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (window.location.hostname.includes('onrender.com')) {
    return 'https://clarifai-backend-q4j0.onrender.com';
  }

  return 'http://localhost:8000';
};

const API_URL = getApiUrl();

export const SignUp = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup Successful! Now you can login.');
        onSwitchToLogin();
      } else {
        alert('Signup Failed: ' + (data.detail || 'Something went wrong'));
      }
    } catch (error) {
      alert('Error: Could not connect to backend. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col items-center">
      {/* Logo */}
      <div className="w-12 h-12 bg-[#FF8A00] rounded-xl flex items-center justify-center mb-8 shadow-sm">
        <Layers className="text-white w-7 h-7" />
      </div>

      {/* Heading */}
      <h1 className="text-[32px] font-bold text-[#0F172A] mb-10 tracking-tight text-center">
        Create an account
      </h1>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6" autoComplete="off">
        <Input 
          label="Full name"
          type="text" 
          placeholder="Enter your name" 
          autoComplete="off"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
        
        <Input 
          label="Email address"
          type="email" 
          placeholder="name@example.com" 
          autoComplete="off"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <Input 
          label="Password"
          type="password" 
          placeholder="Create a password" 
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Button type="submit" disabled={isLoading} className="mt-2 py-3 bg-[#0F172A] hover:bg-[#1E293B] rounded-lg text-white font-bold transition-all">
          {isLoading ? "Creating account..." : "Get started"}
        </Button>
      </form>

      {/* OR Divider */}
      <div className="w-full relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E2E8F0]"></div>
        </div>
        <div className="relative flex justify-center text-[12px] font-semibold text-[#64748B] uppercase">
          <span className="bg-white px-4 tracking-wider">OR</span>
        </div>
      </div>

      {/* Google Sign Up */}
      <button className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] font-bold hover:bg-gray-50 transition-all text-[15px]">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign up with Google
      </button>

      {/* Footer Link */}
      <p className="mt-10 text-[15px] text-[#64748B]">
        Already have an account?{' '}
        <button 
          onClick={onSwitchToLogin}
          className="text-[#0F172A] font-bold hover:underline"
        >
          Log in
        </button>
      </p>
    </div>
  );
};
