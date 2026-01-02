import React, { useState, useEffect } from 'react';
import { Book, ReadingStatus } from './types';
import BookCard from './components/BookCard';
import BookDetail from './components/BookDetail';
import Statistics from './components/Statistics';
import { getBookRecommendations } from './services/geminiService';
import { Plus, BarChart2, Grid, Search, BookOpen, Lightbulb } from 'lucide-react';

// Initial Mock Data
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    status: ReadingStatus.COMPLETED,
    totalPages: 417,
    currentPage: 417,
    coverPlaceholder: 1,
    addedAt: Date.now(),
    genre: 'Realismo Mágico'
  },
  {
    id: '2',
    title: 'Dune',
    author: 'Frank Herbert',
    status: ReadingStatus.READING,
    totalPages: 896,
    currentPage: 342,
    coverPlaceholder: 2,
    addedAt: Date.now() - 100000,
    genre: 'Ciencia Ficción'
  }
];

function App() {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('biblio-books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [view, setView] = useState<'library' | 'stats'>('library');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Add Book Inputs
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  
  // Recommendations
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    localStorage.setItem('biblio-books', JSON.stringify(books));
  }, [books]);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const newBook: Book = {
      id: Date.now().toString(),
      title: newTitle,
      author: newAuthor,
      status: ReadingStatus.TBR,
      totalPages: 300, // Default, editable later
      currentPage: 0,
      coverPlaceholder: Math.floor(Math.random() * 100),
      addedAt: Date.now()
    };

    setBooks([newBook, ...books]);
    setNewTitle('');
    setNewAuthor('');
    setIsAddModalOpen(false);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
    setBooks(updatedBooks);
    setSelectedBook(updatedBook); // Keep modal updated
  };

  const generateRecs = async () => {
    setLoadingRecs(true);
    const recs = await getBookRecommendations(books);
    setRecommendations(recs);
    setLoadingRecs(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 font-sans selection:bg-orange-100">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-accent text-white p-1.5 rounded-lg">
                <BookOpen size={20} />
            </div>
            <h1 className="font-serif font-bold text-xl tracking-tight text-slate-900">BiblioAI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setView('library')}
                className={`p-2 rounded-lg transition-colors ${view === 'library' ? 'bg-orange-50 text-accent' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Mi Biblioteca"
            >
                <Grid size={20} />
            </button>
            <button 
                onClick={() => setView('stats')}
                className={`p-2 rounded-lg transition-colors ${view === 'stats' ? 'bg-orange-50 text-accent' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Estadísticas"
            >
                <BarChart2 size={20} />
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
            >
                <Plus size={16} />
                <span className="hidden sm:inline">Agregar Libro</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'library' && (
            <>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-slate-900">Mi Biblioteca</h2>
                        <p className="text-slate-500 mt-1">Tu colección personal y progreso de lectura.</p>
                    </div>
                    
                    {/* Recommendation Teaser */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={generateRecs}
                            disabled={loadingRecs}
                            className="text-sm text-accent hover:text-orange-700 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                            <Lightbulb size={16} />
                            {loadingRecs ? 'Pensando...' : 'Sugerir próxima lectura'}
                        </button>
                    </div>
                </div>

                {/* AI Recommendations Area */}
                {recommendations.length > 0 && (
                    <div className="mb-8 bg-orange-50 border border-orange-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-orange-900 text-sm mb-2 flex items-center gap-2">
                            <Lightbulb size={14} /> Recomendado para ti por la IA
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {recommendations.map((rec, i) => (
                                <span key={i} className="bg-white text-orange-800 px-3 py-1.5 rounded-lg shadow-sm text-sm border border-orange-100">
                                    {rec}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Book Grid */}
                {books.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {books.map(book => (
                            <BookCard 
                                key={book.id} 
                                book={book} 
                                onClick={setSelectedBook}
                                onUpdateStatus={(id, status) => {
                                    const b = books.find(b => b.id === id);
                                    if(b) handleUpdateBook({...b, status});
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
                        <div className="inline-block p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                            <BookOpen size={48} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Tu biblioteca está vacía</h3>
                        <p className="text-slate-500 mb-6">Agrega tu primer libro para comenzar a usar la IA.</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-accent font-medium hover:underline">
                            Agregar libro ahora
                        </button>
                    </div>
                )}
            </>
        )}

        {view === 'stats' && (
            <div>
                 <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Estadísticas</h2>
                 <p className="text-slate-500 mb-8">Un resumen visual de tu vida literaria.</p>
                 <Statistics books={books} />
            </div>
        )}

      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetail 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
            onUpdateBook={handleUpdateBook}
        />
      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl font-bold">Agregar Nuevo Libro</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleAddBook}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                                placeholder="Ej. El Principito"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Autor</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                                placeholder="Ej. Antoine de Saint-Exupéry"
                                value={newAuthor}
                                onChange={e => setNewAuthor(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                        >
                            Guardar Libro
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}

// Simple Icon wrapper for the modal
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default App;