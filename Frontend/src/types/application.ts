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
  isRemote: boolean | null
  salaryMin: number | null
  salaryMax: number | null
}

export interface Application {
  id: string
  companyName: string | null
  jobTitle: string | null
  parsedData: ParsedApplicationData | null
  matchScore: number | null
  status: ApplicationStatus
  appliedAt: string | null
  createdAt: string
  jobDescriptionRaw: string
}

export interface CreateApplicationRequest {
  jobDescriptionRaw: string
}
