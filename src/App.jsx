import { useMemo, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";

const initialForm = {
  firstName: "",
  lastName: "",
  phonePrefix: "+39",
  phone: "",
  email: "",
  company: "",
  role: "",
  website: "",
  address: "",
  note: "",
};

const phonePrefixes = [
  { value: "+39", label: "🇮🇹 +39" },
  { value: "+41", label: "🇨🇭 +41" },
  { value: "+33", label: "🇫🇷 +33" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+34", label: "🇪🇸 +34" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+1", label: "🇺🇸 +1" },
];

function escapeVCard(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function isHexColor(value) {
  return /^#([0-9A-Fa-f]{6})$/.test(value);
}

function normalizeHexInput(value) {
  let next = value.trim();

  if (!next.startsWith("#")) {
    next = `#${next}`;
  }

  next = `#${next.slice(1).replace(/[^0-9A-Fa-f]/g, "").slice(0, 6)}`;
  return next;
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [qrVisible, setQrVisible] = useState(false);
  const [qrColor, setQrColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoImage, setLogoImage] = useState("");
  const [logoName, setLogoName] = useState("");
  const qrRef = useRef(null);

  const fieldClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

  const darkFieldClass =
    "w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-slate-100 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

  const selectClass = `${fieldClass} appearance-none pr-10`;

  const fullName = useMemo(() => {
    return [form.firstName, form.lastName].filter(Boolean).join(" ").trim();
  }, [form.firstName, form.lastName]);

  const fullPhone = useMemo(() => {
    if (!form.phone) return "";
    return `${form.phonePrefix} ${form.phone}`.trim();
  }, [form.phonePrefix, form.phone]);

  const vcard = useMemo(() => {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCard(form.lastName)};${escapeVCard(form.firstName)};;;`,
      `FN:${escapeVCard(fullName)}`,
    ];

    if (form.company) lines.push(`ORG:${escapeVCard(form.company)}`);
    if (form.role) lines.push(`TITLE:${escapeVCard(form.role)}`);
    if (fullPhone) lines.push(`TEL;TYPE=CELL:${escapeVCard(fullPhone)}`);
    if (form.email) lines.push(`EMAIL:${escapeVCard(form.email)}`);
    if (form.website) lines.push(`URL:${escapeVCard(form.website)}`);
    if (form.address) lines.push(`ADR:;;${escapeVCard(form.address)};;;;`);
    if (form.note) lines.push(`NOTE:${escapeVCard(form.note)}`);

    lines.push("END:VCARD");
    return lines.join("\n");
  }, [form, fullName, fullPhone]);

  function generateQr() {
    if (!fullName || (!form.phone && !form.email)) {
      alert(
        "Please include at least your full name and a contact number (phone number or email address)."
      );
      return;
    }

    setQrVisible(true);
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadVCard() {
    const filename = `${fullName || "contatto"}.vcf`
      .replace(/\s+/g, "-")
      .toLowerCase();

    downloadFile(vcard, filename, "text/vcard;charset=utf-8");
  }

  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setLogoImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoImage("");
    setLogoName("");
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${fullName || "qrcode-contatto"}-qr.png`
      .replace(/\s+/g, "-")
      .toLowerCase();
    link.click();
  }

  function handleHexInput(setter, value) {
    setter(normalizeHexInput(value));
  }

  function handleHexBlur(setter, value, fallback) {
    if (isHexColor(value)) {
      setter(value.toLowerCase());
    } else {
      setter(fallback);
    }
  }

  const fields = [
    ["firstName", "First Name"],
    ["lastName", "Last name"],
    ["email", "Email"],
    ["company", "Company"],
    ["role", "Role"],
    ["website", "Website"],
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <h1 className="mb-2 inline-flex rounded-full bg-teal-50 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-teal-700">
              vCard generator
            </h1>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {fields.map(([key, label]) => (
              <div
                key={key}
                className={
                  key === "website" || key === "email" ? "md:col-span-2" : ""
                }
              >
                <label
                  htmlFor={key}
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                <input
                  id={key}
                  type={
                    key === "email"
                      ? "email"
                      : key === "website"
                        ? "url"
                        : "text"
                  }
                  value={form[key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  placeholder={`Insert ${label.toLowerCase()}`}
                  className={fieldClass}
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>

              <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                <div className="relative">
                  <select
                    id="phonePrefix"
                    value={form.phonePrefix}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        phonePrefix: e.target.value,
                      }))
                    }
                    className={selectClass}
                  >
                    {phonePrefixes.map((prefix) => (
                      <option key={prefix.value} value={prefix.value}>
                        {prefix.label}
                      </option>
                    ))}
                  </select>

                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <input
                  id="phone"
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Insert phone number"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Insert address"
                className={fieldClass}
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="note"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Notes
              </label>
              <textarea
                id="note"
                rows="10"
                value={form.note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Additional information"
                className={fieldClass}
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
              onClick={() => {
                setForm(initialForm);
                setQrVisible(false);
                setLogoImage("");
                setLogoName("");
                setQrColor("#0f172a");
                setBgColor("#ffffff");
              }}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft sm:p-8">
          <h2 className="text-xl font-semibold">Preview</h2>

          <div className="mt-6 rounded-3xl bg-white p-5 text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              Contact
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              {fullName || "Full name"}
            </h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>{form.role || "Role"}</p>
              <p>{form.company || "Company"}</p>
              <p>{fullPhone || "Phone"}</p>
              <p>{form.email || "Email"}</p>
              <p className="break-all">{form.website || "Website"}</p>
              <p>{form.address || "Address"}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">QR code</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Download to import contact
                </p>
              </div>

              {qrVisible && (
                <button
                  onClick={downloadQr}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Download PNG
                </button>
              )}
            </div>

            <div className="mt-5 flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-900/40 p-6">
              {qrVisible ? (
                <div ref={qrRef} className="rounded-2xl bg-white p-3">
                  <QRCode
                    value={vcard}
                    size={280}
                    ecLevel="H"
                    qrStyle="squares"
                    fgColor={qrColor}
                    bgColor={bgColor}
                    logoImage={logoImage || undefined}
                    logoWidth={56}
                    logoHeight={56}
                    logoPadding={6}
                    logoPaddingStyle="square"
                    removeQrCodeBehindLogo={true}
                    quietZone={10}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Generate the QR code to see the preview.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-slate-900/50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="qrColor"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    QR color
                  </label>

                  <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
                    <input
                      id="qrColor"
                      type="color"
                      value={isHexColor(qrColor) ? qrColor : "#0f172a"}
                      onChange={(e) => setQrColor(e.target.value.toLowerCase())}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white p-2 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />

                    <input
                      id="qrColorHex"
                      type="text"
                      inputMode="text"
                      value={qrColor}
                      onChange={(e) => handleHexInput(setQrColor, e.target.value)}
                      onBlur={() =>
                        handleHexBlur(setQrColor, qrColor, "#0f172a")
                      }
                      placeholder="#0f172a"
                      className={darkFieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bgColor"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Background color
                  </label>

                  <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
                    <input
                      id="bgColor"
                      type="color"
                      value={isHexColor(bgColor) ? bgColor : "#ffffff"}
                      onChange={(e) => setBgColor(e.target.value.toLowerCase())}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white p-2 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    />

                    <input
                      id="bgColorHex"
                      type="text"
                      inputMode="text"
                      value={bgColor}
                      onChange={(e) => handleHexInput(setBgColor, e.target.value)}
                      onBlur={() =>
                        handleHexBlur(setBgColor, bgColor, "#ffffff")
                      }
                      placeholder="#ffffff"
                      className={darkFieldClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="logoUpload"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Company logo
                </label>
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="block w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-slate-200 shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              {logoName && (
                <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <span className="truncate">Loaded logo: {logoName}</span>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="ml-4 rounded-xl border border-white/10 bg-white px-3 py-1.5 font-medium text-slate-900 hover:bg-slate-200"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default App;