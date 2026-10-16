import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, CheckCircle2, Plus, Trash2, RotateCcw } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import { useMe } from './useMe.js'
import { SITE_DEFAULTS, mergeContent } from './siteDefaults.js'
import { clearSiteContentCache } from './useSiteContent.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const inputClass = "w-full border border-brand-green rounded px-3 py-2 text-sm bg-white";
const clone = (value) => JSON.parse(JSON.stringify(value));

function Section({ title, hint, onReset, children }){
  return (
    <section className="bg-brand-paper border border-brand-green rounded p-5 mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        <button type="button" onClick={onReset} className="flex items-center gap-1 text-xs text-brand-green underline">
          <RotateCcw size={12}/> Restore original text
        </button>
      </div>
      {hint && <p className="text-xs opacity-70">{hint}</p>}
      {children}
    </section>
  );
}

function Field({ label, children }){
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}

function AdminContent(){
  const { token } = useAuth();
  const me = useMe();
  const [form, setForm] = useState(clone(SITE_DEFAULTS));
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  function showNotice(type, text){
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 7000);
  }

  useEffect(() => {
    fetch(`${API}/api/site-content`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setForm(mergeContent(data)); setReady(true); })
      .catch(() => showNotice("error", "Could not load the saved content. Reload this page before saving, so nothing is overwritten."));
  }, []);

  function setField(section, key, value){
    setForm(f => ({ ...f, [section]: { ...f[section], [key]: value } }));
  }
  function setNested(section, listKey, index, key, value){
    setForm(f => ({
      ...f,
      [section]: {
        ...f[section],
        [listKey]: f[section][listKey].map((row, i) => (i === index ? { ...row, [key]: value } : row)),
      },
    }));
  }
  function setTop(listKey, index, key, value){
    setForm(f => ({ ...f, [listKey]: f[listKey].map((row, i) => (i === index ? { ...row, [key]: value } : row)) }));
  }
  function addTestimonial(){
    setForm(f => (f.testimonials.length >= 9 ? f : { ...f, testimonials: [...f.testimonials, { quote: "", who: "" }] }));
  }
  function removeTestimonial(index){
    setForm(f => ({ ...f, testimonials: f.testimonials.filter((_, i) => i !== index) }));
  }
  function resetSection(name){
    setForm(f => ({ ...f, [name]: clone(SITE_DEFAULTS[name]) }));
  }

  async function handleSave(e){
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/site-content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
      clearSiteContentCache();
      showNotice("success", "Website content saved. Refresh the public site to see the changes.");
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  if (me && me.role !== 'owner') {
    return (
      <div className="min-h-screen bg-brand-cream px-6 py-10">
        <div className="max-w-xl mx-auto">
          <p className="text-brand-red text-sm mb-4">Only owners can edit the website content.</p>
          <Link to="/admin" className="text-sm text-brand-green underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h1 className="font-display font-semibold text-2xl">Website Content</h1>
          <Link
            to="/admin"
            className="relative flex items-center gap-1.5 text-sm py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full"
          >
            <LayoutDashboard size={16}/>
            Back to dashboard
          </Link>
        </div>

        <p className="text-sm opacity-80 mb-6">
          Edit the text shown on the public website. Nothing changes until you press <strong>Save changes</strong> at the bottom.
          Products are managed on the Manage Products page.
        </p>

        <form onSubmit={handleSave}>
          <Section title="Home page (hero)" onReset={() => resetSection('hero')}>
            <Field label="Heading">
              <textarea rows={2} value={form.hero.heading} onChange={e => setField('hero', 'heading', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Paragraph">
              <textarea rows={3} value={form.hero.paragraph} onChange={e => setField('hero', 'paragraph', e.target.value)} className={inputClass}/>
            </Field>
          </Section>

          <Section title="About us" onReset={() => resetSection('about')}>
            <Field label="Heading">
              <input value={form.about.heading} onChange={e => setField('about', 'heading', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Story, paragraph 1">
              <textarea rows={4} value={form.about.story1} onChange={e => setField('about', 'story1', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Story, paragraph 2">
              <textarea rows={3} value={form.about.story2} onChange={e => setField('about', 'story2', e.target.value)} className={inputClass}/>
            </Field>
            <p className="text-xs font-semibold pt-1">Company facts</p>
            {form.about.facts.map((row, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-2">
                <input placeholder="Label" value={row.label} onChange={e => setNested('about', 'facts', i, 'label', e.target.value)} className={inputClass}/>
                <input placeholder="Value" value={row.value} onChange={e => setNested('about', 'facts', i, 'value', e.target.value)} className={inputClass}/>
              </div>
            ))}
            <Field label="Mission">
              <textarea rows={2} value={form.about.mission} onChange={e => setField('about', 'mission', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Vision">
              <textarea rows={2} value={form.about.vision} onChange={e => setField('about', 'vision', e.target.value)} className={inputClass}/>
            </Field>
          </Section>

          <Section title="Contact details and hours" onReset={() => resetSection('contact')}>
            <Field label="Address (press Enter for a new line)">
              <textarea rows={2} value={form.contact.address} onChange={e => setField('contact', 'address', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Phone numbers">
              <input value={form.contact.phones} onChange={e => setField('contact', 'phones', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Email addresses">
              <input value={form.contact.emails} onChange={e => setField('contact', 'emails', e.target.value)} className={inputClass}/>
            </Field>
            <p className="text-xs font-semibold pt-1">Business hours</p>
            {form.contact.hours.map((row, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-2">
                <input placeholder="Days" value={row.day} onChange={e => setNested('contact', 'hours', i, 'day', e.target.value)} className={inputClass}/>
                <input placeholder="Hours" value={row.time} onChange={e => setNested('contact', 'hours', i, 'time', e.target.value)} className={inputClass}/>
              </div>
            ))}
          </Section>

          <Section title="Service cards" hint="The four cards under the home page banner. The icons stay the same." onReset={() => resetSection('services')}>
            {form.services.map((row, i) => (
              <div key={i} className="space-y-2 border-t border-brand-green/20 pt-3 first:border-0 first:pt-0">
                <input placeholder="Title" value={row.title} onChange={e => setTop('services', i, 'title', e.target.value)} className={inputClass}/>
                <textarea rows={2} placeholder="Description" value={row.desc} onChange={e => setTop('services', i, 'desc', e.target.value)} className={inputClass}/>
              </div>
            ))}
          </Section>

          <Section title="Customer testimonials" hint="Only publish quotes from real customers who agreed to be quoted. If you remove them all, the section is hidden." onReset={() => resetSection('testimonials')}>
            {form.testimonials.map((row, i) => (
              <div key={i} className="space-y-2 border-t border-brand-green/20 pt-3 first:border-0 first:pt-0">
                <textarea rows={2} placeholder="Quote" value={row.quote} onChange={e => setTop('testimonials', i, 'quote', e.target.value)} className={inputClass}/>
                <div className="flex gap-2">
                  <input placeholder="Who said it (for example Repeat customer)" value={row.who} onChange={e => setTop('testimonials', i, 'who', e.target.value)} className={inputClass}/>
                  <button type="button" onClick={() => removeTestimonial(i)} title="Remove" className="text-brand-red p-2 shrink-0">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
            {form.testimonials.length < 9 && (
              <button type="button" onClick={addTestimonial} className="flex items-center gap-1.5 text-sm font-semibold text-brand-green">
                <Plus size={16}/> Add a testimonial
              </button>
            )}
          </Section>

          <Section title="Footer" onReset={() => resetSection('footer')}>
            <Field label="Company name in the copyright line">
              <input value={form.footer.copyrightName} onChange={e => setField('footer', 'copyrightName', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Notice 1 (product registration)">
              <textarea rows={3} value={form.footer.notice1} onChange={e => setField('footer', 'notice1', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Notice 2 (sensitivity)">
              <textarea rows={3} value={form.footer.notice2} onChange={e => setField('footer', 'notice2', e.target.value)} className={inputClass}/>
            </Field>
            <Field label="Notice 3 (not medical advice)">
              <textarea rows={3} value={form.footer.notice3} onChange={e => setField('footer', 'notice3', e.target.value)} className={inputClass}/>
            </Field>
          </Section>

          <div className="sticky bottom-0 bg-brand-cream/95 border-t border-brand-green/30 py-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !ready}
              className="bg-brand-green hover:opacity-90 text-brand-cream font-semibold px-6 py-2.5 rounded transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {!ready && <span className="text-xs opacity-70">Loading saved content...</span>}
          </div>
        </form>
      </div>

      {notice && (
        <div
          role="alert"
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md flex items-start gap-2 p-3 rounded border shadow-lg text-sm bg-brand-paper ${
            notice.type === "success" ? "border-brand-green text-brand-green" : "border-brand-red text-brand-red"
          }`}
        >
          {notice.type === "success"
            ? <CheckCircle2 size={16} className="mt-0.5 shrink-0"/>
            : <AlertTriangle size={16} className="mt-0.5 shrink-0"/>}
          <span>{notice.text}</span>
        </div>
      )}
    </div>
  );
}

export default AdminContent