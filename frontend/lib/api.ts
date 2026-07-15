const PROXY_URL = '/api/proxy';
const AUTH_URL = '/api/auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Operator';
  avatar: string;
  company: string;
}

export interface AuthResponse {
  token?: string; // no longer heavily used on client since cookie handles it
  user: AuthUser;
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
    const res = await fetch(`${PROXY_URL}/auth/verification/request`, {
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
    const res = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Signup failed');
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Invalid credentials'));
    return res.json();
  },

  async me(): Promise<AuthUser> {
    const res = await fetch(`${AUTH_URL}/me`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  async logout(): Promise<void> {
    await fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
    });
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${PROXY_URL}/auth/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to update password'));
  },

  async updateProfile(data: { company?: string; firstName?: string; lastName?: string }): Promise<AuthUser> {
    const res = await fetch(`${PROXY_URL}/auth/me/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to update profile'));
    return res.json();
  },

  async updateAvatar(file: File): Promise<AuthUser> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${PROXY_URL}/auth/me/avatar`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to update avatar'));
    const data = await res.json();
    return data;
  },

  async getReceipts(): Promise<BackendReceipt[]> {
    const res = await fetch(`${PROXY_URL}/receipts?size=0`, {
      headers: { 'X-Transporter-ID': '1' },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch receipts');
    return res.json();
  },

  async getPaginatedReceipts(
    page: number, 
    size: number = 20, 
    filters?: { search?: string, source?: string, dateFilter?: string }
  ): Promise<{ content: BackendReceipt[]; totalElements: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (filters?.search) params.append('search', filters.search);
    if (filters?.source && filters.source !== 'all') params.append('source', filters.source);
    if (filters?.dateFilter) params.append('dateFilter', filters.dateFilter);
    
    const res = await fetch(`${PROXY_URL}/receipts?${params.toString()}`, {
      headers: { 'X-Transporter-ID': '1' },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch paginated receipts');
    return res.json();
  },

  async getReceipt(id: string): Promise<BackendReceipt> {
    const res = await fetch(`${PROXY_URL}/receipts/${id}`, {
      headers: { 'X-Transporter-ID': '1' },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Failed to fetch receipt');
    return res.json();
  },

  async uploadReceipt(file: File): Promise<BackendReceipt> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${PROXY_URL}/receipts/upload`, {
      method: 'POST',
      headers: { 'X-Transporter-ID': '1' },
      body: formData,
    });
    
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async uploadReceipts(files: File[]): Promise<BackendReceipt[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${PROXY_URL}/receipts/upload/batch`, {
      method: 'POST',
      headers: { 'X-Transporter-ID': '1' },
      body: formData,
    });

    if (!res.ok) throw new Error(await responseMessage(res, 'Batch upload failed'));
    return res.json();
  },

  async createManualReceipt(data: Partial<BackendReceipt>): Promise<BackendReceipt> {
    const res = await fetch(`${PROXY_URL}/receipts/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await responseMessage(res, 'Failed to create receipt'));
    return res.json();
  },

  async updateReceipt(id: string, data: Partial<BackendReceipt>): Promise<BackendReceipt> {
    const res = await fetch(`${PROXY_URL}/receipts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Transporter-ID': '1',
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update receipt');
    return res.json();
  },

  async exportReceipt(extractedJsonString: string): Promise<Blob> {
    const res = await fetch(`${PROXY_URL}/receipts/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Transporter-ID': '1',
      },
      body: extractedJsonString
    });
    if (!res.ok) throw new Error('Failed to export');
    return res.blob();
  },

  async exportReceiptById(id: string): Promise<Blob> {
    const res = await fetch(`${PROXY_URL}/receipts/${id}/export`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to export');
    return res.blob();
  },

  async exportReceiptsBulk(ids: string[]): Promise<Blob> {
    const res = await fetch(`${PROXY_URL}/receipts/export/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to export receipts');
    return res.blob();
  },

  async exportAllReceipts(): Promise<Blob> {
    const res = await fetch(`${PROXY_URL}/receipts/export/all`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to export all bilties');
    return res.blob();
  },

  async deleteReceipt(id: string): Promise<void> {
    const res = await fetch(`${PROXY_URL}/receipts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete receipt');
  },

  async deleteReceipts(ids: string[]): Promise<void> {
    const res = await fetch(`${PROXY_URL}/receipts/delete-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Failed to delete receipts');
  },

  receiptFileUrl(id: string): string {
    return `/api/proxy/receipts/${id}/file`;
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
