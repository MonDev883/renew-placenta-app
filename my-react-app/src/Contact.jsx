import { Phone, Mail, MapPin, Clock, Copy, Check } from 'lucide-react'
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaFacebookMessenger } from 'react-icons/fa'
import { useSiteContent } from './useSiteContent.js'
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/RenewPlacentaOfficial", Icon: FaFacebook, color: "text-[#1877F2]" },
  { label: "Instagram", href: "https://www.instagram.com/renewplacenta1998/?hl=en", Icon: FaInstagram, color: "text-[#E4405F]" },
  { label: "YouTube", href: "https://www.youtube.com/c/RenewPlacenta", Icon: FaYoutube, color: "text-[#FF0000]" },
  { label: "X (Twitter)", href: "https://x.com/renewplacenta", Icon: FaTwitter, color: "text-[#1DA1F2]" },
];

const DEFAULT_ADDRESS = "#610 Blumentritt Ext., Brgy. 536\nSampaloc, Manila, Metro Manila, Philippines";
const DEFAULT_PHONES = "(+63) 917 817 6736 · (+63) 922 845 8284 · (02) 8251 4850";
const DEFAULT_EMAILS = "rene@renewplacenta.com · pureformcosmetics@yahoo.com";

// "a · b, c" becomes ["a", "b", "c"]
const splitPhones = (text) =>
  String(text || "").split(/[·,;\n]+/).map((s) => s.trim()).filter(Boolean);
const splitEmails = (text) =>
  String(text || "").split(/[\s·,;]+/).map((s) => s.trim()).filter((s) => s.includes("@"));
const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Phones use their mail app; computers open Gmail's compose window
const emailHref = (address) =>
  isMobile
    ? `mailto:${address}`
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(address)}`;

const linkClass = "hover:text-brand-red hover:underline underline-offset-2 break-words transition-colors";

function InfoRow({ icon: Icon, label, children }){
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0 text-brand-red">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink/60">{label}</p>
        <div className="text-brand-ink/90 leading-relaxed mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function Contact(){
  const [form, setForm] = useState({ name: "", email: "", inquiryType: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState("");
  const { contact } = useSiteContent();

  const addressLines = String(contact?.address || DEFAULT_ADDRESS).split("\n");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(" "))}`;
  const phones = splitPhones(contact?.phones || DEFAULT_PHONES);
  const emails = splitEmails(contact?.emails || DEFAULT_EMAILS);

  async function copyEmail(address){
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      const box = document.createElement("textarea");
      box.value = address;
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      document.body.removeChild(box);
    }
    setCopied(address);
    setTimeout(() => setCopied(""), 2000);
  }
  
  async function handleSubmit(e){
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setForm({ name: "", email: "", inquiryType: "", message: "" });
      setStatus("sent");
    } catch (err) {
      setErrorMsg(
        err instanceof TypeError
          ? "We couldn't reach the server. It may be waking up, so please try again in a minute."
          : err.message
      );
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <h3 className="font-display font-semibold text-lg mb-4 text-brand-ink">Contact Us</h3>
          <div className="space-y-4 text-sm">
            <InfoRow icon={MapPin} label="Address">
              <a href={mapsUrl} target="_blank" rel="noreferrer" className={linkClass}>
                {addressLines.map((line, i) => (
                  <span key={i}>{i > 0 && <br/>}{line}</span>
                ))}
              </a>
            </InfoRow>

            <InfoRow icon={Phone} label="Phone">
              <div className="flex flex-col gap-0.5">
                {phones.map((p) => (
                  <a key={p} href={telHref(p)} className={linkClass}>{p}</a>
                ))}
              </div>
            </InfoRow>

            <InfoRow icon={Mail} label="Email">
              <div className="flex flex-col gap-1">
                {emails.map((m) => (
                  <div key={m} className="flex items-center gap-2">
                    <a
                      href={emailHref(m)}
                      {...(isMobile ? {} : { target: "_blank", rel: "noreferrer" })}
                      className={linkClass}
                    >
                      {m}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyEmail(m)}
                      aria-label={`Copy ${m}`}
                      title="Copy email address"
                      className="shrink-0 text-brand-ink/50 hover:text-brand-green transition-colors"
                    >
                      {copied === m ? <Check size={14}/> : <Copy size={14}/>}
                    </button>
                  </div>
                ))}
              </div>
            </InfoRow>
          </div>

          <div className="flex items-center gap-3 mt-6">
            {SOCIALS.map(({ label, href, Icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className={`w-9 h-9 rounded-xl bg-brand-paper border border-brand-green/30 flex items-center justify-center ${color} transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-brand-red`}
              >
                <Icon size={18}/>
              </a>
            ))}
          </div>

          <div className="mt-5">
            <a
              href="https://m.me/RenewPlacentaOfficial"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0084FF] hover:bg-[#006bdd] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              <FaFacebookMessenger size={18} />
              Message us on Messenger
            </a>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0 text-brand-red">
              <Clock size={18} />
            </div>
            <h3 className="font-display font-semibold text-lg text-brand-ink">Business hours</h3>
          </div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {contact?.hours?.map((row, i) => (
                <tr key={i} className="border-b border-brand-green/20">
                  <td className="py-2.5 text-brand-ink/90">{row.day}</td>
                  <td className="py-2.5 text-right font-medium text-brand-ink">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="contact-form" className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 mt-12 scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28 lg:scroll-mt-32">
        <h3 className="font-display font-semibold text-lg mb-4 text-brand-ink">Send us a message</h3>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 bg-brand-paper border border-brand-green rounded p-6 shadow-sm">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-brand-green/40 rounded px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-brand-green"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-brand-green/40 rounded px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-brand-green"
            required
          />
          <select
            value={form.inquiryType}
            onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
            className={`border border-brand-green/40 rounded px-3.5 py-2.5 text-sm bg-white md:col-span-2 focus:outline-none focus:border-brand-green ${form.inquiryType ? "" : "text-gray-500"}`}
            required
          >
            <option value="" disabled>Select inquiry type</option>
            <option value="Product question">Product question</option>
            <option value="Bulk order">Bulk order</option>
            <option value="Distributor / export">Distributor / export</option>
          </select>
          <textarea
            placeholder="Your message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="border border-brand-green/40 rounded px-3.5 py-2.5 text-sm md:col-span-2 bg-white focus:outline-none focus:border-brand-green"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="md:col-span-2 bg-brand-green hover:opacity-90 text-brand-cream font-semibold px-5 py-3 rounded-sm disabled:opacity-60 transition-opacity"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
          {status === "sent" && <p className="md:col-span-2 text-sm text-brand-green font-semibold">Thanks! Your message has been sent.</p>}
          {status === "error" && <p className="md:col-span-2 text-sm text-brand-red font-semibold">{errorMsg || "Something went wrong. Please try again."}</p>}
        </form>
      </div>
    </section>
  );
}

export default Contact;