import { useMemo, useState } from 'react'
import QRCode from 'qrcode'

const initialForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  company: '',
  role: '',
  website: '',
  address: '',
  note: '',
}

function escapeVCard(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [qrCode, setQrCode] = useState('')

  const fullName = useMemo(() => {
    return [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
  }, [form.firstName, form.lastName])

  const vcard = useMemo(() => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${escapeVCard(form.lastName)};${escapeVCard(form.firstName)};;;`,
      `FN:${escapeVCard(fullName)}`,
    ]

    if (form.company) lines.push(`ORG:${escapeVCard(form.company)}`)
    if (form.role) lines.push(`TITLE:${escapeVCard(form.role)}`)
    if (form.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(form.phone)}`)
    if (form.email) lines.push(`EMAIL:${escapeVCard(form.email)}`)
    if (form.website) lines.push(`URL:${escapeVCard(form.website)}`)
    if (form.address) lines.push(`ADR:;;${escapeVCard(form.address)};;;;`)
    if (form.note) lines.push(`NOTE:${escapeVCard(form.note)}`)

    lines.push('END:VCARD')
    return lines.join('\n')
  }, [form, fullName])

  async function generateQr() {
    if (!fullName || (!form.phone && !form.email)) {
      alert('Please include at least your full name and a contact number (phone number or email address).')
      return
    }

    const dataUrl = await QRCode.toDataURL(vcard, {
      width: 360,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })

    setQrCode(dataUrl)
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function downloadVCard() {
    const filename = `${fullName || 'contatto'}.vcf`.replace(/\s+/g, '-').toLowerCase()
    downloadFile(vcard, filename, 'text/vcard;charset=utf-8')
  }

  function downloadQr() {
    if (!qrCode) return
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `${fullName || 'qrcode-contatto'}.png`.replace(/\s+/g, '-').toLowerCase()
    link.click()
  }

  const fields = [
    ['firstName', 'First Name'],
    ['lastName', 'Last name'],
    ['phone', 'Phone'],
    ['email', 'Email'],
    ['company', 'Company'],
    ['role', 'Role'],
    ['website', 'Website'],
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
              <h1 className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-teal-700">vCard generator</h1>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(([key, label]) => (
              <div key={key} className={key === 'website' ? 'md:col-span-2' : ''}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  type={key === 'email' ? 'email' : key === 'website' ? 'url' : 'text'}
                  value={form[key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`Insert ${label.toLowerCase()}`}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                rows="3"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Address"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="note">Notes</label>
              <textarea
                id="note"
                rows="4"
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Additional information"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={generateQr}
              className="rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Generate QR code
            </button>
            <button
              onClick={downloadVCard}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Download vcf
            </button>
            <button
              onClick={() => setForm(initialForm)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft sm:p-8">
          <h2 className="text-xl font-semibold">Preview</h2>

          <div className="mt-6 rounded-3xl bg-white p-5 text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Contact</p>
            <h3 className="mt-3 text-2xl font-bold">{fullName || 'Full name'}</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>{form.role || 'Role'}</p>
              <p>{form.company || 'Company'}</p>
              <p>{form.phone || 'Phone'}</p>
              <p>{form.email || 'Email'}</p>
              <p className="break-all">{form.website || 'Website'}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">QR code</h3>
                <p className="mt-1 text-sm text-slate-300">Download to import contact</p>
              </div>
              {qrCode && (
                <button
                  onClick={downloadQr}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Download PNG
                </button>
              )}
            </div>

            <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-900/40 p-6">
                <img src={qrCode} alt="QR code della vCard" className="h-auto w-full max-w-[280px] rounded-2xl bg-white p-3" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default App
