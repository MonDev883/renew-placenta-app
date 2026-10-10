import { Truck, Headset, PackageCheck, ShieldCheck } from 'lucide-react'

const BADGES = [
  { icon: Truck, title: "Nationwide Delivery", desc: "We ship anywhere in the Philippines. Contact us for export or distributorship inquiries." },
  { icon: Headset, title: "Online Support", desc: "Our customer service team is available Mon–Fri 8AM–5PM, Sat 8AM–3PM." },
  { icon: PackageCheck, title: "Bulk Discounts", desc: "We offer bulk pricing and exclusive deals for resellers and distributors." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Your information and payments are always protected." },
];

function TrustBadges(){
  return (
    <section className="py-12 border-b border-brand-green">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-5">
        {BADGES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group bg-brand-paper border border-brand-green rounded p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
          >
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-brand-green flex items-center justify-center transition-colors group-hover:bg-brand-red">
              <Icon className="text-white" size={22} strokeWidth={1.75}/>
            </div>
            <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
            <p className="text-xs opacity-75 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges