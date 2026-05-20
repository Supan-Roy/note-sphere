export type NoteType = "pdf" | "image" | "audio" | "text";

export interface Note {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  type: NoteType;
  content: string;
  rawText?: string;
  storageUrl?: string;
  tags: string[];
  isPublic: boolean;
  category?: string;
  aiAnalysis?: {
    summary: string;
    keyConcepts: string[];
    scores: {
      knowledge: number;
      readability: number;
      completeness: number;
      examReadiness: number;
    };
    missingTopics: string[];
  };
  likesCount: number;
  bookmarksCount: number;
  createdAt: any;
  updatedAt: any;
  courseId?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  stats: {
    notesCount: number;
    likesCount: number;
    bookmarksCount: number;
  };
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: any;
}

export interface Comment {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  text: string;
  aiAssistantDraft?: string;
  createdAt: any;
}

// Feature 1: Semester Builder Types
export interface Course {
  id: string;
  name: string;
  code?: string;
  materials?: CourseMaterial[];
}

export type CourseMaterialType = "note" | "file";

export interface CourseMaterial {
  id: string;
  name: string;
  type: CourseMaterialType;
  fileType?: string;
  sizeLabel?: string;
  uploadedAt: any;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  notes: string;
  createdAt: any;
}

// Feature 2: Sharing Room Types
export interface Room {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  members: string[];
  isPublic: boolean;
  code?: string;
  createdAt: any;
  sharedNotes?: any[];
  subRooms?: any[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export type SearchResultType = "note" | "room" | "task" | "semester";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  ref?: any;
}
