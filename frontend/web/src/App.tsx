import { useEffect, useMemo, useRef, useState } from 'react'
import { Activity, AlertCircle, Check, CheckCircle2, ChevronRight, Clock3, CloudUpload, FileText, Files, RefreshCw, ShieldCheck, Sparkles, X } from 'lucide-react'
import { formatBytes, listDocuments, uploadDocument, type DocumentItem } from './api'

const statusLabel: Record<DocumentItem['status'], string> = {
  Completed: 'Completed',
  Processing: 'Processing',
  Failed: 'Failed',
}

function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(
    () => documents.find((item) => item.id === selectedId) ?? documents[0] ?? null,
    [documents, selectedId],
  )

  const refresh = async () => {
    try {
      const result = await listDocuments()
      setDocuments(result)
      setSelectedId((current) => current && result.some((item) => item.id === current) ? current : result[0]?.id ?? null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load documents.')
    }
  }

  useEffect(() => { void refresh() }, [])

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf') || file.type && file.type !== 'application/pdf') {
      setError('Please select a PDF file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('The maximum file size is 10 MB.')
      return
    }
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const created = await uploadDocument(file)
      setDocuments((current) => [created, ...current.filter((item) => item.id !== created.id)])
      setSelectedId(created.id)
      if (created.status === 'Completed') {
        setSuccess('Your document has been processed.')
      } else if (created.status === 'Failed') {
        setError(created.errorMessage || 'Document processing failed.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const extracted = useMemo(() => {
    if (!selected?.extractedDataJson) return null
    try { return JSON.parse(selected.extractedDataJson) as Record<string, unknown> }
    catch { return null }
  }, [selected])

  const extractedFields = useMemo(() => {
    if (!extracted) return null
    const fields = extracted.fields
    if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
      return fields as Record<string, unknown>
    }
    return Object.fromEntries(
      Object.entries(extracted).filter(([key]) =>
        !['document_id', 'provider', 'document_type', 'text_length', 'raw_text'].includes(key),
      ),
    )
  }, [extracted])

  const completedCount = documents.filter((item) => item.status === 'Completed').length
  const failedCount = documents.filter((item) => item.status === 'Failed').length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={19} /></div><span>docuflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><Files size={18} /> Documents <span className="nav-count">{documents.length}</span></button>
        <div className="sidebar-bottom">
          <div className="privacy-card"><ShieldCheck size={18} /><div><strong>Private workspace</strong><span>Files stay in your environment.</span></div></div>
          <div className="profile"><div className="avatar">GV</div><div><strong>Personal workspace</strong><span>Local development</span></div></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>Documents</strong></div><div className="topbar-right"><span className="environment"><span /> Local environment</span><button className="icon-button" onClick={() => void refresh()} aria-label="Refresh documents"><RefreshCw size={17} /></button></div></header>
        <div className="page">
          <section className="page-heading"><div><div className="eyebrow">DOCUMENT INTELLIGENCE</div><h1>Documents</h1><p>Upload, process and review structured information from your PDFs.</p></div><button className="primary-button" onClick={() => inputRef.current?.click()} disabled={busy}><CloudUpload size={17} /> Upload PDF</button></section>

          <section className="stats-grid">
            <div className="stat-card"><div className="stat-icon neutral"><Files size={18} /></div><div><span>Total documents</span><strong>{documents.length}</strong></div><small>In this workspace</small></div>
            <div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={18} /></div><div><span>Completed</span><strong>{completedCount}</strong></div><small>Successfully processed</small></div>
            <div className="stat-card"><div className="stat-icon amber"><Activity size={18} /></div><div><span>Needs attention</span><strong>{failedCount}</strong></div><small>Failed processing</small></div>
          </section>

          <section className="content-grid">
            <div className="panel documents-panel">
              <div className="panel-heading"><div><h2>All documents</h2><p>Your recent uploads and processing history</p></div><button className="text-button" onClick={() => void refresh()}><RefreshCw size={14} /> Refresh</button></div>
              <div className={`dropzone ${dragging ? 'dragging' : ''} ${busy ? 'busy' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void handleFiles(event.dataTransfer.files) }} onClick={() => !busy && inputRef.current?.click()}>
                <input ref={inputRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => event.target.files && void handleFiles(event.target.files)} />
                <div className="upload-icon"><CloudUpload size={21} /></div><div><strong>{busy ? 'Uploading and processing…' : 'Drop your PDF here or browse'}</strong><span>PDF files only · Up to 10 MB</span></div><button className="browse-button" type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click() }} disabled={busy}>Browse files</button>
              </div>
              {error && <div className="notice error"><AlertCircle size={16} />{error}<button onClick={() => setError('')} aria-label="Dismiss"><X size={15} /></button></div>}
              {success && <div className="notice success"><Check size={16} />{success}<button onClick={() => setSuccess('')} aria-label="Dismiss"><X size={15} /></button></div>}
              <div className="document-list">
                {documents.length === 0 ? <div className="empty-state"><div className="empty-icon"><FileText size={24} /></div><strong>No documents yet</strong><span>Upload your first PDF to see extracted information here.</span></div> : documents.map((doc) => (
                  <button key={doc.id} className={`document-row ${selected?.id === doc.id ? 'selected' : ''}`} onClick={() => setSelectedId(doc.id)}>
                    <div className="file-icon"><FileText size={19} /></div><div className="file-info"><strong title={doc.fileName}>{doc.fileName}</strong><span>{formatBytes(doc.fileSize)} <i /> {new Date(doc.createdAtUtc).toLocaleString()}</span></div><span className={`status status-${doc.status.toLowerCase()}`}>{doc.status === 'Completed' ? <CheckCircle2 size={13} /> : doc.status === 'Failed' ? <AlertCircle size={13} /> : <Clock3 size={13} />}{statusLabel[doc.status]}</span><ChevronRight className="row-chevron" size={16} />
                  </button>
                ))}
              </div>
            </div>

            <aside className="panel detail-panel">
              <div className="panel-heading"><div><h2>Document details</h2><p>Extraction overview</p></div></div>
              {selected ? <div className="detail-content">
                <div className="detail-file"><div className="file-icon large"><FileText size={22} /></div><div><strong>{selected.fileName}</strong><span>{formatBytes(selected.fileSize)} · PDF document</span></div></div>
                <div className="detail-section"><div className="section-title">PROCESSING STATUS</div><span className={`status status-${selected.status.toLowerCase()}`}>{selected.status === 'Completed' ? <CheckCircle2 size={13} /> : selected.status === 'Failed' ? <AlertCircle size={13} /> : <Clock3 size={13} />}{statusLabel[selected.status]}</span>{selected.errorMessage && <p className="error-copy">{selected.errorMessage}</p>}</div>
                <div className="detail-section"><div className="section-title">EXTRACTED FIELDS</div>{extractedFields && Object.keys(extractedFields).length > 0 ? <div className="field-list">{Object.entries(extractedFields).map(([key, value]) => <div className="field-row" key={key}><span>{key.replace(/_/g, ' ')}</span><strong>{value === null || value === undefined || value === '' ? '—' : String(value)}</strong></div>)}</div> : <div className="no-data"><Sparkles size={17} /><span>{selected.status === 'Failed' ? 'No extraction data available.' : selected.status === 'Processing' ? 'Extraction is in progress.' : 'No structured fields were returned.'}</span></div>}</div>
                <div className="detail-footer"><span>Uploaded</span><strong>{new Date(selected.createdAtUtc).toLocaleString()}</strong></div>
              </div> : <div className="empty-detail"><div className="empty-icon"><FileText size={24} /></div><strong>Select a document</strong><span>Choose a file from the list to inspect its extracted fields.</span></div>}
            </aside>
          </section>
          <footer className="page-footer"><span>DocuFlow <i /> AI Document Processing MVP</span><span>Built for structured document workflows</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App