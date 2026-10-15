const TESTIMONIALS = [
  { quote: "My skin felt noticeably brighter within two weeks — and it still smells like a proper herbal soap, not a chemical bar.", who: "Long-time user, Renew Placenta Classic" },
  { quote: "The lather is thick and the scent stays with you. It cleans deeply without leaving that tight, stripped feeling.", who: "Verified buyer" },
  { quote: "I've used it for years for the fine lines and dark spots. Slow and steady, but it works.", who: "Repeat customer" },
];

function Testimonials(){
  return (
    <section id="testimonials" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6">
        <div className="text-brand-red font-semibold text-sm">In their words</div>
        <h2 className="font-['Playfair_Display',serif] font-bold text-2xl md:text-3xl mt-1.5 mb-8">
          What customers notice first
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 lg:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="border-l-2 border-brand-red pl-4">
              <p className="italic mb-2 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <span className="text-sm opacity-70">{t.who}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials