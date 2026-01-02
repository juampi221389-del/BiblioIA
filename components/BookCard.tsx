import React from 'react';
import { Book, ReadingStatus } from '../types';
import { BookOpen, CheckCircle, Clock, MoreHorizontal } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  onUpdateStatus: (id: string, status: ReadingStatus) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick, onUpdateStatus }) => {
  
  const statusColor = {
    [ReadingStatus.READING]: 'text-amber-600 bg-amber-100',
    [ReadingStatus.COMPLETED]: 'text-green-600 bg-green-100',
    [ReadingStatus.TBR]: 'text-slate-600 bg-slate-100',
  };

  const statusLabel = {
    [ReadingStatus.READING]: 'Leyendo',
    [ReadingStatus.COMPLETED]: 'Leído',
    [ReadingStatus.TBR]: 'Por leer',
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
      onClick={() => onClick(book)}
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={`https://picsum.photos/seed/${book.id}/400/600`} 
          alt={book.title}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusColor[book.status]}`}>
                {statusLabel[book.status]}
            </span>
        </div>
        {book.analysis?.moodColor && (
             <div 
             className="absolute bottom-0 left-0 w-full h-1" 
             style={{ backgroundColor: book.analysis.moodColor }}
           />
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-slate-500 text-sm mb-3">{book.author}</p>
        
        {book.genre && (
            <span className="inline-block bg-slate-50 text-slate-500 text-xs px-2 py-1 rounded mb-4 w-fit">
                {book.genre}
            </span>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
           <span>{book.totalPages} págs</span>
           <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {/* Quick actions could go here */}
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;