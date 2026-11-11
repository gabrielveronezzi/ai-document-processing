export type DocumentStatus = 'Processing' | 'Completed' | 'Failed'

export interface DocumentItem {
  id: string
  fileName: string
  fileSize: number
  status: DocumentStatus
  createdAtUtc: string
  extractedDataJson: string | null
  errorMessage: string | null
}

const request = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, init)
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error || `Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

export const listDocuments = () => request<DocumentItem[]>('/api/documents')

export const uploadDocument = (file: File) => {
  const data = new FormData()
  data.append('file', file)
  return request<DocumentItem>('/api/documents', { method: 'POST', body: data })
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}