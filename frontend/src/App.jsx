import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { SignUp } from './components/SignUp';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  const hostname = window.location.hostname;
  if (hostname.includes('onrender.com')) {
    return `https://${hostname.replace('frontend', 'backend')}`;
  }

  return 'http://localhost:8000';
};

const API_URL = getApiUrl();

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('home'); // 'home', 'login', 'signup', or 'analysis'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setUser({ email: loginData.email }); // Simplified user object
        setView('home');
        // alert('Login Successful!');
      } else {
        alert('Login Failed: ' + (data.detail || 'Invalid credentials'));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert(`Debug Info:\nConnecting to: ${API_URL}\nError: ${error.message}\n\nPlease make sure this URL is correct and the backend is live.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setView('home');
  };

  const handleVideoSelect = (fileData) => {
    if (!isAuthenticated) {
      alert('Please login to upload videos.');
      setView('login');
      return;
    }
    setSelectedVideo(fileData);
    setView('analysis');
  };

  const renderLogin = () => (
    <div className="w-full max-w-[400px] flex flex-col items-center">
      {/* Logo - Orange background with white stacked layers */}
      <div className="w-12 h-12 bg-[#FF8A00] rounded-xl flex items-center justify-center mb-8 shadow-sm">
        <Layers className="text-white w-7 h-7" />
      </div>

      {/* Heading */}
      <h1 className="text-[32px] font-bold text-[#0F172A] mb-10 tracking-tight text-center">
        Welcome back
      </h1>

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="w-full space-y-6">
        <Input 
          label="Email address"
          type="email" 
          placeholder="name@example.com" 
          autoComplete="off"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          required
        />
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[14px] font-bold text-[#0F172A]">Password</label>
            <a href="#" className="text-[14px] text-[#64748B] hover:text-[#0F172A] transition-colors">
              Forgot?
            </a>
          </div>
          <Input 
            type="password" 
            placeholder="Enter your password" 
            autoComplete="new-password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading} className="mt-2 py-3 bg-[#0F172A] hover:bg-[#1E293B] rounded-lg text-white font-bold transition-all">
          {isLoading ? "Please wait..." : "Continue"}
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

      {/* Google Login Button */}
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
        Continue with Google
      </button>

      {/* Footer Link */}
      <p className="mt-10 text-[15px] text-[#64748B]">
        Don't have an account?{' '}
        <button 
          onClick={() => setView('signup')}
          className="text-[#0F172A] font-bold hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen w-full font-sans selection:bg-brand-orange/20">
      {view === 'home' ? (
        <HomePage 
          onNavigate={setView} 
          onVideoSelect={handleVideoSelect} 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      ) : view === 'analysis' ? (
        <AnalysisPage onBack={() => setView('home')} videoData={selectedVideo} />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white relative">
          {/* Back to Home Button */}
          <button 
            onClick={() => setView('home')}
            className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-brand-gray hover:text-brand-dark transition-colors"
          >
            ← Back to Home
          </button>
          {view === 'login' ? renderLogin() : <SignUp onSwitchToLogin={() => setView('login')} />}
        </div>
      )}
    </div>
  );
}

export default App;
