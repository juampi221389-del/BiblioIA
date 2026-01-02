import React, { useState, useEffect, useRef } from 'react';
import { Book, ChatMessage, ReadingStatus } from '../types';
import { analyzeBook, chatWithBook } from '../services/geminiService';
import { X, Send, Sparkles, BookOpen, MessageSquare, BrainCircuit } from 'lucide-react';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onUpdateBook: (updatedBook: Book) => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onClose, onUpdateBook }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'chat'>('analysis');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate analysis if missing
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!book.analysis) {
        setIsLoadingAnalysis(true);
        const analysisData = await analyzeBook(book.title, book.author);
        onUpdateBook({
          ...book,
          analysis: analysisData,
          genre: analysisData.genre // Update genre as well
        });
        setIsLoadingAnalysis(false);
      }
    };
    fetchAnalysis();
  }, [book.id]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithBook(book, history, userMsg.text);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "No pude generar una respuesta.",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsChatLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden">
        
        {/* Left: Visual & Quick Info */}
        <div className="w-1/3 bg-slate-50 p-8 flex flex-col border-r border-slate-200 overflow-y-auto hidden md:flex">
            <div className="shadow-xl rounded-lg overflow-hidden mb-6 aspect-[2/3]">
                <img 
                    src={`https://picsum.photos/seed/${book.id}/400/600`} 
                    className="w-full h-full object-cover" 
                    alt="Cover" 
                />
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">{book.title}</h2>
            <p className="text-slate-600 mb-6 font-medium">{book.author}</p>
            
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Estado</label>
                    <select 
                        className="block w-full mt-1 p-2 bg-white border border-slate-300 rounded-md text-sm"
                        value={book.status}
                        onChange={(e) => onUpdateBook({...book, status: e.target.value as ReadingStatus})}
                    >
                        <option value={ReadingStatus.TBR}>Por leer</option>
                        <option value={ReadingStatus.READING}>Leyendo</option>
                        <option value={ReadingStatus.COMPLETED}>Completado</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">Progreso</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            type="number" 
                            className="w-20 p-2 bg-white border border-slate-300 rounded-md text-sm"
                            value={book.currentPage}
                            max={book.totalPages}
                            onChange={(e) => onUpdateBook({...book, currentPage: parseInt(e.target.value) || 0})}
                        />
                        <span className="text-sm text-slate-500">/ {book.totalPages}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 flex flex-col bg-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 z-10">
                <X size={20} />
            </button>

            {/* Mobile Header (Only visible on small screens) */}
            <div className="md:hidden p-4 border-b border-slate-100 pr-12">
                 <h2 className="font-serif text-xl font-bold truncate">{book.title}</h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 pt-6">
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analysis' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Sparkles size={16} />
                    Análisis IA
                </button>
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'chat' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <MessageSquare size={16} />
                    Preguntar al Libro
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-paper">
                {activeTab === 'analysis' ? (
                    isLoadingAnalysis ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
                            <BrainCircuit size={48} className="mb-4 text-slate-300" />
                            <p>Leyendo el libro por ti...</p>
                        </div>
                    ) : book.analysis ? (
                        <div className="space-y-8 max-w-2xl mx-auto">
                            <section>
                                <h3 className="font-serif text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <BookOpen size={18} className="text-accent" /> Resumen
                                </h3>
                                <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                                    {book.analysis.summary}
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Temas Clave</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {book.analysis.themes.map((theme, i) => (
                                            <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">
                                                {theme}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                                <section>
                                    <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Estilo</h4>
                                    <p className="text-slate-600 text-sm">{book.analysis.literaryStyle}</p>
                                </section>
                            </div>

                            <section>
                                <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Personajes Principales</h4>
                                <ul className="list-disc list-inside text-slate-700 text-sm">
                                    {book.analysis.mainCharacters.map((char, i) => (
                                        <li key={i}>{char}</li>
                                    ))}
                                </ul>
                            </section>
                            
                            {book.analysis.moodColor && (
                                <section className="p-4 rounded-lg bg-white border border-slate-200 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full shadow-inner" style={{ backgroundColor: book.analysis.moodColor }}></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Atmósfera del Libro</h4>
                                        <p className="text-slate-500 text-xs">Color generado por IA basado en el tono emocional.</p>
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 mt-10">No hay análisis disponible.</div>
                    )
                ) : (
                    <div className="flex flex-col h-full max-w-2xl mx-auto">
                        <div className="flex-1 space-y-4 pb-4">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 mt-10">
                                    <p className="mb-2">Hazme preguntas sobre la trama, el simbolismo o los personajes.</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <button onClick={() => setInputMessage("¿Cuál es el conflicto principal?")} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50">¿Cuál es el conflicto principal?</button>
                                        <button onClick={() => setInputMessage("Explica el final.")} className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50">Explica el final</button>
                                    </div>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-accent text-white rounded-br-none' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-200">
                             <div className="relative">
                                <input 
                                    type="text" 
                                    className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm shadow-sm"
                                    placeholder="Pregunta algo sobre el libro..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isChatLoading}
                                />
                                <button 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:bg-orange-50 rounded-lg disabled:opacity-50"
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isChatLoading}
                                >
                                    <Send size={18} />
                                </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;