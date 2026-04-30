export type ApplicationStatus =
  | 'Saved'
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'

export interface ParsedApplicationData {
  stack: string[] | null
  seniorityLevel: string | null
  remotePolicy: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  location: string | null
  postedAt: string | null
}

export interface DocumentDto {
  id: string
  type: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface StatusHistoryDto {
  id: string
  fromStatus: string | null
  toStatus: string
  changedAt: string
  note: string | null
}

export interface ReminderDto {
  id: string
  type: string
  scheduledFor: string
  sentAt: string | null
  status: string
  createdAt: string
}

export interface Application {
  id: string
  companyName: string | null
  jobTitle: string | null
  parsedData: ParsedApplicationData | null
  matchScore: number | null
  matchExplanation: string | null
  status: ApplicationStatus
  appliedAt: string | null
  createdAt: string
  jobDescriptionRaw: string
}

export interface ApplicationDetail extends Application {
  documents: DocumentDto[]
  statusHistory: StatusHistoryDto[]
  reminders: ReminderDto[]
}

export interface CreateApplicationRequest {
  jobDescriptionRaw: string
}
