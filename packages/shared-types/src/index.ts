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

/**
 * Estado de una transición de etapa (ver `StageHistoryEntry`). Cada transición
 * se registra una sola vez: `completed` si se avanzó con normalidad desde esa
 * etapa, `cancelled` si el proceso se cerró/abortó estando en ella (ver ADR-013
 * en docs/architecture/README.md).
 */
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/** Rol de un referente técnico dentro de un proceso — ver regla "mínimo 1 principal + 1 validador" (ADR-013). */
export type ProcessReferentRole = 'principal' | 'validador';

// ─── Interview ────────────────────────────────────────────────────────────────

export type InterviewDuration = 30 | 45 | 60 | 90;

export type InterviewBlock = 'morning' | 'afternoon' | 'custom';

export type InterviewStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// ─── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackScore = 1 | 2 | 3 | 4 | 5;

export type FeedbackRecommendation = 'advance' | 'reject' | 'hold';

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
  /** Solo tiene sentido para `role: 'technical_ref'`. Taxonomía (texto libre vs. catálogo) — abierto, ver ADR-013. */
  specialty?: readonly string[];
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
  cvAnalysis?: CvAnalysisResult;
  processIds: string[];    // Puede estar en N procesos simultáneos — mantenido en sync con Process.candidateIds (ver ADR-013)
  createdAt: string;
  updatedAt: string;
}

/** Un referente técnico asignado a un proceso, con el rol que ocupa en él (ver ADR-013). */
export interface ProcessTechnicalRef {
  readonly userId: string;
  readonly roleInProcess: ProcessReferentRole;
}

export interface Process {
  id: string;
  title: string;
  clientName: string;
  recruiterId: string;
  /** Mínimo 1 `principal` + 1 `validador` — validado en el DTO de PROC-2, no por el tipo (ver ADR-013). */
  technicalRefs: readonly ProcessTechnicalRef[];
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
  status: StageStatus;
  changedAt: string;
  changedBy: string;
}

/** Un cambio de horario sobre una entrevista ya agendada (ver ADR-013). */
export interface InterviewRescheduleEvent {
  readonly previousScheduledAt: string;
  readonly changedAt: string;
  readonly changedBy: string;
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
  /**
   * Historial de reprogramaciones. Al reprogramar, `status` vuelve a `pending`
   * (limitación conocida: no distingue "nunca confirmada" de "reprogramada,
   * pendiente de reconfirmar" — la UI puede diferenciarlo revisando si este
   * array tiene elementos. Ver ADR-013).
   */
  rescheduleHistory?: readonly InterviewRescheduleEvent[];
  createdAt: string;
}

/**
 * Quién puede leer un `Feedback` es una regla de autorización estática (igual
 * para todo documento), no un dato persistido — por eso no hay un campo
 * `visibleTo` aquí. Escribe solo el referente autor (`referentId`); leen el
 * reclutador/PM del proceso, o el propio referente autor. Ver ADR-013.
 */
export interface Feedback {
  id: string;
  interviewId: string;      // 1:1 con la entrevista — único por diseño (ver ADR-013)
  referentId: string;
  candidateId: string;
  processId: string;
  technicalScore: FeedbackScore;
  softSkillsScore: FeedbackScore;
  recommendation: FeedbackRecommendation;
  comments: string;
  aiSuggestedTemplate?: string;
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

/** Un evento de envío de un `Report` a un destinatario (ver ADR-013 — cardinalidad abierta). */
export interface ReportSendEvent {
  sentAt: string;
  sentBy: string;
  sentTo: string;
}

/** Reporte ejecutivo de un candidato dentro de un proceso (ver REP-1 en ROADMAP.md). */
export interface Report {
  id: string;
  processId: string;
  candidateId: string;
  generatedBy: string;       // recruiterId
  generatedAt: string;
  pdfUrl: string;            // IBM COS
  sentHistory: readonly ReportSendEvent[];
  createdAt: string;
}

// ─── Análisis de CV (watsonx.ai) ──────────────────────────────────────────────
// Renombrado desde WatsonNLUResult/NLUEntity — Watson NLU fue reemplazado por
// watsonx.ai vía CvAnalysisPort (ver ADR-009 en docs/architecture/README.md).

export interface CvAnalysisResult {
  keywords: string[];
  entities: CvAnalysisEntity[];
  concepts: string[];
  categories: string[];
  analyzedAt: string;
}

export interface CvAnalysisEntity {
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
export * from './bench';
