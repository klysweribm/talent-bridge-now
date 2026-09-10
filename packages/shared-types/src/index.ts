// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole = 'recruiter' | 'technical_ref' | 'pm';

// ─── Process Stages ───────────────────────────────────────────────────────────

export type ProcessStage =
  | 'initial'
  | 'first_interview'
  | 'technical_interview'
  | 'client_interview'
  | 'closure'
  | 'feedback';

export type ProcessStatus = 'active' | 'paused' | 'closed';

// ─── Interview ────────────────────────────────────────────────────────────────

export type InterviewDuration = 30 | 45 | 60 | 90;

export type InterviewBlock = 'morning' | 'afternoon' | 'custom';

export type InterviewStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// ─── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackScore = 1 | 2 | 3 | 4 | 5;

export type FeedbackRecommendation = 'advance' | 'reject' | 'hold';

export type FeedbackVisibility = 'recruiter' | 'pm';

// ─── Seniority ────────────────────────────────────────────────────────────────

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'architect';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  timezone: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  email: string;           // Campo único — identificador primario
  fullName: string;
  phone?: string;
  linkedIn?: string;
  cvUrl: string;           // URL en IBM COS
  cvAnalysis?: WatsonNLUResult;
  processIds: string[];    // Puede estar en N procesos simultáneos
  createdAt: string;
  updatedAt: string;
}

export interface Process {
  id: string;
  title: string;
  clientName: string;
  recruiterId: string;
  technicalRefIds: string[];  // Mínimo 2: principal + validador
  candidateIds: string[];
  currentStage: ProcessStage;
  stageHistory: StageHistoryEntry[];
  interviewDuration: InterviewDuration;
  requiredTechnologies: string[];
  seniority: SeniorityLevel;
  profileDescription?: string;
  clientExpectations?: string;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StageHistoryEntry {
  stage: ProcessStage;
  changedAt: string;
  changedBy: string;
}

export interface Interview {
  id: string;
  processId: string;
  candidateId: string;
  referentId: string;
  scheduledAt: string;      // ISO 8601
  duration: InterviewDuration;
  timezone: string;         // Timezone del referente — siempre visible
  block: InterviewBlock;
  status: InterviewStatus;
  icsExported: boolean;
  meetingLink?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  interviewId: string;
  referentId: string;
  candidateId: string;
  processId: string;
  technicalScore: FeedbackScore;
  softSkillsScore: FeedbackScore;
  recommendation: FeedbackRecommendation;
  comments: string;
  aiSuggestedTemplate?: string;
  visibleTo: FeedbackVisibility[];
  createdAt: string;
}

export interface TechnicalRefAvailability {
  userId: string;
  timezone: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  date: string;             // YYYY-MM-DD
  block: InterviewBlock;
  startTime: string;        // HH:mm (local del referente)
  endTime: string;          // HH:mm (local del referente)
  isAvailable: boolean;
}

// ─── Watson NLU ───────────────────────────────────────────────────────────────

export interface WatsonNLUResult {
  keywords: string[];
  entities: NLUEntity[];
  concepts: string[];
  categories: string[];
  analyzedAt: string;
}

export interface NLUEntity {
  type: string;
  text: string;
  relevance: number;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
