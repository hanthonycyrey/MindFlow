import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Plus, 
  History, 
  Lightbulb, 
  Network, 
  Settings, 
  Trash2, 
  Archive, 
  Search, 
  Filter,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
  BookOpen,
  Info,
  X,
  Download,
  Share2,
  Pencil,
  LogOut,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { Thought, AnalysisResult, Framework } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { analyzeThoughts } from './services/gemini';
import { FRAMEWORKS } from './constants';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  handleFirestoreError,
  OperationType,
  User
} from './lib/firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function App() {
  return (
    <ErrorBoundary>
      <MindFlowApp />
    </ErrorBoundary>
  );
}

function MindFlowApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThoughtId, setSelectedThoughtId] = useLocalStorage<string | null>('mindflow-selected-thought', null);
  const [currentThought, setCurrentThought] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dump');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('mindflow-darkmode', false);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener
  useEffect(() => {
    if (!user) {
      setThoughts([]);
      return;
    }

    const q = query(
      collection(db, 'thoughts'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedThoughts = snapshot.docs.map(doc => doc.data() as Thought);
      setThoughts(fetchedThoughts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'thoughts');
    });

    return () => unsubscribe();
  }, [user]);

  const selectedThought = useMemo(() => 
    thoughts.find(t => t.id === selectedThoughtId),
  [thoughts, selectedThoughtId]);

  const analysis = selectedThought?.analysis;

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedThoughtId(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleAddThought = async () => {
    if (!currentThought.trim() || !user) return;
    
    try {
      if (editingThought) {
        const thoughtRef = doc(db, 'thoughts', editingThought.id);
        await updateDoc(thoughtRef, {
          title: currentTitle,
          content: currentThought,
          timestamp: Date.now()
        });
        setEditingThought(null);
      } else {
        const id = crypto.randomUUID();
        const newThought: Thought & { uid: string } = {
          id,
          uid: user.uid,
          title: currentTitle,
          content: currentThought,
          timestamp: Date.now(),
          tags: [],
          frameworks: [],
          isArchived: false
        };
        await setDoc(doc(db, 'thoughts', id), newThought);
      }
      
      setCurrentThought('');
      setCurrentTitle('');
    } catch (error) {
      handleFirestoreError(error, editingThought ? OperationType.UPDATE : OperationType.CREATE, 'thoughts');
    }
  };

  const startEditing = (thought: Thought) => {
    setEditingThought(thought);
    setCurrentThought(thought.content);
    setCurrentTitle(thought.title || '');
    setActiveTab('dump');
  };

  const cancelEditing = () => {
    setEditingThought(null);
    setCurrentThought('');
    setCurrentTitle('');
  };

  const handleAnalyze = async (id: string) => {
    const thought = thoughts.find(t => t.id === id);
    if (!thought || !user) return;

    setAnalyzingId(id);
    try {
      const result = await analyzeThoughts(thought.content);
      const thoughtRef = doc(db, 'thoughts', id);
      await updateDoc(thoughtRef, { analysis: result });
      setSelectedThoughtId(id);
      setActiveTab('insights');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'thoughts');
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredThoughts = thoughts.filter(t => 
    t.content.toLowerCase().includes(searchQuery.toLowerCase()) && !t.isArchived
  );

  const deleteThought = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'thoughts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'thoughts');
    }
  };

  const archiveThought = async (id: string) => {
    try {
      await updateDoc(doc(db, 'thoughts', id), { isArchived: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'thoughts');
    }
  };

  // React Flow Nodes & Edges
  const { nodes, edges } = useMemo(() => {
    if (!analysis) return { nodes: [], edges: [] };

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Center node
    newNodes.push({
      id: 'center',
      data: { label: analysis.title || 'Thought Analysis' },
      position: { x: 0, y: 0 },
      style: { 
        background: '#3b82f6', 
        color: '#fff', 
        borderRadius: '12px', 
        padding: '15px',
        fontWeight: 'bold',
        width: 180,
        textAlign: 'center',
        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)'
      }
    });

    // Theme nodes
    analysis.themes.forEach((theme, i) => {
      const angle = (i / analysis.themes.length) * 2 * Math.PI;
      const radius = 250;
      newNodes.push({
        id: `theme-${i}`,
        data: { label: theme },
        position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
        style: { 
          background: isDarkMode ? '#1e293b' : '#fff', 
          color: isDarkMode ? '#fff' : '#1e293b', 
          borderRadius: '8px',
          border: '2px solid #10b981',
          padding: '10px',
          width: 120,
          textAlign: 'center',
          fontSize: '12px'
        }
      });
      newEdges.push({
        id: `edge-center-theme-${i}`,
        source: 'center',
        target: `theme-${i}`,
        animated: true,
        style: { stroke: '#10b981' }
      });
    });

    // Connection edges
    analysis.connections.forEach((conn, i) => {
      const sourceThemeIdx = analysis.themes.indexOf(conn.from);
      const targetThemeIdx = analysis.themes.indexOf(conn.to);
      
      if (sourceThemeIdx !== -1 && targetThemeIdx !== -1) {
        newEdges.push({
          id: `edge-conn-${i}`,
          source: `theme-${sourceThemeIdx}`,
          target: `theme-${targetThemeIdx}`,
          label: conn.reason,
          labelStyle: { fontSize: '8px', fill: '#94a3b8', fontWeight: 'bold' },
          style: { stroke: '#94a3b8', strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
        });
      }
    });

    return { nodes: newNodes, edges: newEdges };
  }, [analysis, isDarkMode]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer"
                onClick={() => setActiveTab('dump')}
              >
                <Brain className="text-white w-6 h-6" />
              </motion.div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">MindFlow</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              {user ? (
                <Tooltip>
                  <TooltipTrigger>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleLogout}
                      className="rounded-full hover:text-red-500"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Logout ({user.email})</TooltipContent>
                </Tooltip>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogin}
                  className="rounded-full gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <TabsTrigger value="dump" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Dump</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">
                <Network className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {!isAuthReady ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </motion.div>
                </div>
              ) : !user ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto py-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Welcome to MindFlow</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Your secure, AI-powered notebook. Login to sync your thoughts across all your devices and keep your data private.
                  </p>
                  <Button 
                    onClick={handleLogin} 
                    size="lg" 
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold shadow-xl shadow-blue-500/20 gap-3"
                  >
                    <LogIn className="w-6 h-6" />
                    Continue with Google
                  </Button>
                  <p className="text-xs text-slate-500">
                    By continuing, you agree to our secure data handling principles.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Thought Dump */}
                  <TabsContent value="dump" key="dump">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-2xl font-bold">
                        {editingThought ? 'Edit your thought' : 'Capture your thoughts'}
                      </CardTitle>
                      <CardDescription>
                        {editingThought ? 'Refine your ideas and save the changes.' : "Don't filter, just flow. We'll organize it later."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input 
                        placeholder="Give it a title (optional)..."
                        className="text-lg font-semibold border-none focus-visible:ring-0 bg-slate-50/50 dark:bg-slate-950/50 px-6 py-4 rounded-xl"
                        value={currentTitle}
                        onChange={(e) => setCurrentTitle(e.target.value)}
                      />
                      <Textarea 
                        placeholder="What's on your mind? Type freely..."
                        className="min-h-[300px] text-lg resize-none border-none focus-visible:ring-0 bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded-xl"
                        value={currentThought}
                        onChange={(e) => setCurrentThought(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleAddThought();
                          }
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">
                          Tip: Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">⌘ + Enter</kbd> to save
                        </p>
                        <div className="flex gap-2">
                          {editingThought && (
                            <Button variant="ghost" onClick={cancelEditing} className="rounded-full">Cancel</Button>
                          )}
                          <Button onClick={handleAddThought} className="px-8 rounded-full">
                            {editingThought ? 'Update Thought' : 'Save Thought'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {thoughts.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-semibold text-slate-500 uppercase tracking-wider text-xs">Recent Entries</h3>
                      <Button variant="link" size="sm" onClick={() => setActiveTab('timeline')} className="text-blue-600">View All</Button>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {thoughts.slice(0, 3).map((thought) => (
                      <Card 
                        key={thought.id} 
                        className={`group hover:shadow-md transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer ${selectedThoughtId === thought.id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => {
                          setSelectedThoughtId(thought.id);
                          if (thought.analysis) setActiveTab('insights');
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-medium text-slate-400">
                              {format(thought.timestamp, 'MMM d, h:mm a')}
                            </span>
                            {thought.analysis && (
                              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none text-[10px]">
                                Analyzed
                              </Badge>
                            )}
                          </div>
                          {thought.title && (
                            <h4 className="font-bold text-sm mb-1 text-blue-600 dark:text-blue-400">{thought.title}</h4>
                          )}
                          <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{thought.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Timeline */}
              <TabsContent value="timeline" key="timeline">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Search thoughts..." 
                        className="pl-10 rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none rounded-full">
                        <Filter className="w-4 h-4" /> Filter
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none rounded-full">
                        <Archive className="w-4 h-4" /> Archive
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                    <div className="space-y-4">
                      {filteredThoughts.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>No thoughts found. Start dumping!</p>
                        </div>
                      ) : (
                        filteredThoughts.map((thought) => (
                          <Card 
                            key={thought.id} 
                            className={`group relative border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all cursor-pointer ${selectedThoughtId === thought.id ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setSelectedThoughtId(thought.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                  {format(thought.timestamp, 'EEEE, MMMM do')}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-blue-500 hover:text-blue-600" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAnalyze(thought.id);
                                    }}
                                    disabled={analyzingId === thought.id}
                                  >
                                    {analyzingId === thought.id ? (
                                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                        <Sparkles className="w-4 h-4" />
                                      </motion.div>
                                    ) : (
                                      <Sparkles className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(thought);
                                  }}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={(e) => {
                                    e.stopPropagation();
                                    archiveThought(thought.id);
                                  }}>
                                    <Archive className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={(e) => {
                                    e.stopPropagation();
                                    deleteThought(thought.id);
                                  }}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {thought.title && (
                                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">{thought.title}</h3>
                              )}
                              <div className="prose prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown>{thought.content}</ReactMarkdown>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {thought.frameworks.map(f => (
                                    <Badge key={f} variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-none">
                                      {f}
                                    </Badge>
                                  ))}
                                </div>
                                {thought.analysis && (
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="text-blue-600 p-0 h-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedThoughtId(thought.id);
                                      setActiveTab('insights');
                                    }}
                                  >
                                    View Insights →
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </motion.div>
              </TabsContent>

              {/* Insights */}
              <TabsContent value="insights" key="insights">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {!analysis ? (
                    <Card className="border-dashed border-2 py-20 text-center bg-transparent">
                      <CardContent>
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-500 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">Select a Thought to Analyze</h3>
                        <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                          {selectedThoughtId 
                            ? "This thought hasn't been analyzed yet. Click the Sparkles icon in the Timeline to analyze it."
                            : "Go to the Timeline and select a thought to view its specific insights."}
                        </p>
                        <Button onClick={() => setActiveTab('timeline')} className="rounded-full">
                          Go to Timeline
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6">
                      {/* Summary */}
                      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-sm">
                              AI Analysis
                            </Badge>
                          </div>
                          <CardTitle className="text-3xl font-black tracking-tight mb-2">
                            {analysis.title}
                          </CardTitle>
                          <Separator className="bg-white/20 mb-4" />
                          <div className="flex items-center gap-2 text-sm font-medium opacity-80">
                            <Sparkles className="w-4 h-4" />
                            Executive Summary
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-lg leading-relaxed opacity-90">{analysis.summary}</p>
                        </CardContent>
                      </Card>

                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Themes & Patterns */}
                        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Network className="w-5 h-5 text-emerald-500" />
                              Themes & Patterns
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {analysis.themes.map(theme => (
                                <Badge key={theme} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-none">
                                  {theme}
                                </Badge>
                              ))}
                            </div>
                            <Separator />
                            <ul className="space-y-2">
                              {analysis.patterns.map((pattern, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                                  {pattern}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        {/* Suggested Frameworks */}
                        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-amber-500" />
                              Mental Models
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-3">
                              {analysis.suggestedFrameworks.map(fName => {
                                const framework = FRAMEWORKS.find(fw => fw.name.toLowerCase().includes(fName.toLowerCase()));
                                return (
                                  <div 
                                    key={fName} 
                                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-amber-500 transition-colors group"
                                    onClick={() => framework && setSelectedFramework(framework)}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <h4 className="font-bold text-sm">{fName}</h4>
                                      {framework && <Info className="w-3 h-3 text-slate-400 group-hover:text-amber-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{framework?.description || "A relevant framework for your current thinking patterns."}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Actionable Insights */}
                      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-blue-500" />
                            Actionable Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="grid sm:grid-cols-2 gap-4">
                            {analysis.actionableInsights.map((insight, i) => (
                              <li key={i} className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/50 text-sm flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-blue-600 dark:text-blue-300">
                                  {i + 1}
                                </div>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Mind Map */}
              <TabsContent value="map" key="map">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-[calc(100vh-200px)] w-full rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden shadow-inner relative"
                >
                  {!analysis ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                      <Network className="w-16 h-16 mb-4 opacity-20" />
                      <h3 className="text-xl font-semibold mb-2">Mind Map Unavailable</h3>
                      <p className="max-w-xs">
                        {selectedThoughtId 
                          ? "Analyze this specific thought first to generate its visual map."
                          : "Select a thought from the Timeline to see its internal connections."}
                      </p>
                      <Button variant="outline" className="mt-6 rounded-full" onClick={() => setActiveTab('timeline')}>Go to Timeline</Button>
                    </div>
                  ) : (
                    <>
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        fitView
                        className="bg-slate-50 dark:bg-slate-950"
                      >
                        <Background color={isDarkMode ? '#334155' : '#cbd5e1'} gap={20} />
                        <Controls />
                      </ReactFlow>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="secondary" size="icon" className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="icon" className="rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              </TabsContent>
                </>
              )}
            </AnimatePresence>
          </Tabs>
        </main>

        {/* Framework Detail Dialog */}
        <Dialog open={!!selectedFramework} onOpenChange={(open) => !open && setSelectedFramework(null)}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-500" />
                {selectedFramework?.name}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {selectedFramework?.category}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedFramework?.description}
              </p>
              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-400">Core Principles</h4>
                <div className="grid gap-2">
                  {selectedFramework?.principles.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-sm font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white" onClick={() => setSelectedFramework(null)}>
              Got it
            </Button>
          </DialogContent>
        </Dialog>

        {/* Floating Stats - Desktop Only */}
        <div className="fixed bottom-8 right-8 hidden xl:block">
          <Card className="w-64 shadow-2xl border-none bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-2xl overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Mind Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Total Thoughts</span>
                <span className="font-bold text-blue-600">{thoughts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Themes Found</span>
                <span className="font-bold text-emerald-600">{analysis?.themes.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Frameworks Used</span>
                <span className="font-bold text-amber-600">{analysis?.suggestedFrameworks.length || 0}</span>
              </div>
              <Separator className="bg-slate-200 dark:bg-slate-800" />
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Last Analysis</p>
                <p className="text-xs font-medium">{analysis ? "Just now" : "Never"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
