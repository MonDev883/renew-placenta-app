import { useSiteContent } from './useSiteContent.js'

function Testimonials(){
  const { testimonials } = useSiteContent();

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6">
        <div className="text-brand-red font-semibold text-sm">In their words</div>
        <h2 className="font-['Playfair_Display',serif] font-bold text-2xl md:text-3xl mt-1.5 mb-8">
          What customers notice first
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 lg:gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="border-l-2 border-brand-red pl-4">
              <p className="italic mb-2 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              {t.who && <span className="text-sm opacity-70">{t.who}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials