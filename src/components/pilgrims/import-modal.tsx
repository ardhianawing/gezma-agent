'use client';

import { useState, useRef, useCallback, DragEvent } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: ImportError[];
}

const FIELD_MAP: Record<string, string> = {
  nik: 'nik',
  name: 'name',
  nama: 'name',
  gender: 'gender',
  jenis_kelamin: 'gender',
  jeniskelamin: 'gender',
  birthplace: 'birthPlace',
  birth_place: 'birthPlace',
  tempat_lahir: 'birthPlace',
  tempatlahir: 'birthPlace',
  birthdate: 'birthDate',
  birth_date: 'birthDate',
  tanggal_lahir: 'birthDate',
  tanggallahir: 'birthDate',
  address: 'address',
  alamat: 'address',
  city: 'city',
  kota: 'city',
  province: 'province',
  provinsi: 'province',
  phone: 'phone',
  telepon: 'phone',
  hp: 'phone',
  no_hp: 'phone',
  email: 'email',
  whatsapp: 'whatsapp',
  wa: 'whatsapp',
  postalcode: 'postalCode',
  postal_code: 'postalCode',
  kode_pos: 'postalCode',
  kodepos: 'postalCode',
  emergencyname: 'emergencyName',
  emergency_name: 'emergencyName',
  nama_darurat: 'emergencyName',
  emergencyphone: 'emergencyPhone',
  emergency_phone: 'emergencyPhone',
  telepon_darurat: 'emergencyPhone',
  emergencyrelation: 'emergencyRelation',
  emergency_relation: 'emergencyRelation',
  hubungan_darurat: 'emergencyRelation',
  notes: 'notes',
  catatan: 'notes',
};

const TARGET_FIELDS = [
  { value: '', label: '-- Lewati --' },
  { value: 'nik', label: 'NIK' },
  { value: 'name', label: 'Nama' },
  { value: 'gender', label: 'Jenis Kelamin' },
  { value: 'birthPlace', label: 'Tempat Lahir' },
  { value: 'birthDate', label: 'Tanggal Lahir' },
  { value: 'address', label: 'Alamat' },
  { value: 'city', label: 'Kota' },
  { value: 'province', label: 'Provinsi' },
  { value: 'phone', label: 'Telepon' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'postalCode', label: 'Kode Pos' },
  { value: 'emergencyName', label: 'Nama Darurat' },
  { value: 'emergencyPhone', label: 'Telepon Darurat' },
  { value: 'emergencyRelation', label: 'Hubungan Darurat' },
  { value: 'notes', label: 'Catatan' },
];

const REQUIRED_FIELDS = ['nik', 'name', 'gender', 'birthPlace', 'birthDate', 'address', 'city', 'province', 'phone', 'email'];

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n');
  if (lines.length < 1) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1)
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      cells.push(current.trim());
      return cells;
    });
  return { headers, rows };
}

function autoMapHeaders(headers: string[]): Record<number, string> {
  const mapping: Record<number, string> = {};
  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().replace(/[\s\-]/g, '_').replace(/[^a-z0-9_]/g, '');
    if (FIELD_MAP[normalized]) {
      mapping[index] = FIELD_MAP[normalized];
    }
  });
  return mapping;
}

function generateTemplate(): string {
  return [
    'nik,name,gender,birthPlace,birthDate,address,city,province,phone,email,whatsapp,postalCode,emergencyName,emergencyPhone,emergencyRelation,notes',
    '3201234567890001,Ahmad Fauzi,male,Jakarta,1985-03-15,Jl. Merdeka No. 1,Jakarta Pusat,DKI Jakarta,081234567890,ahmad@email.com,6281234567890,10310,Fatimah,081234567891,Istri,Catatan contoh',
  ].join('\n');
}

