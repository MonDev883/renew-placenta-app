import { Shield } from 'lucide-react'

function Footer(){
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-green-deep text-brand-cream py-10 text-sm">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-5 mb-6">
          <div className="font-display text-lg">Renew Herbal Beauty Products</div>
          <div className="flex gap-4 flex-wrap opacity-85">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>© 1998–{year} Pureform Cosmetics</span>
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
          <p>All Renew and Truderm products carry a valid Certificate of Product Notification (CPN) from the Philippine FDA, meeting the safety and labeling standards required before market release.</p>
          <p>As with any cosmetic product made from natural botanical and herbal ingredients, individual sensitivities can vary. We recommend a 24-hour patch test before full use, and discontinuing use if irritation occurs.</p>
          <p>Information on this site is for cosmetic and educational purposes only and is not medical advice. Consult a dermatologist for specific skin conditions, or before use if pregnant or nursing.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer