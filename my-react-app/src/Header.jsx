import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import renewLogo from './assets/renew-logo-v2.png'
import renewTagline from './assets/renew-tagline.png'

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#products", label: "Products" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
];

function Header(){
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll(){ setScrolled(window.scrollY > 12); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-20 bg-brand-cream text-brand-ink transition-shadow relative ${scrolled ? "shadow-lg shadow-black/10" : ""}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-1.5 relative z-10">
        
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <img src={renewLogo} alt="Renew Placenta Herbal Beauty Products" className="h-12 sm:h-16 md:h-24 w-auto"/> 
          <img src={renewTagline} alt="Refreshed & Renewed" className="h-8 sm:h-12 md:h-16 w-auto"/>
        </div>

        {/* Desktop & Tablet Navigation */}
        <nav className="hidden md:flex gap-6 text-sm font-semibold tracking-wide uppercase">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="relative py-1 text-brand-ink/70 hover:text-brand-green transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Mobile / Tablet Hamburger Button */}
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      <div className="h-1 bg-brand-red"></div>

      {/* Mobile / Tablet Dropdown Menu */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-6 pb-4 text-sm relative z-10">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2 border-t border-brand-line opacity-80 hover:opacity-100">{l.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header