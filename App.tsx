
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Leaf, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  Cpu,
  Globe,
  Euro,
  FileText,
  Sparkles,
  RefreshCcw,
  ArrowRight,
  BarChart3,
  Download,
  Save,
  Clock,
  ExternalLink,
  Home,
  BookOpen,
  Settings,
  User as UserIcon,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
  TrendingDown,
  ChevronDown,
  Loader2,
  Server,
  PieChart as PieIcon,
  MapPin,
  Share2,
  Edit3,
  X,
  Check,
  Calculator,
  UserPlus,
  Lock,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { Maison, ProjectType, LCAData, Score, Step, ProjectState, SavedProject, User } from './types';
import { 
  HARDWARE_OPTIONS, 
  REGION_OPTIONS, 
  ENERGY_COST_PER_KWH, 
  SCORE_COLORS, 
  LCA_COLORS 
} from './constants';
import { GoogleGenAI, Type } from "@google/genai";

// --- Custom Components ---

const LuxuryButton = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const base = "px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  const styles: any = {
    primary: "bg-[#1A1A1A] text-white hover:bg-[#B08D55] shadow-black/10",
    secondary: "bg-white text-[#1A1A1A] border border-gray-100 hover:border-[#B08D55] shadow-sm",
    outline: "border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
    gold: "bg-[#B08D55] text-white hover:bg-[#2E5936] shadow-gold/20",
    danger: "bg-white text-[#D32F2F] border border-[#D32F2F] hover:bg-[#D32F2F] hover:text-white"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

// --- Initial Mock Data ---
const DEFAULT_USER: User = { 
  name: 'Alexander Dior', 
  role: 'GreenOps Lead', 
  maison: Maison.DIOR,
  email: 'alexander.d@dior.com',
  bio: 'Leading sustainability initiatives for AI infrastructure at Maison Dior.',
  password: 'password'
};

const INITIAL_SAVED_PROJECTS: SavedProject[] = [
  {
    id: '1',
    name: 'Neural Inventory Optimization',
    date: '2024-10-12',
    maison: Maison.DIOR,
    originalScore: 'D',
    finalScore: 'B',
    originalCo2: 4500,
    finalCo2: 850,
    savings: 1200,
    state: {
       hardware: 'NVIDIA A100', numGpus: 4, trainingHours: 100, trainingRegion: 'China (Coal)', inferenceRegion: 'China (Coal)', requestsPerMonth: 50000, avgLatency: 1.0, projectYears: 2,
       recommendations: ['Switch to France for Nuclear Energy', 'Use INT8 Quantization'],
       auditLog: ['High carbon intensity in training region', 'Hardware utilization is suboptimal']
    },
    lca: {
      training: { co2: 200, energy: 500 },
      inference: { co2: 500, energy: 1000 },
      embodied: { co2: 150 },
      totalCo2: 850,
      totalCost: 1200,
      score: 'B'
    }
  },
];

// --- Separated Login View Component (Fixes Focus Issue & Dark Mode) ---
interface LoginViewProps {
  onLogin: (u: string, p: string) => void;
  onRegister: (u: User) => void;
  authMode: 'login' | 'register';
  setAuthMode: (m: 'login' | 'register') => void;
  error: string | null;
  darkMode: boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, authMode, setAuthMode, error, darkMode }) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    maison: Maison.DIOR
  });

  // Dynamic Theme for Login
  const theme = useMemo(() => ({
    bg: darkMode ? 'bg-[#050505]' : 'bg-white',
    card: darkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-gray-100',
    text: darkMode ? 'text-white' : 'text-[#1A1A1A]',
    textDim: darkMode ? 'text-gray-400' : 'text-gray-400',
    input: darkMode ? 'bg-transparent border-white/20 text-white focus:border-[#B08D55] placeholder:text-gray-600' : 'bg-white border-gray-200 text-[#1A1A1A] focus:border-[#B08D55] placeholder:text-gray-300'
  }), [darkMode]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginForm.username, loginForm.password);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.password) return;
    
    const newUser: User = {
      name: regForm.name,
      role: regForm.role || 'GreenOps Analyst',
      maison: regForm.maison,
      email: regForm.email || `${regForm.name.toLowerCase().replace(' ', '.')}@lvmh.com`,
      bio: 'New profile active.',
      password: regForm.password
    };
    onRegister(newUser);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center selection:bg-[#B08D55] selection:text-white transition-colors duration-500 ${theme.bg}`}>
      <div className={`w-full max-w-md p-12 border shadow-2xl space-y-12 text-center animate-in fade-in zoom-in-95 duration-1000 relative ${theme.card}`}>
        <div className="w-16 h-16 bg-[#2E5936] rounded-sm flex items-center justify-center mx-auto shadow-xl">
          <Leaf className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className={`font-serif text-4xl mb-2 tracking-tight ${theme.text}`}>EcoScan</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold">LVMH Enterprise Auth</p>
        </div>

        {error && (
          <div className="bg-red-50 text-[#D32F2F] p-4 text-xs font-bold flex items-center justify-center gap-2 animate-in shake">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-6 text-left animate-in slide-in-from-left-4 duration-300">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Username</label>
              <input 
                type="text" 
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className={`w-full border-b py-2 outline-none transition-colors ${theme.input}`}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Secure Key</label>
              <input 
                type="password" 
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className={`w-full border-b py-2 outline-none transition-colors ${theme.input}`}
                placeholder="••••••••"
              />
            </div>
            <LuxuryButton type="submit" className="w-full mt-6">Enter GreenOps Console</LuxuryButton>
            
            <div className="pt-4 text-center">
              <button 
                type="button" 
                onClick={() => { setAuthMode('register'); setLoginForm({username:'', password:''}); }}
                className="text-[9px] uppercase tracking-widest font-bold text-[#B08D55] hover:text-[#2E5936] transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <UserPlus className="w-3 h-3" /> Create New Profile
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-6 text-left animate-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Full Name</label>
                <input 
                  type="text" 
                  value={regForm.name}
                  onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                  className={`w-full border-b py-2 outline-none transition-colors ${theme.input}`}
                  placeholder="e.g. Marie Arnault"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Role</label>
                <input 
                  type="text" 
                  value={regForm.role}
                  onChange={(e) => setRegForm({...regForm, role: e.target.value})}
                  className={`w-full border-b py-2 outline-none transition-colors ${theme.input}`}
                  placeholder="e.g. Data Scientist"
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Maison</label>
               <select 
                  value={regForm.maison}
                  onChange={(e) => setRegForm({...regForm, maison: e.target.value as Maison})}
                  className={`w-full border-b py-2 outline-none ${theme.input}`}
                  style={{ backgroundColor: darkMode ? '#141414' : 'white' }}
               >
                 {Object.values(Maison).map(m => <option key={m} value={m}>{m}</option>)}
               </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Email (Optional)</label>
              <input 
                type="email" 
                value={regForm.email}
                onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                className={`w-full border-b py-2 outline-none transition-colors ${theme.input}`}
                placeholder="marie.a@lvmh.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Password
              </label>
              <input 
                type="password" 
                value={regForm.password}
                onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                className={`w-full border-b py-2 outline-none transition-colors ${theme.input}`}
                required
              />
            </div>

            <LuxuryButton type="submit" variant="gold" className="w-full mt-6">Initialize Profile</LuxuryButton>
            
            <div className="pt-4 text-center">
              <button 
                type="button" 
                onClick={() => { setAuthMode('login'); setRegForm({name:'', email:'', password:'', role:'', maison: Maison.DIOR}); }}
                className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors"
              >
                ← Return to Login
              </button>
            </div>
          </form>
        )}

        <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Strictly Internal - Dior GreenOps V3.0</p>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // --- Persistent Global State ---
  
  // User Management Logic
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('ecoScan_users_db');
      return savedUsers ? JSON.parse(savedUsers) : [DEFAULT_USER];
    } catch (e) { return [DEFAULT_USER]; }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('ecoScan_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const saved = localStorage.getItem('ecoScan_projects');
      return saved ? JSON.parse(saved) : INITIAL_SAVED_PROJECTS;
    } catch (e) { return INITIAL_SAVED_PROJECTS; }
  });

  const [step, setStep] = useState<Step>(() => {
     return user ? 'home' : 'login';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
     try {
         return localStorage.getItem('ecoScan_darkMode') === 'true';
     } catch { return false; }
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  
  // --- View State ---
  const [selectedProject, setSelectedProject] = useState<SavedProject | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // --- Active Assessment State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("Quantifying Environmental Debt...");
  const [originalState, setOriginalState] = useState<ProjectState | null>(null);
  const [currentState, setCurrentState] = useState<ProjectState>({
    hardware: HARDWARE_OPTIONS[0].model,
    numGpus: 8,
    trainingHours: 240,
    trainingRegion: REGION_OPTIONS[1].name,
    inferenceRegion: REGION_OPTIONS[3].name,
    requestsPerMonth: 100000,
    avgLatency: 2.5,
    projectYears: 2,
    recommendations: [],
    auditLog: []
  });

  // --- Theme Configuration ---
  const theme = useMemo(() => ({
    bg: darkMode ? 'bg-[#050505]' : 'bg-[#FAFAFA]',
    text: darkMode ? 'text-white' : 'text-[#1A1A1A]',
    textSecondary: 'text-gray-400',
    card: darkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-gray-50',
    cardHover: darkMode ? 'hover:border-[#B08D55]' : 'hover:border-[#B08D55]',
    border: darkMode ? 'border-white/5' : 'border-gray-100',
    sidebar: darkMode ? 'bg-[#141414] border-white/5' : 'bg-white border-gray-100',
    input: darkMode ? 'bg-transparent border-white/20 text-white focus:border-[#B08D55]' : 'bg-transparent border-gray-200 text-[#1A1A1A] focus:border-[#B08D55]'
  }), [darkMode]);

  // --- Effects for Persistence ---
  useEffect(() => {
    if (user) {
      localStorage.setItem('ecoScan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecoScan_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ecoScan_users_db', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ecoScan_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  useEffect(() => {
    localStorage.setItem('ecoScan_darkMode', String(darkMode));
  }, [darkMode]);

  // --- Calculations ---
  const calculateMetrics = useCallback((state: ProjectState): LCAData => {
    const hw = HARDWARE_OPTIONS.find(h => h.model === state.hardware) || HARDWARE_OPTIONS[0];
    const trRegion = REGION_OPTIONS.find(r => r.name === state.trainingRegion) || REGION_OPTIONS[1];
    const infRegion = REGION_OPTIONS.find(r => r.name === state.inferenceRegion) || REGION_OPTIONS[3];

    const trainingEnergy = (state.numGpus * hw.watts * state.trainingHours) / 1000;
    const trainingCo2 = trainingEnergy * trRegion.factor;

    const inferenceEnergy = (state.requestsPerMonth * state.avgLatency * hw.watts / 3600 / 1000) * 12;
    const inferenceCo2 = inferenceEnergy * infRegion.factor;

    const embodiedCo2 = state.numGpus * hw.embodied * (state.projectYears / 4.0);

    const totalCo2 = trainingCo2 + (inferenceCo2 * state.projectYears) + embodiedCo2;
    const totalCost = (trainingEnergy + (inferenceEnergy * state.projectYears)) * ENERGY_COST_PER_KWH;

    let score: Score = 'A';
    if (totalCo2 > 10000) score = 'E';
    else if (totalCo2 > 5000) score = 'D';
    else if (totalCo2 > 2000) score = 'C';
    else if (totalCo2 > 500) score = 'B';

    return {
      training: { co2: trainingCo2, energy: trainingEnergy },
      inference: { co2: inferenceCo2, energy: inferenceEnergy },
      embodied: { co2: embodiedCo2 },
      totalCo2,
      totalCost,
      score
    };
  }, []);

  const currentLCA = useMemo(() => calculateMetrics(currentState), [currentState, calculateMetrics]);
  const originalLCA = useMemo(() => originalState ? calculateMetrics(originalState) : null, [originalState, calculateMetrics]);

  // --- Actions ---

  const handleLogin = (username: string, password?: string) => {
    setLoginError(null);
    if (!username) {
      setLoginError("Please enter a username.");
      return;
    }

    const foundUser = users.find(u => u.name.toLowerCase() === username.toLowerCase());

    if (!foundUser) {
      setLoginError("User not found.");
      return;
    }

    if (foundUser.password && foundUser.password !== password) {
      setLoginError("Incorrect password.");
      return;
    }

    setUser(foundUser);
    setStep('home');
  };

  const handleRegister = (newUser: User) => {
    setLoginError(null);
    if (users.some(u => u.name.toLowerCase() === newUser.name.toLowerCase())) {
      setLoginError("User already exists. Please login.");
      return;
    }
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    setStep('home');
  };

  const handleLogout = () => {
    setUser(null);
    setStep('login');
    setAuthMode('login'); 
    setLoginError(null);
  };

  const handleStartNewProject = () => {
    setOriginalState(null);
    setSelectedProject(null);
    setCurrentState({
      hardware: HARDWARE_OPTIONS[0].model,
      numGpus: 8,
      trainingHours: 240,
      trainingRegion: REGION_OPTIONS[1].name,
      inferenceRegion: REGION_OPTIONS[3].name,
      requestsPerMonth: 100000,
      avgLatency: 2.5,
      projectYears: 2,
      recommendations: [],
      auditLog: []
    });
    setStep('assessment');
  };

  const openProject = (project: SavedProject) => {
    if (editingProjectId) return;
    setSelectedProject(project);
    setOriginalState(project.state); 
    setCurrentState(project.state);
    setStep('report');
  };

  // --- Renaming Logic ---
  const startEditing = (e: React.MouseEvent, project: SavedProject) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setTempName(project.name);
  };

  const saveName = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingProjectId) {
      setSavedProjects(prev => prev.map(p => 
        p.id === editingProjectId ? { ...p, name: tempName } : p
      ));
      setEditingProjectId(null);
    }
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(null);
  };

  const runScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(10);
    setAnalysisStatus("Initializing Secure LVMH Node...");

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || "");
        reader.onerror = reject;
        reader.readAsText(file);
      });

      setProgress(40);
      setAnalysisStatus("AI Extracting Infrastructure Topology...");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the following project charter. Extract technical parameters and provide a qualitative sustainability audit.
        Text: ${text.substring(0, 15000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hardware: { 
                type: Type.STRING, 
                description: "GPU model. Map to closest: NVIDIA A100, NVIDIA V100, NVIDIA T4." 
              },
              numGpus: { type: Type.INTEGER },
              trainingHours: { type: Type.INTEGER },
              trainingRegion: { type: Type.STRING, description: "Map to: France (Nuclear), USA (Virginia/Coal), China (Coal), Global Avg." },
              inferenceRegion: { type: Type.STRING, description: "Map to: France (Nuclear), USA (Virginia/Coal), China (Coal), Global Avg." },
              requestsPerMonth: { type: Type.INTEGER },
              avgLatency: { type: Type.NUMBER },
              projectYears: { type: Type.INTEGER },
              auditLog: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 3 short reasons describing why the carbon score is high or low."
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 3 specific technical recommendations to improve sustainability."
              }
            },
            required: ["hardware", "numGpus", "trainingHours", "trainingRegion", "inferenceRegion", "requestsPerMonth", "avgLatency", "projectYears", "auditLog", "recommendations"]
          }
        }
      });

      setProgress(85);
      setAnalysisStatus("Generating Strategic Recommendations...");

      const extractedData = JSON.parse(response.text || "{}") as ProjectState;
      
      const validatedData: ProjectState = {
        ...extractedData,
        hardware: HARDWARE_OPTIONS.some(h => h.model === extractedData.hardware) ? extractedData.hardware : HARDWARE_OPTIONS[0].model,
        trainingRegion: REGION_OPTIONS.some(r => r.name === extractedData.trainingRegion) ? extractedData.trainingRegion : REGION_OPTIONS[1].name,
        inferenceRegion: REGION_OPTIONS.some(r => r.name === extractedData.inferenceRegion) ? extractedData.inferenceRegion : REGION_OPTIONS[3].name,
      };

      setOriginalState(validatedData);
      setCurrentState(validatedData);
      setProgress(100);
      setAnalysisStatus("Analysis Complete.");
      
      setTimeout(() => setIsAnalyzing(false), 500);

    } catch (error) {
      console.error("AI Analysis Failed:", error);
      setAnalysisStatus("Error: Using Baseline Defaults.");
      const baseline: ProjectState = {
        hardware: 'NVIDIA A100', numGpus: 16, trainingRegion: 'USA (Virginia/Coal)', trainingHours: 1200, inferenceRegion: 'China (Coal)', requestsPerMonth: 650000, avgLatency: 3.2, projectYears: 3,
        auditLog: ['Unable to parse file specifics', 'Defaulting to high-risk profile'],
        recommendations: ['Check file format', 'Manually adjust parameters']
      };
      setOriginalState(baseline);
      setCurrentState(baseline);
      setProgress(100);
      setTimeout(() => setIsAnalyzing(false), 1000);
    }
  };

  const saveToLibrary = () => {
    if (!originalLCA) return;
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: `Scan_${new Date().toLocaleDateString()}_${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      maison: user?.maison || Maison.DIOR,
      originalScore: originalLCA.score,
      finalScore: currentLCA.score,
      originalCo2: originalLCA.totalCo2,
      finalCo2: currentLCA.totalCo2,
      savings: originalLCA.totalCost - currentLCA.totalCost,
      state: currentState,
      lca: currentLCA
    };
    setSavedProjects([newProject, ...savedProjects]);
    setStep('library');
  };

  const downloadReport = () => {
    const reportData = {
      project: currentState,
      metrics: currentLCA,
      generated: new Date().toISOString(),
      user: user?.name
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LVMH_EcoScan_Report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Calculation Modal Component ---
  const CalculationModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative ${theme.card}`}>
        <button 
          onClick={() => setShowCalcModal(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-[#B08D55] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="bg-[#1A1A1A] p-8 text-white">
          <h3 className="font-serif text-3xl flex items-center gap-4">
            <Calculator className="w-8 h-8 text-[#B08D55]" />
            Methodology
          </h3>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mt-2">LVMH Global GreenOps Standard</p>
        </div>
        
        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#2E5936]">1. Training Emissions (Scope 2)</h4>
            <div className={`p-4 border font-mono text-xs ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
              (Num GPUs × Watts × Hours / 1000) × Grid IntensityFactor
            </div>
            <p className="text-xs text-gray-400 font-light">
              Measures the electricity consumed during the model training phase, multiplied by the carbon intensity of the selected region's power grid.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#B08D55]">2. Inference Emissions (Scope 2)</h4>
            <div className={`p-4 border font-mono text-xs ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
              (Requests/Mo × Latency × Watts / 3.6e6) × 12 × Years × Grid Factor
            </div>
            <p className="text-xs text-gray-400 font-light">
              Projects the energy usage for serving predictions over the project's lifecycle. Highly sensitive to model latency and traffic volume.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-gray-500">3. Embodied Carbon (Scope 3)</h4>
            <div className={`p-4 border font-mono text-xs ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
              Num GPUs × EmbodiedCarbonPerUnit × (Years / 4.0)
            </div>
            <p className="text-xs text-gray-400 font-light">
              Accounts for the manufacturing footprint of the hardware, amortized over the standard 4-year server lifecycle.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100/10">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-white">4. Strategic Metrics</h4>
            <div className={`p-4 border font-mono text-xs space-y-2 ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
               <div>
                 <strong>Carbon Offset (%)</strong> = ((Baseline CO2 - Optimized CO2) / Baseline CO2) × 100
               </div>
               <div>
                 <strong>Cost Savings (€)</strong> = Baseline Energy Cost - Optimized Energy Cost (Total Lifetime)
               </div>
            </div>
            <p className="text-xs text-gray-400 font-light">
              Calculates the relative improvement and absolute monetary gain over the full project lifespan.
            </p>
          </div>
        </div>

        <div className={`p-6 border-t flex justify-end ${darkMode ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
          <LuxuryButton variant="primary" onClick={() => setShowCalcModal(false)}>Close Reference</LuxuryButton>
        </div>
      </div>
    </div>
  );

  // --- Sub-Views ---

  const HomeView = () => {
    // Calculate total impact for dashboard
    const totalProjects = savedProjects.length;
    const totalSavingsCo2 = savedProjects.reduce((acc, p) => acc + (p.originalCo2 - p.finalCo2), 0);
    const totalSavingsEuro = savedProjects.reduce((acc, p) => acc + p.savings, 0);

    // Mock data for the "Amelioration" chart
    const impactData = savedProjects.map((p, i) => ({
      name: p.date,
      Legacy: p.originalCo2,
      Optimized: p.finalCo2,
    })).reverse();

    return (
      <div className="space-y-16 animate-in fade-in duration-700">
        <header className="flex justify-between items-end">
          <div>
            <h2 className={`font-serif text-6xl mb-4 ${theme.text}`}>Maison Dashboard</h2>
            <div className="flex items-center gap-6 mt-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#B08D55] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                     {user?.name.charAt(0)}
                  </div>
                  <span className={`text-sm font-serif italic ${theme.text}`}>{user?.name}</span>
               </div>
               <div className="h-4 w-[1px] bg-gray-200"></div>
               <button onClick={() => setStep('profile')} className="text-[10px] uppercase font-bold text-gray-400 hover:text-[#B08D55] transition-colors">Configure Profile</button>
               <button onClick={handleLogout} className="text-[10px] uppercase font-bold text-gray-400 hover:text-[#D32F2F] transition-colors">Disconnect</button>
            </div>
          </div>
          <div className={`text-right ${theme.text}`}>
             <h3 className="text-4xl font-serif">{totalProjects}</h3>
             <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Active Projects</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-[#1A1A1A] text-white p-12 shadow-2xl relative overflow-hidden group col-span-1 md:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2E5936]/40 to-transparent"></div>
            <LayoutDashboard className="w-10 h-10 text-[#B08D55] mb-8 relative z-10" />
            <h4 className="font-serif text-3xl mb-4 relative z-10">Start Assessment</h4>
            <p className="text-xs text-gray-400 font-light mb-10 relative z-10 leading-relaxed">Launch a new Lifecycle Scan for upcoming AI/Infrastructure projects.</p>
            <LuxuryButton onClick={handleStartNewProject} variant="gold" className="relative z-10 w-full">New Scan</LuxuryButton>
          </div>

          <div className={`p-12 col-span-1 md:col-span-2 shadow-sm border ${theme.card}`}>
             <div className="flex justify-between items-center mb-8">
               <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Macro Environmental Delta</span>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-300 rounded-full"></div><span className="text-[8px] uppercase font-bold text-gray-400">Legacy</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#2E5936] rounded-full"></div><span className="text-[8px] uppercase font-bold text-gray-400">Optimized</span></div>
               </div>
             </div>
             <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={impactData}>
                   <defs>
                     <linearGradient id="colorLegacy" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#cccccc" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#cccccc" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#2E5936" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#2E5936" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Tooltip contentStyle={{borderRadius: '0', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', backgroundColor: darkMode ? '#1A1A1A' : '#fff'}} />
                   <Area type="monotone" dataKey="Legacy" stroke="#cccccc" fillOpacity={1} fill="url(#colorLegacy)" strokeWidth={2} />
                   <Area type="monotone" dataKey="Optimized" stroke="#2E5936" fillOpacity={1} fill="url(#colorOpt)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className={`p-12 flex flex-col justify-between border shadow-sm ${theme.card}`}>
            <div className="flex justify-between items-start">
               <TrendingDown className="w-8 h-8 text-[#2E5936]" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Net CO2 Avoided</span>
            </div>
            <div>
              <span className={`text-5xl font-serif italic ${theme.text}`}>-{Math.round(totalSavingsCo2).toLocaleString()}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">kgCO2e Total</p>
            </div>
          </div>

          <div className={`p-12 flex flex-col justify-between border shadow-sm ${theme.card}`}>
            <div className="flex justify-between items-start text-[#B08D55]">
               <Euro className="w-8 h-8" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">OpEx Efficiency</span>
            </div>
            <div>
              <span className={`text-5xl font-serif italic ${theme.text}`}>€{Math.round(totalSavingsEuro).toLocaleString()}</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">Projected Lifetime Savings</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LibraryView = () => (
    <div className="animate-in fade-in slide-in-from-left-8 duration-700">
      <header className={`mb-16 flex justify-between items-end border-b pb-12 ${theme.border}`}>
        <div>
          <h2 className={`font-serif text-5xl mb-4 ${theme.text}`}>Project Library</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Access Historical Assessments</p>
        </div>
        <div className="flex gap-4">
          <LuxuryButton variant="secondary" onClick={() => {
             // Mock Download all
             alert("Downloading Full Maison Portfolio CSV...");
          }}>Download All</LuxuryButton>
          <LuxuryButton variant="primary" onClick={handleStartNewProject}>New Assessment</LuxuryButton>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {savedProjects.map(p => (
          <div 
            key={p.id} 
            onClick={() => openProject(p)}
            className={`border p-10 flex items-center gap-12 transition-all group cursor-pointer ${theme.card} ${theme.cardHover} hover:shadow-2xl`}
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                 <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#B08D55]">{p.maison}</span>
                 <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                 <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-300">{p.date}</span>
              </div>
              
              {/* Inline Renaming Logic */}
              <div className="flex items-center gap-4 h-12">
                {editingProjectId === p.id ? (
                  <div className="flex items-center gap-2 w-full max-w-md animate-in fade-in">
                    <input 
                      type="text" 
                      value={tempName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setTempName(e.target.value)}
                      className={`flex-1 font-serif text-3xl border-b border-[#B08D55] outline-none bg-transparent ${theme.text}`}
                      autoFocus
                    />
                    <button 
                      onClick={saveName}
                      className="p-2 bg-[#2E5936] text-white rounded-full hover:bg-[#1e3a23] transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={cancelEditing}
                      className="p-2 bg-gray-200 text-gray-500 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 group/title">
                    <h4 className={`font-serif text-3xl group-hover:text-[#B08D55] transition-colors truncate max-w-2xl ${theme.text}`}>{p.name}</h4>
                    <button 
                      onClick={(e) => startEditing(e, p)}
                      className="opacity-0 group-hover/title:opacity-100 text-gray-300 hover:text-[#B08D55] transition-all p-2"
                      title="Rename Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-8 pt-4">
                 <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${p.finalScore === 'A' || p.finalScore === 'B' ? 'bg-[#2E5936]' : 'bg-[#D32F2F]'}`}></span>
                   <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                     {p.finalScore === 'A' || p.finalScore === 'B' ? 'Compliant' : 'Optimization Needed'}
                   </span>
                 </div>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <span className="text-[8px] uppercase tracking-widest text-gray-300 font-bold mb-2">Score</span>
                 <div className={`${SCORE_COLORS[p.finalScore]} w-14 h-14 flex items-center justify-center text-xl font-serif italic font-bold shadow-xl`}>{p.finalScore}</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-2xl mx-auto">
      <header className={`mb-16 border-b pb-12 ${theme.border}`}>
        <h2 className={`font-serif text-5xl mb-4 ${theme.text}`}>User Profile</h2>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Manage Identity & Access</p>
      </header>

      <div className={`p-12 shadow-xl border space-y-10 ${theme.card}`}>
         <div className={`flex items-center gap-8 border-b pb-10 ${theme.border}`}>
            <div className="w-24 h-24 bg-[#B08D55] text-white flex items-center justify-center text-3xl font-serif font-bold rounded-full">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className={`font-serif text-2xl ${theme.text}`}>{user?.name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{user?.role} • {user?.maison}</p>
            </div>
            <LuxuryButton variant="outline" className="ml-auto" onClick={() => alert("Photo upload disabled in prototype.")}>Change Photo</LuxuryButton>
         </div>

         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Display Name</label>
                  <input type="text" value={user?.name} onChange={(e) => setUser(u => u ? {...u, name: e.target.value} : null)} className={theme.input} />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Email Address</label>
                  <input type="email" value={user?.email} readOnly className={`${theme.input} opacity-50 cursor-not-allowed`} />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] uppercase tracking-widest font-bold text-gray-400">GreenOps Bio</label>
               <textarea value={user?.bio} onChange={(e) => setUser(u => u ? {...u, bio: e.target.value} : null)} className={`${theme.input} min-h-[100px]`} />
            </div>
         </div>

         <div className="pt-8 flex justify-end gap-4">
            <LuxuryButton variant="secondary" onClick={() => setStep('home')}>Cancel</LuxuryButton>
            <LuxuryButton variant="primary" onClick={() => { alert("Profile Updated Successfully"); setStep('home'); }}>Save Changes</LuxuryButton>
         </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-2xl mx-auto">
      <header className={`mb-16 border-b pb-12 ${theme.border}`}>
        <h2 className={`font-serif text-5xl mb-4 ${theme.text}`}>System Settings</h2>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Configure Analysis Parameters</p>
      </header>

      <div className={`p-12 shadow-xl border space-y-12 ${theme.card}`}>
         <div className="flex items-center justify-between">
            <div>
               <h4 className={`font-serif text-xl mb-2 ${theme.text}`}>High-Precision Mode</h4>
               <p className="text-xs text-gray-400 max-w-sm">Enable deeper recursive scanning of project files. Increases analysis time by ~15s.</p>
            </div>
            <div className="w-12 h-6 bg-[#2E5936] rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div></div>
         </div>
         
         <div className="flex items-center justify-between" onClick={() => setDarkMode(!darkMode)}>
            <div>
               <h4 className={`font-serif text-xl mb-2 ${theme.text}`}>Dark Mode Interface</h4>
               <p className="text-xs text-gray-400 max-w-sm">Switch to high-contrast dark theme for low-light environments.</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${darkMode ? 'bg-[#B08D55]' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
            </div>
         </div>

         <div className={`pt-8 border-t ${theme.border}`}>
           <h4 className="font-serif text-xl mb-6 text-[#D32F2F]">Danger Zone</h4>
           <LuxuryButton variant="danger" onClick={() => { setSavedProjects([]); alert("Database Cleared."); }}>Clear Local Project Cache</LuxuryButton>
         </div>
      </div>
    </div>
  );

  const ReportView = () => {
    // Pie Chart Data
    const pieData = [
      { name: 'Training', value: currentLCA.training.co2, color: LCA_COLORS.training },
      { name: 'Inference', value: currentLCA.inference.co2, color: LCA_COLORS.inference },
      { name: 'Embodied', value: currentLCA.embodied.co2, color: LCA_COLORS.embodied },
    ];

    // Location Comparison Data
    const locationData = [
      { name: currentState.trainingRegion, co2: REGION_OPTIONS.find(r => r.name === currentState.trainingRegion)?.factor || 0 },
      { name: 'France (Nuclear) [Optimal]', co2: 0.057 },
      { name: 'Global Avg', co2: 0.475 },
    ];

    return (
      <div className="animate-in fade-in zoom-in-95 duration-700">
        <header className={`mb-12 border-b pb-12 flex justify-between items-end ${theme.border}`}>
          <div>
            <h2 className={`font-serif text-6xl mb-4 ${theme.text}`}>{selectedProject ? selectedProject.name : 'Strategic Summary'}</h2>
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Lifecycle Assessment & AI Audit</p>
              <button 
                onClick={() => setShowCalcModal(true)} 
                className="text-[9px] uppercase tracking-widest font-bold text-[#B08D55] hover:text-[#2E5936] underline transition-colors cursor-pointer"
              >
                Want to learn how we calculate?
              </button>
            </div>
          </div>
          <div className="flex gap-4">
             {!selectedProject && (
               <LuxuryButton variant="secondary" onClick={() => setStep('optimization')}>Back to Lab</LuxuryButton>
             )}
             {selectedProject && (
               <LuxuryButton variant="secondary" onClick={() => setStep('library')}>Back to Library</LuxuryButton>
             )}
          </div>
        </header>

        {/* Top Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div className="bg-[#1A1A1A] text-white p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10"><PieIcon className="w-24 h-24" /></div>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4 z-10">Total Carbon Impact</span>
              <span className="text-5xl font-serif text-white z-10">{Math.round(currentLCA.totalCo2).toLocaleString()} <span className="text-lg">kg</span></span>
              <div className="w-full bg-white/10 h-1 mt-6 rounded-full overflow-hidden">
                <div className={`h-full ${SCORE_COLORS[currentLCA.score].split(' ')[0]} w-[${currentLCA.score === 'A' ? '20%' : '80%'}]`}></div>
              </div>
           </div>

           <div className={`p-10 flex flex-col justify-between border shadow-sm ${theme.card}`}>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">Energy Efficiency</span>
              <span className={`text-5xl font-serif ${theme.text}`}>€{Math.round(currentLCA.totalCost).toLocaleString()}</span>
              <span className="text-[9px] uppercase tracking-widest text-gray-300 font-bold mt-2">Lifetime OpEx</span>
           </div>

           <div className={`p-10 flex items-center justify-between border shadow-sm ${theme.card}`}>
             <div>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2 block">EcoScan Grade</span>
                <span className={`text-6xl font-serif font-bold italic ${SCORE_COLORS[currentLCA.score].split(' ')[1].replace('white', 'black')}`}>{currentLCA.score}</span>
             </div>
             <div className={`${SCORE_COLORS[currentLCA.score]} w-20 h-20 rounded-full flex items-center justify-center shadow-xl`}>
                <Leaf className="w-8 h-8 text-white" />
             </div>
           </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
           {/* Pie Chart Breakdown */}
           <div className={`p-10 lg:col-span-1 border shadow-sm ${theme.card}`}>
             <h4 className={`font-serif text-2xl mb-8 ${theme.text}`}>Emission Sources</h4>
             <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CO2e</span>
               </div>
             </div>
             <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
               Breakdown showing that <strong>{currentLCA.training.co2 > currentLCA.inference.co2 ? 'Training' : 'Inference'}</strong> is the dominant factor.
             </p>
           </div>

           {/* AI Audit & Recommendations */}
           <div className={`p-10 lg:col-span-2 border shadow-sm flex flex-col ${theme.card}`}>
             <div className="flex justify-between items-center mb-8">
               <h4 className={`font-serif text-2xl ${theme.text}`}>AI Environmental Audit</h4>
               <span className="bg-[#B08D55]/10 text-[#B08D55] text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm">Gemini Powered</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
               <div className="space-y-6">
                 <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2"><ShieldAlert className="w-3 h-3" /> Impact Analysis</h5>
                 <ul className="space-y-4">
                   {currentState.auditLog && currentState.auditLog.length > 0 ? (
                     currentState.auditLog.map((log, i) => (
                       <li key={i} className="flex gap-4 text-sm font-light text-gray-600">
                         <span className="text-[#D32F2F] font-bold">•</span> <span className={theme.textSecondary}>{log}</span>
                       </li>
                     ))
                   ) : (
                     <li className="text-sm text-gray-400 italic">No specific audit logs generated.</li>
                   )}
                 </ul>
               </div>

               <div className="space-y-6">
                 <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Strategic Recommendations</h5>
                 <ul className="space-y-4">
                    {currentState.recommendations && currentState.recommendations.length > 0 ? (
                      currentState.recommendations.map((rec, i) => (
                        <li key={i} className={`p-4 border-l-2 border-[#2E5936] text-sm ${darkMode ? 'bg-white/5 text-gray-300' : 'bg-[#2E5936]/5 text-gray-700'}`}>
                          {rec}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-400 italic">No specific recommendations available.</li>
                    )}
                 </ul>
               </div>
             </div>
           </div>
        </div>

        {/* Location Benchmarking */}
        <div className={`p-10 mb-16 border shadow-sm ${theme.card}`}>
           <h4 className={`font-serif text-2xl mb-8 ${theme.text}`}>Grid Intensity Benchmarking</h4>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ left: 150 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={darkMode ? '#333' : '#f5f5f5'} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 10, fontWeight: 'bold', fill: darkMode ? '#888' : '#666'}} width={140} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: darkMode ? '#1A1A1A' : '#fff', border: 'none'}} />
                  <Bar dataKey="co2" radius={[0, 4, 4, 0]} barSize={20}>
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name.includes('Optimal') ? '#2E5936' : (entry.name === currentState.trainingRegion ? '#B08D55' : '#e5e5e5')} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-6 pb-20">
          <LuxuryButton onClick={downloadReport} variant="outline" className="min-w-[200px]"><Download className="w-4 h-4" /> Download Report</LuxuryButton>
          {!selectedProject && (
             <LuxuryButton onClick={saveToLibrary} variant="primary" className="min-w-[200px]"><Save className="w-4 h-4" /> Save to Library</LuxuryButton>
          )}
        </div>
      </div>
    );
  };

  const AssessmentView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className={`mb-16 pb-12 border-b flex justify-between items-end ${theme.border}`}>
        <div>
          <h2 className={`font-serif text-5xl mb-4 ${theme.text}`}>Project Intelligence</h2>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold italic">Extracting Multi-Scope Parameters</p>
        </div>
        <LuxuryButton variant="secondary" onClick={() => setStep('home')}>Cancel</LuxuryButton>
      </header>

      {!originalState && !isAnalyzing && (
        <div className="py-24">
          <label className={`block border-2 border-dashed p-32 text-center cursor-pointer transition-all shadow-sm hover:shadow-2xl group ${darkMode ? 'bg-[#1A1A1A] border-white/10 hover:border-[#B08D55]' : 'bg-white border-gray-200 hover:border-[#B08D55]'}`}>
            <Upload className="w-16 h-16 mx-auto mb-10 text-gray-200 group-hover:text-[#B08D55] transition-colors" />
            <h3 className={`font-serif text-4xl mb-6 ${theme.text}`}>Upload Project Charter</h3>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400">Select Architecture Specification (Text/JSON)</p>
            <input type="file" className="hidden" onChange={runScan} accept=".txt,.json,.md" />
          </label>
        </div>
      )}

      {isAnalyzing && (
        <div className="py-52 text-center">
          <Loader2 className="w-16 h-16 text-[#B08D55] mx-auto mb-10 animate-spin" />
          <h3 className="font-serif text-4xl mb-12 italic text-gray-400">{analysisStatus}</h3>
          <div className={`w-full max-w-lg mx-auto h-[1px] overflow-hidden ${darkMode ? 'bg-white/10' : 'bg-gray-50'}`}>
             <div className="h-full bg-[#1A1A1A] transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.5em] font-bold text-gray-300">{progress}% SCANNING</p>
        </div>
      )}

      {originalState && (
        <div className="space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className={`p-12 shadow-sm border flex flex-col justify-between h-52 ${theme.card}`}>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Baseline Footprint</span>
              <div>
                <span className="text-6xl font-serif text-[#D32F2F] italic">{Math.round(currentLCA.totalCo2).toLocaleString()}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">kgCO2e Total Lifecycle</p>
              </div>
            </div>
            <div className={`p-12 shadow-sm border flex flex-col items-center justify-center text-center ${theme.card}`}>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-8">Efficiency Grade</span>
              <div className={`${SCORE_COLORS[currentLCA.score]} w-24 h-24 flex items-center justify-center text-5xl font-serif font-bold italic shadow-2xl`}>{currentLCA.score}</div>
              <p className="mt-8 text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest">
                {currentLCA.score === 'A' || currentLCA.score === 'B' ? 'OPTIMIZED' : 'Critical: Action Required'}
              </p>
            </div>
            <div className={`p-12 shadow-sm border flex flex-col justify-between ${theme.card}`}>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-6">Risk Profile</span>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Zap className="w-4 h-4 text-gray-200" />
                   <span className="text-xs font-bold uppercase text-gray-500">{currentState.hardware} x {currentState.numGpus}</span>
                </div>
                <div className="flex items-center gap-3">
                   <Globe className="w-4 h-4 text-gray-200" />
                   <span className="text-xs font-bold uppercase text-gray-500">{currentState.trainingRegion}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-12">
            <LuxuryButton onClick={() => setStep('optimization')}>
              ➡️ View Optimization Strategy <ArrowRight className="w-4 h-4" />
            </LuxuryButton>
          </div>
        </div>
      )}
    </div>
  );

  const OptimizationView = () => {
    // Define the strategy list dynamically based on current vs original state
    const strategies = [
      {
        id: 'training_region',
        title: 'Training Grid Decoupling',
        icon: Globe,
        color: 'text-[#2E5936]',
        bg: 'bg-[#2E5936]/5',
        border: 'border-[#2E5936]',
        desc: `Baseline uses ${originalState?.trainingRegion}. Migrate training to France for nuclear baseload.`,
        isOptimized: currentState.trainingRegion === 'France (Nuclear)',
        isOriginal: currentState.trainingRegion === originalState?.trainingRegion,
        toggle: () => {
            if (currentState.trainingRegion === 'France (Nuclear)' && originalState?.trainingRegion !== 'France (Nuclear)') {
                // Revert
                setCurrentState(s => ({ ...s, trainingRegion: originalState?.trainingRegion || 'China (Coal)' }))
            } else {
                // Apply
                setCurrentState(s => ({ ...s, trainingRegion: 'France (Nuclear)' }))
            }
        }
      },
      {
        id: 'hardware',
        title: 'Hardware Efficiency Scaling',
        icon: Cpu,
        color: 'text-[#B08D55]',
        bg: 'bg-[#B08D55]/5',
        border: 'border-[#B08D55]',
        desc: `Switch to NVIDIA T4 accelerators to reduce embodied carbon and wattage.`,
        isOptimized: currentState.hardware === 'NVIDIA T4',
        isOriginal: currentState.hardware === originalState?.hardware,
        toggle: () => {
            if (currentState.hardware === 'NVIDIA T4' && originalState?.hardware !== 'NVIDIA T4') {
                setCurrentState(s => ({ ...s, hardware: originalState?.hardware || 'NVIDIA A100' }))
            } else {
                setCurrentState(s => ({ ...s, hardware: 'NVIDIA T4' }))
            }
        }
      },
      {
        id: 'inference_region',
        title: 'Inference Edge Decoupling',
        icon: Server,
        color: 'text-[#2E5936]',
        bg: 'bg-[#2E5936]/5',
        border: 'border-[#2E5936]',
        desc: `Baseline uses ${originalState?.inferenceRegion}. Relocate inference API to low-carbon zones.`,
        isOptimized: currentState.inferenceRegion === 'France (Nuclear)',
        isOriginal: currentState.inferenceRegion === originalState?.inferenceRegion,
        toggle: () => {
            if (currentState.inferenceRegion === 'France (Nuclear)' && originalState?.inferenceRegion !== 'France (Nuclear)') {
                setCurrentState(s => ({ ...s, inferenceRegion: originalState?.inferenceRegion || 'China (Coal)' }))
            } else {
                setCurrentState(s => ({ ...s, inferenceRegion: 'France (Nuclear)' }))
            }
        }
      },
      {
        id: 'quantization',
        title: 'INT8 Quantization',
        icon: Zap,
        color: 'text-[#B08D55]',
        bg: 'bg-[#B08D55]/5',
        border: 'border-[#B08D55]',
        desc: `Compress model weights to reduce latency from ${originalState?.avgLatency}s to ${(originalState?.avgLatency || 0) * 0.5}s.`,
        isOptimized: currentState.avgLatency <= (originalState?.avgLatency || 0) * 0.51, 
        isOriginal: currentState.avgLatency === originalState?.avgLatency,
        toggle: () => {
             // Logic: Check if current is approx half of original (Optimized)
             const isOpt = currentState.avgLatency <= (originalState?.avgLatency || 0) * 0.51;
             if (isOpt && originalState?.avgLatency) {
                 setCurrentState(s => ({ ...s, avgLatency: originalState.avgLatency }))
             } else {
                 setCurrentState(s => ({ ...s, avgLatency: (originalState?.avgLatency || 0) * 0.5 }))
             }
        }
      },
      {
        id: 'pruning',
        title: 'Spectral Pruning',
        icon: Sparkles,
        color: 'text-[#2E5936]',
        bg: 'bg-[#2E5936]/5',
        border: 'border-[#2E5936]',
        desc: `Algorithmic optimization to reduce training time from ${originalState?.trainingHours}h to ${Math.round((originalState?.trainingHours || 0) * 0.7)}h.`,
        isOptimized: currentState.trainingHours <= (originalState?.trainingHours || 0) * 0.71,
        isOriginal: currentState.trainingHours === originalState?.trainingHours,
        toggle: () => {
            const isOpt = currentState.trainingHours <= (originalState?.trainingHours || 0) * 0.71;
            if (isOpt && originalState?.trainingHours) {
                setCurrentState(s => ({ ...s, trainingHours: originalState.trainingHours }))
            } else {
                setCurrentState(s => ({ ...s, trainingHours: Math.round((originalState?.trainingHours || 0) * 0.7) }))
            }
        }
      },
      {
        id: 'rightsizing',
        title: 'Cluster Right-Sizing',
        icon: BarChart3,
        color: 'text-[#B08D55]',
        bg: 'bg-[#B08D55]/5',
        border: 'border-[#B08D55]',
        desc: `Downscale from ${originalState?.numGpus} GPUs to ${Math.max(1, Math.round((originalState?.numGpus || 0) * 0.75))} to minimize idle waste.`,
        isOptimized: currentState.numGpus <= Math.max(1, Math.round((originalState?.numGpus || 0) * 0.76)),
        isOriginal: currentState.numGpus === originalState?.numGpus,
        toggle: () => {
            const isOpt = currentState.numGpus <= Math.max(1, Math.round((originalState?.numGpus || 0) * 0.76));
            if (isOpt && originalState?.numGpus) {
                setCurrentState(s => ({ ...s, numGpus: originalState.numGpus }))
            } else {
                setCurrentState(s => ({ ...s, numGpus: Math.max(1, Math.round((originalState?.numGpus || 0) * 0.75)) }))
            }
        }
      }
    ];

    return (
      <div className="animate-in fade-in slide-in-from-right-8 duration-700">
        <header className={`mb-16 border-b pb-12 flex justify-between items-end ${theme.border}`}>
          <div>
            <h2 className={`font-serif text-5xl mb-4 ${theme.text}`}>Strategy Lab</h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Live Design Refinement</p>
          </div>
          <LuxuryButton variant="secondary" onClick={() => setStep('assessment')}>Back</LuxuryButton>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            <h4 className={`font-serif text-4xl tracking-tight mb-4 ${theme.text}`}>Optimization Directives</h4>
            {strategies.map((strategy) => {
               // Determine Button State
               // If Optimized AND NOT Original -> It was applied by user -> Show UNDO
               // If Optimized AND Original -> It was already good -> Show BASELINE OPTIMAL (Disabled)
               // If NOT Optimized -> Show APPLY
               const canUndo = strategy.isOptimized && !strategy.isOriginal;
               const isBaselineOptimal = strategy.isOptimized && strategy.isOriginal;
               
               return (
                <div key={strategy.id} className={`p-10 space-y-8 border ${isBaselineOptimal ? 'border-gray-100 opacity-60' : `border-${strategy.color.split('-')[1]}/10 hover:${strategy.border}`} group transition-all duration-500 shadow-sm hover:shadow-2xl ${theme.card}`}>
                    <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-full ${strategy.bg} ${strategy.color} flex items-center justify-center`}>
                        <strategy.icon className="w-6 h-6" />
                    </div>
                    {strategy.isOptimized && <CheckCircle2 className={`w-6 h-6 ${strategy.color}`} />}
                    </div>
                    <h5 className="font-serif text-2xl tracking-wide uppercase">{strategy.title}</h5>
                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                    {strategy.desc}
                    </p>
                    
                    {isBaselineOptimal ? (
                        <div className={`text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 flex items-center gap-4`}>
                           BASELINE OPTIMAL <Check className="w-3 h-3" />
                        </div>
                    ) : (
                        <button 
                            onClick={strategy.toggle}
                            className={`text-[10px] uppercase tracking-[0.4em] font-bold ${canUndo ? 'text-gray-400 hover:text-[#D32F2F]' : strategy.color} flex items-center gap-4 hover:gap-6 transition-all`}
                        >
                            {canUndo ? (
                                <>UNDO FIX <RotateCcw className="w-3 h-3" /></>
                            ) : (
                                <>APPLY FIX <ArrowRight className="w-3 h-3" /></>
                            )}
                        </button>
                    )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1 sticky top-8">
            <div className="bg-[#1A1A1A] p-16 text-white flex flex-col justify-between shadow-3xl min-h-[600px]">
              <div className="space-y-16">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 block">Live Simulation Metrics</span>
                
                <div className="space-y-12">
                  <div className="flex justify-between items-end border-b border-white/5 pb-10">
                      <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Carbon Offset</span>
                      <span className="text-5xl font-serif text-[#B08D55] italic">
                        {originalLCA && originalLCA.totalCo2 > 0 ? Math.round(((originalLCA.totalCo2 - currentLCA.totalCo2) / originalLCA.totalCo2) * 100) : 0}%
                      </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-10">
                      <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Projected Grade</span>
                      <div className={`${SCORE_COLORS[currentLCA.score]} w-16 h-16 flex items-center justify-center text-3xl font-serif font-bold italic shadow-xl`}>{currentLCA.score}</div>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-10">
                      <span className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Cost Savings</span>
                      <span className="text-3xl font-serif text-white font-medium italic">
                        €{originalLCA ? Math.round(originalLCA.totalCost - currentLCA.totalCost).toLocaleString() : 0}
                      </span>
                  </div>
                </div>
              </div>
              <LuxuryButton variant="gold" onClick={() => setStep('report')} className="w-full mt-20">Finalize Strategic Report</LuxuryButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (step === 'login') return (
    <LoginView 
      onLogin={handleLogin} 
      onRegister={handleRegister} 
      authMode={authMode} 
      setAuthMode={setAuthMode}
      error={loginError}
      darkMode={darkMode}
    />
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} selection:bg-[#B08D55] selection:text-white flex overflow-hidden transition-colors duration-500`}>
      {/* Persistent Enterprise Sidebar */}
      <aside className={`w-80 h-screen border-r flex flex-col sticky top-0 z-50 ${theme.sidebar}`}>
        <div className={`p-12 border-b flex flex-col items-center ${theme.border}`}>
           <div className="w-12 h-12 bg-[#1A1A1A] rounded-sm flex items-center justify-center mb-6 shadow-xl hover:rotate-12 transition-transform cursor-pointer" onClick={() => setStep('home')}>
              <Leaf className="text-white w-6 h-6" />
           </div>
           <h1 className={`font-serif text-2xl tracking-[0.3em] uppercase ${theme.text}`}>EcoScan</h1>
        </div>

        <div className="flex-1 p-12 space-y-16">
           <div className="space-y-6 cursor-pointer" onClick={() => setStep('profile')}>
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Auth Context</label>
              <div className={`flex items-center gap-4 py-4 px-5 rounded-sm transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
                 <div className="w-8 h-8 rounded-full bg-[#B08D55] flex items-center justify-center text-white text-[10px] font-bold uppercase">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div>
                    <span className={`text-[11px] font-bold block leading-tight ${theme.text}`}>{user?.name}</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{user?.maison} GreenOps</span>
                 </div>
              </div>
           </div>

           <nav className="space-y-12">
              <button 
                 onClick={() => setStep('home')}
                 className={`w-full flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${step === 'home' ? 'text-[#B08D55]' : 'text-gray-400 hover:text-gray-500'}`}
              >
                 <Home className="w-5 h-5" /> Hub
              </button>
              <button 
                 onClick={() => setStep('library')}
                 className={`w-full flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${step === 'library' ? 'text-[#B08D55]' : 'text-gray-400 hover:text-gray-500'}`}
              >
                 <BookOpen className="w-5 h-5" /> Library
              </button>
              <div className={`pt-8 border-t space-y-12 ${theme.border}`}>
                <button
                   onClick={() => setStep('settings')} 
                   className={`w-full flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold transition-all ${step === 'settings' ? 'text-[#B08D55]' : 'text-gray-400 hover:text-gray-500'}`}
                >
                   <Settings className="w-5 h-5" /> Settings
                </button>
                <button 
                   onClick={handleLogout}
                   className="w-full flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 hover:text-[#D32F2F] transition-all"
                >
                   <LogOut className="w-5 h-5" /> Exit
                </button>
              </div>
           </nav>
        </div>

        <div className={`p-12 text-[9px] text-gray-400 font-mono tracking-[0.2em] leading-relaxed uppercase opacity-50 text-center border-t ${theme.border}`}>
          LVMH DIOR HUB<br />ENTERPRISE GREEN IT<br />v3.42.0.DIOR
        </div>
      </aside>

      {/* Main Experience Panel */}
      <main className="flex-1 p-20 max-w-7xl mx-auto w-full overflow-y-auto h-screen scroll-smooth relative">
        {step === 'home' && <HomeView />}
        {step === 'library' && <LibraryView />}
        {step === 'assessment' && <AssessmentView />}
        {step === 'optimization' && <OptimizationView />}
        {step === 'report' && <ReportView />}
        {step === 'settings' && <SettingsView />}
        {step === 'profile' && <ProfileView />}
        
        {/* Modals */}
        {showCalcModal && <CalculationModal />}
      </main>
    </div>
  );
};

export default App;
