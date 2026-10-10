import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa'

import { useState } from 'react'

const API = 'http://localhost:4000';

function Contact(){
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  async function handleSubmit(e){
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <MapPin size={18} className="text-brand-red shrink-0 mt-0.5"/>
              <span>#610 Blumentritt Ext., Brgy. 536<br/>Sampaloc, Manila, Metro Manila, Philippines</span>
            </div>
            <div className="flex gap-3">
              <Phone size={18} className="text-brand-red shrink-0 mt-0.5"/>
              <span>(+63) 917 817 6736 · (+63) 922 845 8284 · (02) 8251 4850</span>
            </div>
            <div className="flex gap-3">
              <Mail size={18} className="text-brand-red shrink-0 mt-0.5"/>
              <span>rene@renewplacenta.com · pureformcosmetics@yahoo.com</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-5">
            <a href="https://www.facebook.com/RenewPlacentaOfficial" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-[#1877F2] hover:text-brand-red transition-colors"><FaFacebook size={20}/></a>
            <a href="https://www.instagram.com/renewplacenta1998/?hl=en" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#E4405F] hover:text-brand-red transition-colors"><FaInstagram size={20}/></a>
            <a href="https://www.youtube.com/c/RenewPlacenta" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-[#FF0000] hover:text-brand-red transition-colors"><FaYoutube size={20}/></a>
            <a href="https://x.com/renewplacenta" target="_blank" rel="noreferrer" aria-label="X (Twitter)" className="text-[#1DA1F2] hover:text-brand-red transition-colors"><FaTwitter size={20}/></a>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-red"/> Business hours</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-brand-green"><td className="py-1.5">Monday – Friday</td><td className="py-1.5 text-right">8:00 AM – 5:00 PM</td></tr>
              <tr className="border-b border-brand-green"><td className="py-1.5">Saturday</td><td className="py-1.5 text-right">8:00 AM – 3:00 PM</td></tr>
              <tr className="border-b border-brand-green"><td className="py-1.5">Sunday</td><td className="py-1.5 text-right">Closed</td></tr> 
            </tbody>
          </table>
        </div>
      </div>

      <div id="contact-form" className="max-w-5xl mx-auto px-6 mt-12" style={{ scrollMarginTop: "10rem" }}>
        <h3 className="font-semibold mb-4">Send us a message</h3>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 bg-brand-paper border border-brand-green rounded p-6">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-brand-green rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-brand-green rounded px-3 py-2 text-sm"
            required
          />
          <textarea
            placeholder="Your message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="border border-brand-green rounded px-3 py-2 text-sm md:col-span-2"
            rows={4}
            required
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="md:col-span-2 bg-brand-green hover:opacity-90 text-brand-cream font-semibold px-5 py-2.5 rounded-sm disabled:opacity-60 transition-opacity"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
          {status === "sent" && <p className="md:col-span-2 text-sm text-brand-green font-semibold">Thanks! Your message has been sent.</p>}
          {status === "error" && <p className="md:col-span-2 text-sm text-brand-red font-semibold">Something went wrong. Please try again.</p>}
        </form>
      </div>
    </section>
  );
}

export default Contact