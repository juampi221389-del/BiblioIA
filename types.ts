export enum ReadingStatus {
  READING = 'reading',
  COMPLETED = 'completed',
  TBR = 'tbr', // To Be Read
}

export interface BookAnalysis {
  summary: string;
  themes: string[];
  mainCharacters: string[];
  literaryStyle: string;
  moodColor: string; // Hex code suggested by AI
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: ReadingStatus;
  totalPages: number;
  currentPage: number;
  coverPlaceholder: number; // For picsum
  addedAt: number;
  analysis?: BookAnalysis;
  genre?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}