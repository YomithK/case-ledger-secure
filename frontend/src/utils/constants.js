export const ROLES = {
  ADMIN: 'ADMIN',
  NGO: 'NGO',
  INVESTIGATOR: 'INVESTIGATOR',
  VICTIM: 'VICTIM',
  USER: 'USER',
}

export const CASE_STATUS = {
  REPORTED: 'REPORTED',
  UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
  EVIDENCE_COLLECTED: 'EVIDENCE_COLLECTED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
}

export const CASE_STATUS_LABELS = {
  REPORTED: 'Reported',
  UNDER_INVESTIGATION: 'Under Investigation',
  EVIDENCE_COLLECTED: 'Evidence Collected',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
}

export const CASE_STATUS_COLORS = {
  REPORTED: 'bg-blue-100 text-blue-800',
  UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-800',
  EVIDENCE_COLLECTED: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
}

// Valid next statuses for each current status
export const VALID_STATUS_TRANSITIONS = {
  REPORTED: ['UNDER_INVESTIGATION', 'REJECTED'],
  UNDER_INVESTIGATION: ['EVIDENCE_COLLECTED', 'REJECTED'],
  EVIDENCE_COLLECTED: ['RESOLVED', 'REJECTED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
}

export const CASE_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
}

export const CASE_PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export const CASE_PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export const CASE_CATEGORIES = {
  CUSTODIAL_VIOLENCE: 'CUSTODIAL_VIOLENCE',
  DISCRIMINATION: 'DISCRIMINATION',
  UNLAWFUL_DETENTION: 'UNLAWFUL_DETENTION',
  FREEDOM_OF_EXPRESSION: 'FREEDOM_OF_EXPRESSION',
  LABOR_RIGHTS: 'LABOR_RIGHTS',
  OTHER: 'OTHER',
}

export const CASE_CATEGORY_LABELS = {
  CUSTODIAL_VIOLENCE: 'Custodial Violence',
  DISCRIMINATION: 'Discrimination',
  UNLAWFUL_DETENTION: 'Unlawful Detention',
  FREEDOM_OF_EXPRESSION: 'Freedom of Expression',
  LABOR_RIGHTS: 'Labor Rights',
  OTHER: 'Other',
}

export const CONFIDENTIAL_LEVELS = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
}

export const RELATED_USER_ROLES = {
  VICTIM: 'VICTIM',
  WITNESS: 'WITNESS',
  COMPLAINANT: 'COMPLAINANT',
}

export const EVIDENCE_TYPES = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  AUDIO: 'AUDIO',
}

export const EVIDENCE_TYPE_LABELS = {
  PHOTO: 'Photo',
  VIDEO: 'Video',
  DOCUMENT: 'Document',
  AUDIO: 'Audio',
}

export const ACCESS_LEVELS = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
}

export const REPORT_TYPES = {
  DASHBOARD: 'DASHBOARD',
  CASE_ANALYTICS: 'CASE_ANALYTICS',
  INVESTIGATOR: 'INVESTIGATOR',
  EVIDENCE: 'EVIDENCE',
  CUSTOM: 'CUSTOM',
}

export const LOCAL_STORAGE_TOKEN_KEY = 'cl_token'
export const LOCAL_STORAGE_USER_KEY = 'cl_user'

export const ACCEPTED_EVIDENCE_TYPES = '.jpg,.jpeg,.png,.pdf,.mp4'
export const MAX_EVIDENCE_FILE_SIZE_MB = 10
export const MAX_EVIDENCE_FILE_SIZE_BYTES = MAX_EVIDENCE_FILE_SIZE_MB * 1024 * 1024
