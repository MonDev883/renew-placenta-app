import { Shield } from 'lucide-react'
import { useSiteContent } from './useSiteContent.js'

function Footer(){
  const { footer } = useSiteContent();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-green-deep text-brand-cream py-10 text-sm">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-5 mb-6">
          <div className="font-display text-lg">Renew Herbal Beauty Products</div>
          <div className="flex gap-4 flex-wrap opacity-85">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>© 1998–{year} {footer.copyrightName}</span>
            <a
              href="/admin"
              className="relative flex items-center gap-1 py-1 opacity-80 hover:opacity-100 transition-opacity after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-brand-cream after:transition-all after:duration-300 hover:after:w-full"
            >
              <Shield size={14}/>
              Admin
            </a>
          </div>
        </div>
        <div className="opacity-75 space-y-2.5 max-w-4xl xl:max-w-5xl text-left sm:text-justify">
          {[footer.notice1, footer.notice2, footer.notice3].filter(Boolean).map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer