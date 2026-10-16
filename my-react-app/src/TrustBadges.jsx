import { Truck, Headset, PackageCheck, ShieldCheck } from 'lucide-react'
import { useSiteContent } from './useSiteContent.js'

const ICONS = [Truck, Headset, PackageCheck, ShieldCheck];

function TrustBadges(){
  const { services } = useSiteContent();

  return (
    <section className="py-12 border-b border-brand-green">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-8">
        {services.map(({ title, desc }, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div
              key={i}
              className="group bg-brand-paper border border-brand-green rounded p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-brand-green flex items-center justify-center transition-colors group-hover:bg-brand-red">
                <Icon className="text-white" size={22} strokeWidth={1.75}/>
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-xs opacity-75 leading-relaxed">{desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustBadges