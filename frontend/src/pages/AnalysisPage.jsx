import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Layers, 
  Share2, 
  Download, 
  Play, 
  FileText, 
  Clock, 
  Send, 
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Video,
  Mic,
  Cpu,
  Save,
  CheckCircle,
  Activity
} from 'lucide-react';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://clarifai-backend-q4j0.onrender.com';
  }
  return 'http://localhost:8000';
};

const API_URL = getApiUrl();

const AnalysisPage = ({ onBack, videoData }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I've analyzed your lecture video. Feel free to ask me any questions about the content."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [processingStatus, setProcessingStatus] = useState(videoData?.dbData?.status || 'uploaded');
  const [progress, setProgress] = useState(videoData?.dbData?.progress_percentage || 0);
  const [currentText, setCurrentText] = useState('');
  const [liveHistory, setLiveHistory] = useState([]);
  const [transcriptChunks, setTranscriptChunks] = useState([]);
  const [summaryPoints, setSummaryPoints] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  const videoRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  const chunkRefs = useRef([]);

  // videoData structure: { file: File, dbData: { id, title, file_path, upload_date, status } }
  const videoUrl = useMemo(() => {
    return videoData?.file ? URL.createObjectURL(videoData.file) : null;
  }, [videoData]);

  // Helper to format time
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchTranscript = async () => {
    try {
      const response = await fetch(`${API_URL}/api/videos/${videoData.dbData.id}/transcript`);
      if (response.ok) {
        const data = await response.json();
        setTranscriptChunks(data.chunks);
        if (data.summary) {
          setSummaryPoints(data.summary);
        }
        chunkRefs.current = data.chunks.map(() => React.createRef());
      }
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
    }
  };

  // Polling for status updates
  // Auto-scroll to bottom when chat messages change or AI is typing
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    let interval;
    if (videoData?.dbData?.id && processingStatus !== 'transcript_completed' && processingStatus !== 'failed') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/api/videos/${videoData.dbData.id}`);
          if (response.ok) {
            const data = await response.json();
            setProcessingStatus(data.status);
            setProgress(data.progress_percentage || 0);
            
            if (data.current_chunk && data.current_chunk !== currentText) {
              setCurrentText(data.current_chunk);
              
              // Handle "timestamp|text" format if present
              let newEntry = { text: data.current_chunk, time: null };
              if (data.current_chunk.includes('|')) {
                const [time, text] = data.current_chunk.split('|');
                newEntry = { time: parseFloat(time), text: text };
              }
              
              setLiveHistory(prev => [newEntry, ...prev].slice(0, 5));
            }
            
            if (data.status === 'transcript_completed') {
              clearInterval(interval);
              fetchTranscript();
            }
          }
        } catch (error) {
          console.error('Status check failed:', error);
        }
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [videoData, processingStatus]);

  // Initial fetch if already completed
  useEffect(() => {
    if (processingStatus === 'transcript_completed' && videoData?.dbData?.id) {
      fetchTranscript();
    }
  }, []);

  // Track active chunk based on video time
  useEffect(() => {
    const index = transcriptChunks.findIndex(
      chunk => currentTime >= chunk.start_time && currentTime <= chunk.end_time
    );
    if (index !== -1 && index !== activeChunkIndex) {
      setActiveChunkIndex(index);
      if (isAutoScrollEnabled) {
        scrollToChunk(index);
      }
    }
  }, [currentTime, transcriptChunks, isAutoScrollEnabled]);

  const scrollToChunk = (index) => {
    const container = transcriptContainerRef.current;
    const chunkElement = chunkRefs.current[index]?.current;
    
    if (container && chunkElement) {
      const containerHeight = container.offsetHeight;
      const chunkTop = chunkElement.offsetTop;
      const chunkHeight = chunkElement.offsetHeight;
      
      // Center the active chunk in the container
      const scrollPosition = chunkTop - (containerHeight / 2) + (chunkHeight / 2);
      
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleChunkClick = (startTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  const handleScroll = () => {
    setIsAutoScrollEnabled(false);
  };

  const getStatusText = () => {
    switch (processingStatus) {
      case 'uploaded': return 'Uploading Video...';
      case 'processing': return 'Extracting Audio...';
      case 'transcript_generating': return 'Generating Timestamps...';
      case 'summarizing': return 'AI Smart Summary...';
      case 'transcript_completed': return 'Completed';
      case 'failed': return 'Processing Failed';
      default: return 'Processing...';
    }
  };

  // Pipeline Steps Logic
  const getStepStatus = (stepIndex) => {
    const statusMap = {
      'uploaded': 0,
      'processing': 1,
      'transcript_generating': 3,
      'summarizing': 4,
      'transcript_completed': 5
    };
    
    const currentStepIndex = statusMap[processingStatus] || 0;
    
    if (currentStepIndex > stepIndex) return 'completed';
    if (currentStepIndex === stepIndex) return 'active';
    return 'pending';
  };

  const steps = [
    { label: 'Uploading Video', icon: Video },
    { label: 'Extracting Audio', icon: Mic },
    { label: 'Running Whisper ASR', icon: Cpu },
    { label: 'Generating Timestamps', icon: Clock },
    { label: 'Saving Transcript', icon: Save },
    { label: 'Completed', icon: CheckCircle }
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/videos/${videoData.dbData.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain. Please try again." }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please check if the server is running." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const parseTimestamp = (text) => {
    // Regex to find [MM:SS] or [HH:MM:SS] or just MM:SS
    const regex = /\[?(\d{1,2}:)?(\d{1,2}):(\d{2})\]?/g;
    const matches = [...text.matchAll(regex)];
    return matches.map(match => match[0]);
  };

  const convertToSeconds = (timestamp) => {
    const clean = timestamp.replace(/[\[\]]/g, '');
    const parts = clean.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-brand-dark relative">
      {/* Premium Loader Overlay (Matches Reference Image - Compact for single screen) */}
      {processingStatus !== 'transcript_completed' && processingStatus !== 'failed' && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
          {/* Top Badge */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full mb-4">
            <Activity className="w-3 h-3 text-brand-orange" />
            <span className="text-[9px] font-bold text-brand-gray uppercase tracking-widest">Live Transcription</span>
            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-brand-dark mb-1 tracking-tight">AI Analysis in Progress</h1>
            <p className="text-xs text-brand-gray font-medium max-w-lg mx-auto leading-relaxed">
              We're transcribing and analyzing your lecture with high precision.
            </p>
          </div>

          {/* Central Progress Circle (More compact) */}
          <div className="relative mb-6">
            <div className="w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  stroke="#F1F5F9"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="78"
                  stroke="#FF8A00"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 78}
                  strokeDashoffset={2 * Math.PI * 78 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-brand-dark tabular-nums">{progress}%</span>
                <span className="text-[8px] font-black text-brand-gray uppercase tracking-[0.2em] mt-0.5">Processing</span>
              </div>
            </div>
          </div>

          {/* Current Status Message */}
          <div className="flex flex-col items-center gap-1 mb-6">
            <div className="flex items-center gap-2 text-brand-orange">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-base font-bold">{getStatusText()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-gray/60">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-medium">Estimated time remaining: 00:01:24</span>
            </div>
          </div>

          {/* Pipeline / Stepper (More compact) */}
          <div className="w-full max-w-4xl flex items-center justify-between relative mb-12 px-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-8 right-8 h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
            
            {steps.map((step, i) => {
              const status = getStepStatus(i);
              const StepIcon = step.icon;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-white ${
                    status === 'completed' ? 'border-brand-orange text-brand-orange shadow-lg shadow-orange-500/10' :
                    status === 'active' ? 'border-brand-orange text-brand-orange shadow-lg scale-110' :
                    'border-slate-200 text-slate-300'
                  }`}>
                    {status === 'completed' ? <CheckCircle2 className="w-4.5 h-4.5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-center absolute -bottom-6 whitespace-nowrap">
                    <p className={`text-[8px] font-black uppercase tracking-tight transition-colors duration-500 ${
                      status === 'pending' ? 'text-slate-300' : 'text-brand-orange'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wide Live Streaming Transcript Card (Compact height) */}
          <div className="w-full max-w-3xl bg-white rounded-[24px] border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-brand-orange" />
                <h3 className="text-xs font-bold text-brand-dark">Live Streaming Transcript</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                <span className="text-[9px] font-black text-brand-dark uppercase tracking-widest">Live</span>
              </div>
            </div>

            <div className="p-8 space-y-5 h-[160px] overflow-hidden">
              {liveHistory.length > 0 ? (
                liveHistory.map((item, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-8 transition-all duration-700 ${
                      i === 0 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-1'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-brand-dark' : 'border-2 border-slate-200 bg-white'}`} />
                      <span className="text-[10px] font-bold text-brand-gray tracking-widest tabular-nums">
                        {item.time ? formatTime(item.time) : '--:--'}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed max-w-xl ${i === 0 ? 'text-brand-dark font-bold' : 'text-brand-gray font-medium'}`}>
                      {item.text}
                    </p>
                    {i === 0 && (
                      <div className="ml-auto flex items-center gap-1">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="w-0.5 h-2 bg-brand-orange/40 rounded-full animate-pulse" style={{ animationDelay: `${j * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-4 gap-4">
                  <div className="w-8 h-8 rounded-full border-4 border-slate-50 border-t-brand-orange animate-spin" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Neural Engine Initializing...</p>
                </div>
              )}
            </div>

            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-4">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Next line is being generated...</span>
              
              {/* Visualizer Waveform (More compact) */}
              <div className="w-full flex items-center justify-center gap-[2px] h-6">
                {[...Array(80)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-0.5 bg-slate-200 rounded-full transition-all duration-300"
                    style={{ 
                      height: `${10 + Math.random() * 80}%`,
                      opacity: 0.2 + (Math.sin(i * 0.2) * 0.4)
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Content (Always present, blurred when processing) */}
      <div className={`transition-all duration-1000 ${processingStatus !== 'transcript_completed' ? 'blur-[12px] grayscale-[0.5] pointer-events-none' : 'blur-0'}`}>
      {/* Header */}
      <header className="bg-white border-b border-brand-border h-16 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-gray hover:text-brand-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-[1px] bg-brand-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center shadow-sm">
                <Layers className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">EduMind AI</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-gray hover:bg-slate-50 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-gray hover:bg-slate-50 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-10 px-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column: Timestamps Only */}
          <div className="w-full lg:w-[400px] space-y-6 h-[calc(100vh-120px)] sticky top-20 flex flex-col">
            <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-brand-gray">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold">Transcript</h2>
                </div>
                <button 
                  onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                  className={`text-[10px] px-2 py-1 rounded-md font-bold transition-colors ${isAutoScrollEnabled ? 'bg-brand-orange text-white' : 'bg-slate-100 text-brand-gray'}`}
                >
                  {isAutoScrollEnabled ? 'Auto-scroll On' : 'Auto-scroll Off'}
                </button>
              </div>

              <div 
                ref={transcriptContainerRef}
                onScroll={handleScroll}
                className="space-y-3 overflow-y-auto pr-2 scroll-smooth flex-1"
              >
                {transcriptChunks.length > 0 ? (
                  transcriptChunks.map((item, i) => (
                    <div 
                      key={i} 
                      ref={chunkRefs.current[i]}
                      onClick={() => handleChunkClick(item.start_time)}
                      className={`flex gap-3 p-2 rounded-xl transition-all duration-300 cursor-pointer group ${
                        activeChunkIndex === i 
                          ? 'bg-slate-100 shadow-sm ring-1 ring-slate-200' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* YouTube-style Thumbnail */}
                      <div className="relative w-32 h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 shadow-inner group-hover:shadow-lg transition-shadow">
                        {videoUrl ? (
                          <video 
                            src={`${videoUrl}#t=${item.start_time}`} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-slate-600 fill-current" />
                          </div>
                        )}
                        
                        {/* Timestamp Overlay (Matches YouTube Style) */}
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold tracking-tight">
                          {formatTime(item.start_time)}
                        </div>

                        {/* Hover Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 text-white fill-current" />
                          </div>
                        </div>
                      </div>

                      {/* Text Content Area */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <p className={`text-[12px] leading-snug line-clamp-2 transition-colors ${
                          activeChunkIndex === i 
                            ? 'text-brand-dark font-bold' 
                            : 'text-brand-dark/70 font-medium group-hover:text-brand-dark'
                        }`}>
                          {item.text}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                            Lecture • {formatTime(item.start_time)}
                          </span>
                          {activeChunkIndex === i && (
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-brand-orange animate-pulse" />
                              <span className="text-[9px] text-brand-orange font-black uppercase tracking-widest">Now Playing</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <p className="text-xs text-brand-gray font-medium">
                      {processingStatus === 'transcript_completed' 
                        ? 'No transcript found' 
                        : 'Transcript will appear here as soon as processing completes...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Video Player (Top) & Smart Summary (Bottom) */}
          <div className="flex-1 flex flex-col items-center gap-6">
            {/* Video Section */}
            <div className="w-full max-w-[800px] space-y-4">
              <div className="flex items-center gap-2 text-brand-gray text-xs font-medium px-1">
                <Play className="w-3 h-3" />
                {videoData?.file ? videoData.file.name : 'videoplayback.mp4'}
              </div>

              <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm w-full">
                <div className="aspect-video bg-[#0F172A] relative flex items-center justify-center group">
                  {videoUrl ? (
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      onTimeUpdate={handleTimeUpdate}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-white fill-current" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-white">Video Player</p>
                        <p className="text-[9px] opacity-60">videoplayback.mp4</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 flex items-center justify-between border-b border-brand-border">
                  <div>
                    <h1 className="text-lg font-bold mb-0.5">
                      {videoData?.file ? videoData.file.name.split('.')[0] : 'Object-Oriented Programming Lecture'}
                    </h1>
                    <p className="text-[10px] text-brand-gray font-medium">
                      {videoData?.file ? `Size: ${(videoData.file.size / (1024 * 1024)).toFixed(2)} MB` : 'Duration: 35:24'}
                    </p>
                  </div>
                  <button className="bg-brand-blue text-white px-4 py-2 rounded-lg text-[11px] font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Summary Section */}
            <div className="w-full max-w-[800px]">
              <div className="bg-white rounded-2xl border border-brand-border p-8 shadow-sm relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full blur-2xl opacity-50 group-hover:bg-orange-100 transition-colors" />
                
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100/50">
                      <FileText className="text-brand-orange w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-brand-dark tracking-tight">Smart Summary</h2>
                      <p className="text-[10px] text-brand-gray font-bold uppercase tracking-[0.15em]">AI-Generated Insights</p>
                    </div>
                  </div>
                  {summaryPoints && summaryPoints.length > 0 && (
                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1.5 border border-green-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Analysis Ready</span>
                    </div>
                  )}
                </div>

                {/* Content: Clean Minimalist Layout */}
                <div className="flex flex-col gap-3 relative">
                  {summaryPoints && summaryPoints.length > 0 ? (
                    summaryPoints.map((point, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-4 group/item py-0.5"
                      >
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_8px_rgba(255,138,0,0.4)] group-hover/item:scale-150 transition-all duration-300 flex-shrink-0" />
                        <p className="text-[14px] leading-relaxed text-brand-dark/90 font-semibold tracking-tight border-b border-slate-50 w-full pb-2 group-hover/item:text-brand-dark group-hover/item:border-orange-100 transition-all">
                          {point}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-16 flex flex-col items-center gap-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-brand-orange animate-spin" />
                      <div className="text-center">
                        <p className="text-sm font-bold text-brand-dark">Extracting Knowledge...</p>
                        <p className="text-[10px] text-brand-gray font-medium">Our AI is distilling the lecture into key points</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Assistant */}
          <div className="w-full lg:w-[380px] flex flex-col h-[calc(100vh-160px)] sticky top-24">
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm flex flex-col h-full overflow-hidden">
              {/* AI Header */}
              <div className="p-5 border-b border-brand-border flex items-center gap-4 bg-white sticky top-0 z-10">
                <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-md shadow-orange-900/10">
                  <Layers className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-dark">AI Assistant</h3>
                  <p className="text-[10px] text-brand-gray font-medium uppercase tracking-widest opacity-60">Neural Engine v2</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-slate-50/30">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                      msg.role === 'assistant' ? 'bg-brand-orange' : 'bg-white border border-brand-border'
                    }`}>
                      {msg.role === 'assistant' ? <Layers className="text-white w-4 h-4" /> : <MessageSquare className="text-brand-gray w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] space-y-3 ${
                      msg.role === 'assistant' 
                        ? 'bg-white rounded-tl-none border border-orange-100/50 text-brand-dark' 
                        : 'bg-brand-orange text-white rounded-tr-none shadow-orange-200'
                    }`}>
                      <p className={`text-xs leading-relaxed font-medium whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-brand-dark'}`}>
                        {msg.content}
                      </p>
                      
                      {/* Dynamic Jump to Timestamp Buttons */}
                      {msg.role === 'assistant' && parseTimestamp(msg.content).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {parseTimestamp(msg.content).map((ts, tsIdx) => (
                            <button 
                              key={tsIdx}
                              onClick={() => handleChunkClick(convertToSeconds(ts))}
                              className="bg-slate-50 border border-brand-border px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:border-brand-orange hover:text-brand-orange transition-all group"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              Jump to {ts.replace(/[\[\]]/g, '')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 items-start animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Layers className="text-brand-orange/40 w-4 h-4" />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-orange-100/20 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-brand-border sticky bottom-0">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a question..." 
                    disabled={isTyping}
                    className="w-full bg-slate-50 border border-brand-border rounded-xl py-4 pl-4 pr-12 text-xs outline-none focus:border-brand-orange focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all disabled:opacity-50 font-medium"
                  />
                  <button 
                    type="submit"
                    disabled={isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-lg flex items-center justify-center hover:bg-brand-dark transition-all active:scale-90 disabled:opacity-50 shadow-lg shadow-blue-500/10"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
           </div>
         </div>
       </main>
      </div>
    </div>
  );
};

export default AnalysisPage;
