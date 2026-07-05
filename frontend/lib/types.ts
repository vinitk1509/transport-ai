export interface AuditEntry {
  id: string
  action: string
  user: string
  timestamp: string
  note?: string
}

export interface Receipt {
  id: string
  uploadedAt: string
  processedAt: string
  consignor: string
  consignee: string
  source: string
  destination: string
  packages: number
  description: string
  amount: number
  confidence: { overall: number; fields: Record<string, number> }
  uploadedBy: string
  auditLog: AuditEntry[]
}

export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Operator'
  status: 'Active' | 'Inactive' | 'Pending'
  lastLogin: string
  avatar: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: string
}