export function ImportModal({ isOpen, onClose, onImported }: ImportModalProps) {
  const { c } = useTheme();
  const { isMobile } = useResponsive();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setSkipDuplicates(true);
    setImporting(false);
    setResult(null);
    setDragOver(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileSelected = useCallback((f: File) => {
    if (!f.name.endsWith('.csv')) {
      alert('Hanya file CSV yang diperbolehkan');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      const autoMapping = autoMapHeaders(parsed.headers);
      setMapping(autoMapping);
      setStep(2);
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelected(f);
  }, [handleFileSelected]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelected(f);
  }, [handleFileSelected]);

  const handleMappingChange = useCallback((colIndex: number, fieldValue: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (fieldValue === '') {
        delete next[colIndex];
      } else {
        next[colIndex] = fieldValue;
      }
      return next;
    });
  }, []);

  const mappedRequiredFields = new Set(Object.values(mapping).filter((v) => REQUIRED_FIELDS.includes(v)));
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedRequiredFields.has(f));

  const handleImport = useCallback(async () => {
    setImporting(true);
    setStep(3);

    // Build mapped rows
    const mappedRows = rows.map((row) => {
      const obj: Record<string, string> = {};
      for (const [colIndexStr, fieldName] of Object.entries(mapping)) {
        const colIndex = parseInt(colIndexStr);
        if (row[colIndex] !== undefined) {
          obj[fieldName] = row[colIndex];
        }
      }
      return obj;
    });

    try {
      const res = await fetch('/api/pilgrims/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows, skipDuplicates }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ imported: 0, skipped: 0, errors: [{ row: 0, field: '', message: data.error || 'Gagal import' }] });
      } else {
        setResult(data);
        if (data.imported > 0) {
          onImported();
        }
      }
    } catch {
      setResult({ imported: 0, skipped: 0, errors: [{ row: 0, field: '', message: 'Terjadi kesalahan jaringan' }] });
    } finally {
      setImporting(false);
    }
  }, [rows, mapping, skipDuplicates, onImported]);

  const handleDownloadTemplate = useCallback(() => {
    const csv = generateTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-jemaah.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!isOpen) return null;

  // Validate each preview row
  const validatePreviewRow = (row: string[]): boolean => {
    for (const reqField of REQUIRED_FIELDS) {
      const colIndex = Object.entries(mapping).find(([, v]) => v === reqField)?.[0];
      if (colIndex === undefined) return false;
      const val = row[parseInt(colIndex)];
      if (!val || val.trim() === '') return false;
    }
    // Check NIK format
    const nikColIndex = Object.entries(mapping).find(([, v]) => v === 'nik')?.[0];
    if (nikColIndex !== undefined) {
      const nik = row[parseInt(nikColIndex)];
      if (!/^\d{16}$/.test(nik?.trim() || '')) return false;
    }
    return true;
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: isMobile ? '16px' : '32px',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    borderRadius: '12px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: `1px solid ${c.border}`,
  };

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${c.border}`,
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: c.primary,
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  };

  const btnSecondary: React.CSSProperties = {
    backgroundColor: c.cardBg,
    color: c.textSecondary,
    fontSize: '14px',
    fontWeight: '500',
    padding: '10px 20px',
    borderRadius: '8px',
    border: `1px solid ${c.border}`,
    cursor: 'pointer',
  };

  // Step titles
  const stepTitles = ['', 'Upload File CSV', 'Preview & Mapping', 'Hasil Import'];

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: c.textPrimary }}>
              Import Jemaah
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textMuted }}>
              Langkah {step} dari 3 — {stepTitles[step]}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: c.textLight,
              padding: '4px',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: s <= step ? c.primary : c.border,
                  transition: 'background-color 0.2s',
                }}
              />
            ))}
          </div>

          {/* STEP 1: Upload */}
          {step === 1 && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? c.primary : c.border}`,
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: dragOver ? c.primaryLight : c.inputBg,
                  transition: 'all 0.2s',
                }}
              >
                <Upload style={{ width: '40px', height: '40px', color: c.textLight, margin: '0 auto 16px' }} />
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: c.textPrimary }}>
                  Tarik & lepas file CSV di sini
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: c.textMuted }}>
                  atau klik untuk pilih file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>

              {file && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '16px',
                    padding: '12px 16px',
                    backgroundColor: c.successLight,
                    borderRadius: '8px',
                  }}
                >
                  <FileText style={{ width: '20px', height: '20px', color: c.success }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>
                      {file.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: c.textMuted }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}

              {/* Download template */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  onClick={handleDownloadTemplate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: c.primary,
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '8px',
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Download Template CSV
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Mapping */}
          {step === 2 && (
            <div>
              {/* Stats */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: c.infoLight,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: c.textPrimary,
                  }}
                >
                  <strong>{rows.length}</strong> baris data
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: c.infoLight,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: c.textPrimary,
                  }}
                >
                  <strong>{headers.length}</strong> kolom
                </div>
              </div>

              {/* Column Mapping */}
              <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: c.textPrimary }}>
                Mapping Kolom
              </h3>

              {missingRequired.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: c.warningLight,
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: c.textPrimary,
                  }}
                >
                  <AlertCircle style={{ width: '16px', height: '16px', color: c.warning, flexShrink: 0, marginTop: '1px' }} />
                  <span>
                    Kolom wajib belum di-mapping:{' '}
                    <strong>{missingRequired.map((f) => TARGET_FIELDS.find((t) => t.value === f)?.label || f).join(', ')}</strong>
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {headers.map((header, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      backgroundColor: c.inputBg,
                      borderRadius: '8px',
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: '13px',
                        fontWeight: '500',
                        color: c.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {header}
                    </span>
                    <span style={{ fontSize: '13px', color: c.textLight }}>→</span>
                    <select
                      value={mapping[idx] || ''}
                      onChange={(e) => handleMappingChange(idx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${c.border}`,
                        backgroundColor: c.cardBg,
                        color: c.textPrimary,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {TARGET_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview Table */}
              <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: c.textPrimary }}>
                Preview Data (5 baris pertama)
              </h3>
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${c.border}` }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', backgroundColor: c.inputBg, textAlign: 'left', color: c.textMuted, fontWeight: '600', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
                        #
                      </th>
                      {headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: c.inputBg,
                            textAlign: 'left',
                            color: mapping[i] ? c.textPrimary : c.textLight,
                            fontWeight: '600',
                            borderBottom: `1px solid ${c.border}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mapping[i]
                            ? TARGET_FIELDS.find((f) => f.value === mapping[i])?.label || h
                            : h}
                        </th>
                      ))}
                      <th style={{ padding: '8px 12px', backgroundColor: c.inputBg, textAlign: 'center', color: c.textMuted, fontWeight: '600', borderBottom: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
                        Valid
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, rowIdx) => {
                      const isValid = validatePreviewRow(row);
                      return (
                        <tr key={rowIdx}>
                          <td style={{ padding: '8px 12px', borderBottom: `1px solid ${c.border}`, color: c.textMuted }}>
                            {rowIdx + 1}
                          </td>
                          {headers.map((_, colIdx) => (
                            <td
                              key={colIdx}
                              style={{
                                padding: '8px 12px',
                                borderBottom: `1px solid ${c.border}`,
                                color: c.textPrimary,
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {row[colIdx] || '-'}
                            </td>
                          ))}
                          <td style={{ padding: '8px 12px', borderBottom: `1px solid ${c.border}`, textAlign: 'center' }}>
                            {isValid ? (
                              <CheckCircle style={{ width: '16px', height: '16px', color: c.success }} />
                            ) : (
                              <AlertCircle style={{ width: '16px', height: '16px', color: c.error }} />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Skip duplicates checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '20px',
                  fontSize: '14px',
                  color: c.textSecondary,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: c.primary, cursor: 'pointer' }}
                />
                Lewati duplikat NIK (jika NIK sudah terdaftar, baris akan dilewati)
              </label>
            </div>
          )}

          {/* STEP 3: Results */}
          {step === 3 && (
            <div>
              {importing ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Loader2
                    style={{
                      width: '40px',
                      height: '40px',
                      color: c.primary,
                      margin: '0 auto 16px',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: c.textPrimary }}>
                    Mengimport data jemaah...
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '13px', color: c.textMuted }}>
                    Mohon tunggu, sedang memproses {rows.length} baris data
                  </p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : result ? (
                <div>
                  {/* Summary cards */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '16px',
                        backgroundColor: c.successLight,
                        borderRadius: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: c.success }}>
                        {result.imported}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textMuted }}>
                        Berhasil
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '16px',
                        backgroundColor: c.warningLight,
                        borderRadius: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: c.warning }}>
                        {result.skipped}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textMuted }}>
                        Dilewati
                      </p>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        minWidth: '120px',
                        padding: '16px',
                        backgroundColor: c.errorLight,
                        borderRadius: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: c.error }}>
                        {result.errors.length}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: c.textMuted }}>
                        Gagal
                      </p>
                    </div>
                  </div>

                  {/* Error details */}
                  {result.errors.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: c.textPrimary }}>
                        Detail Error
                      </h3>
                      <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${c.border}` }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '10px 12px', backgroundColor: c.inputBg, textAlign: 'left', color: c.textMuted, fontWeight: '600', borderBottom: `1px solid ${c.border}` }}>
                                Baris
                              </th>
                              <th style={{ padding: '10px 12px', backgroundColor: c.inputBg, textAlign: 'left', color: c.textMuted, fontWeight: '600', borderBottom: `1px solid ${c.border}` }}>
                                Kolom
                              </th>
                              <th style={{ padding: '10px 12px', backgroundColor: c.inputBg, textAlign: 'left', color: c.textMuted, fontWeight: '600', borderBottom: `1px solid ${c.border}` }}>
                                Error
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.errors.slice(0, 50).map((err, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: '8px 12px', borderBottom: `1px solid ${c.border}`, color: c.textPrimary }}>
                                  {err.row || '-'}
                                </td>
                                <td style={{ padding: '8px 12px', borderBottom: `1px solid ${c.border}`, color: c.textPrimary }}>
                                  {TARGET_FIELDS.find((f) => f.value === err.field)?.label || err.field || '-'}
                                </td>
                                <td style={{ padding: '8px 12px', borderBottom: `1px solid ${c.border}`, color: c.error }}>
                                  {err.message}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {result.errors.length > 50 && (
                        <p style={{ margin: '8px 0 0', fontSize: '12px', color: c.textMuted }}>
                          Menampilkan 50 dari {result.errors.length} error
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          {step === 1 && (
            <button onClick={handleClose} style={btnSecondary}>
              Batal
            </button>
          )}

          {step === 2 && (
            <>
              <button onClick={() => { reset(); }} style={btnSecondary}>
                Kembali
              </button>
              <button
                onClick={handleImport}
                disabled={missingRequired.length > 0 || rows.length === 0}
                style={{
                  ...btnPrimary,
                  opacity: missingRequired.length > 0 || rows.length === 0 ? 0.5 : 1,
                  cursor: missingRequired.length > 0 || rows.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Import {rows.length} Data
              </button>
            </>
          )}

          {step === 3 && !importing && (
            <button onClick={handleClose} style={btnPrimary}>
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
