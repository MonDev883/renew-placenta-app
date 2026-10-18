import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaFacebookMessenger } from 'react-icons/fa'
import { useSiteContent } from './useSiteContent.js'
import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function Contact(){
  const [form, setForm] = useState({ name: "", email: "", inquiryType: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { contact } = useSiteContent();
  
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
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0 text-brand-red mt-0.5">
                <MapPin size={18} />
              </div>
              <span className="text-brand-ink/90 leading-relaxed pt-1">
                {contact?.address ? contact.address.split('\n').map((line, i) => (
                  <span key={i}>{i > 0 && <br/>}{line}</span>
                )) : (
                  <>#610 Blumentritt Ext., Brgy. 536<br/>Sampaloc, Manila, Metro Manila, Philippines</>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0 text-brand-red">
                <Phone size={18} />
              </div>
              <span className="min-w-0 break-words text-brand-ink/90">
                {contact?.phones || "(+63) 917 817 6736 · (+63) 922 845 8284 · (02) 8251 4850"}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0 text-brand-red">
                <Mail size={18} />
              </div>
              <span className="min-w-0 break-words text-brand-ink/90">
                {contact?.emails || "rene@renewplacenta.com · pureformcosmetics@yahoo.com"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <a href="https://www.facebook.com/RenewPlacentaOfficial" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-[#1877F2] hover:text-brand-red transition-colors"><FaFacebook size={20}/></a>
            <a href="https://www.instagram.com/renewplacenta1998/?hl=en" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#E4405F] hover:text-brand-red transition-colors"><FaInstagram size={20}/></a>
            <a href="https://www.youtube.com/c/RenewPlacenta" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-[#FF0000] hover:text-brand-red transition-colors"><FaYoutube size={20}/></a>
            <a href="https://x.com/renewplacenta" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="text-[#1DA1F2] hover:text-brand-red transition-colors"><FaTwitter size={20}/></a>
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