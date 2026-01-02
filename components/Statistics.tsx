import React from 'react';
import { Book, ReadingStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface StatisticsProps {
  books: Book[];
}

const Statistics: React.FC<StatisticsProps> = ({ books }) => {
  
  // Prepare Status Data
  const statusCounts = books.reduce((acc, book) => {
    acc[book.status] = (acc[book.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = [
    { name: 'Leídos', value: statusCounts[ReadingStatus.COMPLETED] || 0, color: '#059669' },
    { name: 'Leyendo', value: statusCounts[ReadingStatus.READING] || 0, color: '#d97706' },
    { name: 'Por Leer', value: statusCounts[ReadingStatus.TBR] || 0, color: '#64748b' },
  ].filter(d => d.value > 0);

  // Prepare Genre Data
  const genreCounts = books.reduce((acc, book) => {
    const genre = book.genre || 'Otros';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 5); // Top 5 genres

  const totalPages = books.reduce((acc, book) => {
      if (book.status === ReadingStatus.COMPLETED) return acc + book.totalPages;
      if (book.status === ReadingStatus.READING) return acc + book.currentPage;
      return acc;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 flex flex-wrap justify-around items-center gap-4">
         <div className="text-center">
            <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Libros Totales</p>
            <p className="text-4xl font-serif font-bold text-slate-800">{books.length}</p>
         </div>
         <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
         <div className="text-center">
            <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Páginas Leídas</p>
            <p className="text-4xl font-serif font-bold text-accent">{totalPages.toLocaleString()}</p>
         </div>
         <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
         <div className="text-center">
            <p className="text-slate-500 text-sm uppercase tracking-wider font-semibold">Completados</p>
            <p className="text-4xl font-serif font-bold text-green-600">{statusCounts[ReadingStatus.COMPLETED] || 0}</p>
         </div>
      </div>

      {/* Status Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
        <h3 className="text-slate-700 font-bold mb-4">Estado de Lectura</h3>
        {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                >
                {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
                <Tooltip />
            </PieChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Sin datos aún</div>
        )}
      </div>

      {/* Genre Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
        <h3 className="text-slate-700 font-bold mb-4">Géneros Favoritos</h3>
        {genreData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genreData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} interval={0} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#d97706" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
            </ResponsiveContainer>
        ) : (
             <div className="h-full flex items-center justify-center text-slate-400">Agrega libros para ver géneros</div>
        )}
      </div>
    </div>
  );
};

export default Statistics;