import { useSiteContent } from './useSiteContent.js'

function About(){
  const { about } = useSiteContent();

  return (
    <section id="about" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div>
          <div className="text-brand-red font-semibold text-sm">Our story</div>
          <h2 className="font-['Playfair_Display',serif] font-bold text-2xl md:text-3xl mt-1.5 mb-5">
            {about.heading}
          </h2>
          <p className="mb-3.5 text-left sm:text-justify">{about.story1}</p>
          <p className="text-left sm:text-justify">{about.story2}</p>
        </div>
        <ul className="border-t border-brand-green">
          {about.facts.map((row, i) => (
            <li key={i} className="flex justify-between gap-4 py-3 border-b border-brand-green text-sm">
              <span className="text-brand-red font-semibold shrink-0">{row.label}</span>
              <span className="text-right">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 mt-12 grid md:grid-cols-2 gap-6">
        <div className="bg-brand-paper border border-brand-green rounded p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Mission</h3>
          <p className="text-sm">{about.mission}</p>
        </div>
        <div className="bg-brand-paper border border-brand-green rounded p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Vision</h3>
          <p className="text-sm">{about.vision}</p>
        </div>
      </div>
    </section>
  );
}

export default About