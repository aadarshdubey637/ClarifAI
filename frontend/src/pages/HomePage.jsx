import React, { useRef } from 'react';
import { Layers, Play, Upload, MessageCircle, FileText, Zap, ChevronRight, Star, Clock, Globe, User, Twitter, Github, Linkedin, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://clarifai-backend-q4j0.onrender.com';
  }
  return 'http://localhost:8000';
};

const API_URL = getApiUrl();

const HomePage = ({ onNavigate, onVideoSelect, isAuthenticated, onLogout }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      alert('Please login to upload videos.');
      onNavigate('login');
      return; 
    }
    if (isUploading) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Start loading state
    setIsUploading(true);

    // 1. Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 2. Call Backend API
      const response = await fetch(`${API_URL}/api/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      
      // 3. On success, pass the data to parent (App.jsx)
      // We pass the local file for immediate preview and backend data for reference
      if (onVideoSelect) {
        onVideoSelect({
          file: file, // local file for URL.createObjectURL
          dbData: data // backend data (id, file_path, etc.)
        });
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-dark font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center shadow-sm">
              <Layers className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight">EduMind AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">Home</a>
            <a href="#" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">About</a>
            <a href="#" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">Pricing</a>
            <a href="#" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-brand-border">
                  <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center">
                    <User className="text-white w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-brand-dark">Account</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-sm font-semibold text-brand-gray hover:text-brand-orange transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-sm font-semibold hover:text-brand-orange transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => onNavigate('signup')}
                  className="bg-brand-blue text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-0">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1.5 rounded-full text-xs font-semibold mb-4 border border-orange-100">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              AI-Powered Learning Platform
            </div>
            <h1 className="text-4xl lg:text-5xl font-semibold leading-[1.1] mb-4 tracking-tight text-brand-dark">
              Learn Smarter with AI-Powered Video Learning
            </h1>
            <p className="text-base text-brand-gray leading-relaxed mb-6 max-w-lg">
              Transform your learning experience with AI. Ask questions directly from lecture videos, generate instant summaries, and navigate complex concepts with ease.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-dark transition-all group text-sm">
                Get Started <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white border border-brand-border px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm">
                <div className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-brand-dark fill-current" />
                </div>
                Watch Demo
              </button>
            </div>
            
            <div className="mt-8 flex gap-8">
              <div>
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-[10px] font-semibold text-brand-gray uppercase tracking-widest mt-0.5">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-[10px] font-semibold text-brand-gray uppercase tracking-widest mt-0.5">Courses</p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-start -ml-10">
            {/* Upload Card - Increased Weight */}
            <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-brand-border relative overflow-hidden w-full max-w-[540px]">
              <div className="flex flex-col items-center py-2">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center shadow-lg shadow-orange-200 mb-3">
                  <Upload className="text-white w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-center">Upload Your Lecture</h3>
                <p className="text-brand-gray text-[11px] mb-6 text-center">Drop your video file or paste a YouTube link</p>
                
                <div 
                  onClick={handleUploadClick}
                  className={`w-full border-2 border-dashed border-brand-border rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="video/*"
                    disabled={isUploading}
                  />
                  <Upload className={`text-brand-gray w-7 h-7 mb-2 group-hover:-translate-y-1 transition-transform ${isUploading ? 'animate-bounce' : ''}`} />
                  <p className="text-[13px] font-semibold text-center">
                    <span className="text-brand-orange">{isUploading ? 'Uploading...' : 'Click to upload'}</span> or drag and drop
                  </p>
                  <p className="text-[9px] text-brand-gray mt-1 uppercase tracking-widest text-center">MP4, AVI, MOV (max. 500MB)</p>
                </div>

                <div className="w-full relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-border"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] font-semibold text-brand-gray uppercase tracking-[0.2em]">
                    <span className="bg-white px-3">OR</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <input 
                    type="text" 
                    placeholder="Paste YouTube URL" 
                    className="w-full bg-white border border-brand-border rounded-xl py-3 px-5 text-[13px] outline-none focus:border-brand-orange transition-colors"
                  />
                  <button 
                    onClick={() => onNavigate('analysis')}
                    className="w-full bg-brand-blue text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-dark transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Start Learning
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-4 text-[9px] font-semibold text-brand-gray uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-brand-border flex items-center justify-center text-[8px]">✓</div>
                    All formats
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-brand-border flex items-center justify-center text-[8px]">✓</div>
                    YouTube
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-brand-border flex items-center justify-center text-[8px]">✓</div>
                    Auto transcription
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-brand-lightBlue">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-semibold mb-1">10K+</p>
            <p className="text-[11px] font-semibold text-brand-gray uppercase tracking-widest">Students</p>
          </div>
          <div>
            <p className="text-3xl font-semibold mb-1">500+</p>
            <p className="text-[11px] font-semibold text-brand-gray uppercase tracking-widest">Courses</p>
          </div>
          <div>
            <p className="text-3xl font-semibold mb-1">1M+</p>
            <p className="text-[11px] font-semibold text-brand-gray uppercase tracking-widest">AI Responses</p>
          </div>
          <div>
            <p className="text-3xl font-semibold mb-1">2X</p>
            <p className="text-[11px] font-semibold text-brand-gray uppercase tracking-widest">Efficiency</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3 text-brand-dark">Powerful AI Features</h2>
          <p className="text-sm text-brand-gray">Everything you need to transform your learning experience with cutting-edge AI technology.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, color: 'bg-orange-500', title: 'Contextual Q&A', desc: 'Ask questions and get instant answers directly from your lecture videos.' },
            { icon: FileText, color: 'bg-orange-500', title: 'Smart Summaries', desc: 'Generate comprehensive summaries of lectures in seconds, saving hours of time.' },
            { icon: Zap, color: 'bg-orange-500', title: 'Jump-to-Moment', desc: 'Navigate instantly to any concept or timestamp with intelligent video navigation.' },
            { icon: Zap, color: 'bg-orange-100 text-orange-600', title: 'Streaming Responses', desc: "Get real-time AI responses that stream as they're generated for faster learning." },
            { icon: Layers, color: 'bg-orange-100 text-orange-600', title: 'Session Memory', desc: 'AI remembers your conversation context for more natural learning.' },
            { icon: Star, color: 'bg-orange-100 text-orange-600', title: 'AI Quiz Generator', desc: 'Automatically generate practice quizzes from lecture content to test knowledge.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-[24px] border border-brand-border hover:shadow-lg transition-all group">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform`}>
                <feature.icon className={`w-5 h-5 ${feature.color.includes('text') ? '' : 'text-white'}`} />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-brand-dark">{feature.title}</h3>
              <p className="text-brand-gray text-xs leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-semibold mb-3 text-brand-dark">How It Works</h2>
          <p className="text-sm text-brand-gray">Get started in minutes with our simple four-step process.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {[
            { icon: Upload, title: 'Upload Lecture', desc: 'Upload your video lectures or provide YouTube links' },
            { icon: FileText, title: 'Generate Transcript', desc: 'AI automatically transcribes and analyzes the content' },
            { icon: MessageCircle, title: 'Ask Questions', desc: 'Chat with AI about any concept from the lecture' },
            { icon: Zap, title: 'Learn Faster', desc: 'Master concepts in half the time with AI assistance' },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full border border-brand-border flex items-center justify-center bg-white mb-6 group-hover:border-brand-orange transition-colors shadow-sm">
                <step.icon className="w-6 h-6 text-brand-dark group-hover:text-brand-orange transition-colors" />
              </div>
              <h3 className="text-base font-semibold mb-3 text-brand-dark">{step.title}</h3>
              <p className="text-brand-gray text-[11px] leading-relaxed max-w-[180px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI in Action */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3 text-brand-dark">See AI in Action</h2>
          <p className="text-sm text-brand-gray">Watch how students interact with their lectures using AI.</p>
        </div>

        <div className="max-w-3xl mx-auto bg-slate-50/50 rounded-[32px] p-6 md:p-8 border border-brand-border shadow-sm">
          <div className="space-y-6">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-brand-border shadow-sm max-w-md">
                <p className="text-xs font-semibold">Can you explain polymorphism with an example?</p>
              </div>
            </div>

            <div className="flex gap-3 items-start flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
                <Layers className="text-white w-4 h-4" />
              </div>
              <div className="bg-orange-50/50 p-4 rounded-2xl rounded-tr-none border border-orange-100 shadow-sm max-w-md">
                <p className="text-xs leading-relaxed mb-3 font-semibold text-brand-dark">
                  Based on the lecture, polymorphism is the ability of objects to take multiple forms. The professor explains this concept at timestamp 15:30 with a practical example.
                </p>
                <button className="bg-white border border-brand-border px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 hover:bg-white transition-colors text-brand-dark">
                  <Play className="w-2.5 h-2.5 fill-current" /> Jump to 15:30
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-semibold mb-3 text-brand-dark">Loved by Students</h2>
          <p className="text-sm text-brand-gray">See what our users have to say about their learning journey.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              name: 'Sarah Johnson', 
              role: 'Computer Science', 
              text: 'EduMind AI transformed how I study. I can ask questions directly from lectures and get instant answers.',
              image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
            },
            { 
              name: 'Michael Chen', 
              role: 'MBA Student', 
              text: 'The jump-to-moment feature is incredible. I can review specific concepts without watching entire lectures.',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
            },
            { 
              name: 'Emily Rodriguez', 
              role: 'Medical Student', 
              text: 'Smart summaries help me review complex topics quickly. The AI quiz generator is perfect.',
              image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
            },
          ].map((test, i) => (
            <div key={i} className="bg-white p-8 rounded-[24px] border border-brand-border shadow-sm flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-brand-orange fill-current" />)}
              </div>
              <p className="text-brand-gray text-xs leading-relaxed mb-6 italic">"{test.text}"</p>
              <div className="mt-auto flex items-center gap-3">
                <img src={test.image} alt={test.name} className="w-10 h-10 rounded-full object-crop" />
                <div>
                  <p className="text-xs font-semibold text-brand-dark">{test.name}</p>
                  <p className="text-[10px] text-brand-gray font-medium">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-brand-dark mb-4 tracking-tight">Ready to Transform Your Learning?</h2>
          <p className="text-brand-gray text-base md:text-lg mb-8">Join thousands of students who are learning smarter with AI.</p>
          <button className="bg-[#0B1222] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-dark transition-all shadow-lg">
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Final Footer (Pure Black Style) */}
      <footer className="py-12 bg-black text-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-8">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Layers className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">EduMind AI</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-[300px] mb-6">
                Empowering students with AI-driven insights. Transform your learning experience with intelligent video analysis.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all text-slate-400">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all text-slate-400">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all text-slate-400">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-200">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-brand-orange transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-200">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#" className="hover:text-brand-orange transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-orange transition-colors">Privacy</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-200">Stay Updated</h4>
              <p className="text-slate-400 text-sm mb-4">Join 10,000+ students for AI learning tips.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Enter your email" 
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-orange w-full transition-all" 
                  />
                </div>
                <button className="bg-brand-orange text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 whitespace-nowrap active:scale-95">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-slate-500">
            <div className="flex items-center gap-6">
              <p>© 2026 EduMind AI Inc.</p>
              <div className="hidden md:flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-500">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Floating Help Icon */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-all shadow-2xl shadow-orange-900/40 group relative">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
