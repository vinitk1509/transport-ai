const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Operator';
  avatar: string;
  company: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('transportai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface BackendReceipt {
  id: string;
  uploadedAt: string;
  processedAt: string;
  uploadedBy: string;
  grNumber?: string;
  consignor: string;
  consignee: string;
  source: string;
  destination: string;
  biltyDate?: string;
  packages: number;
  material?: string;
  description: string;
  charges?: number;
  amount: number;
  confidenceOverall: number;
  extractedJson: string;
  originalFilename?: string;
  storedFilename?: string;
  contentType?: string;
  rejectionReason?: string;
  privateMarka?: string;
}

export const api = {
  async requestVerification(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/verification/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Failed to send verification code');
    return res.json();
  },

  async signup(data: {
    firstName: string;
    lastName: string;
    company: string;
    email: string;
    password: string;
    code: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async me(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to update password'));
  },

  async updateAvatar(file: File): Promise<AuthUser> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/auth/me/avatar`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to update avatar'));
    const data = await res.json();
    return data;
  },

  async getReceipts(): Promise<BackendReceipt[]> {
    const res = await fetch(`${API_BASE_URL}/receipts`, {
      headers: { 'X-Transporter-ID': '1', ...authHeaders() },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch receipts');
    return res.json();
  },

  async getReceipt(id: string): Promise<BackendReceipt> {
    const res = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      headers: { 'X-Transporter-ID': '1', ...authHeaders() },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch receipt');
    return res.json();
  },

  async uploadReceipt(file: File): Promise<BackendReceipt> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/receipts/upload`, {
      method: 'POST',
      headers: { 'X-Transporter-ID': '1', ...authHeaders() },
      body: formData,
    });
    
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async uploadReceipts(files: File[]): Promise<BackendReceipt[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${API_BASE_URL}/receipts/upload/batch`, {
      method: 'POST',
      headers: { 'X-Transporter-ID': '1', ...authHeaders() },
      body: formData,
    });

    if (!res.ok) throw new Error(await responseMessage(res, 'Batch upload failed'));
    return res.json();
  },

  async createManualReceipt(data: Partial<BackendReceipt>): Promise<BackendReceipt> {
    const res = await fetch(`${API_BASE_URL}/receipts/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to create receipt'));
    return res.json();
  },

  async updateReceipt(id: string, data: Partial<BackendReceipt>): Promise<BackendReceipt> {
    const res = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Transporter-ID': '1',
        ...authHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update receipt');
    return res.json();
  },

  async exportReceipt(extractedJsonString: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/receipts/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Transporter-ID': '1',
        ...authHeaders()
      },
      body: extractedJsonString // Pass the raw extracted JSON string
    });
    if (!res.ok) throw new Error('Failed to export');
    return res.blob();
  },

  async exportReceiptById(id: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/receipts/${id}/export`, {
      headers: { ...authHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to export');
    return res.blob();
  },

  async exportReceiptsBulk(ids: string[]): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/receipts/export/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to export receipts');
    return res.blob();
  },

  async exportAllReceipts(): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/receipts/export/all`, {
      headers: { ...authHeaders() },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to export all bilties');
    return res.blob();
  },

  async deleteReceipt(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete receipt');
  },

  async deleteReceipts(ids: string[]): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/receipts/delete-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to delete receipts');
  },

  receiptFileUrl(id: string): string {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('transportai_token') : '';
    return `${API_BASE_URL}/receipts/${id}/file?token=${encodeURIComponent(token || '')}`;
  }
};

async function responseMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}
