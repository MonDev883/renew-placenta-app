function About(){
  return (
    <section id="about" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div>
          <div className="text-brand-red font-semibold text-sm">Our story</div>
          <h2 className="font-['Playfair_Display',serif] font-bold text-2xl md:text-3xl mt-1.5 mb-5">
            Three decades of formulating for Filipino skin
          </h2>
          <p className="mb-3.5 text-justify">
            Pureform Cosmetics began in 1991 as a contract manufacturer for local and international beauty brands. In 1998, founders Rene and Grace Garcia launched Renew Placenta Soap, pairing wheat placenta enzymes with natural fruit extracts — a formulation that became a household name.
          </p>
          <p className="text-justify">
            Rene and Grace still travel to expos across Hong Kong, New York, and Milan to bring new botanical research home, so every bar keeps pace with what skin actually needs.
          </p>
        </div>
        <ul className="border-t border-brand-green">
          {[
            ["Founded", "1991, Pureform Cosmetics"],
            ["Flagship launch", "1998, Renew Placenta Herbal Beauty Products"],
            ["Head Office", "Sampaloc, Manila"],
          ].map(([label, value]) => (
            <li key={label} className="flex justify-between py-3 border-b border-brand-green text-sm">
              <span className="text-brand-red font-semibold">{label}</span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 grid md:grid-cols-2 gap-6">
        <div className="bg-brand-paper border border-brand-green rounded p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Mission</h3>
          <p className="text-sm">To produce high-quality products that meet market demands, pass government standards, and satisfy customer needs.</p>
        </div>
        <div className="bg-brand-paper border border-brand-green rounded p-6">
          <h3 className="font-display font-semibold text-lg mb-2">Vision</h3>
          <p className="text-sm">To distribute the finest quality and value-priced products both locally and in the international market.</p>
        </div>
      </div>
    </section>
  );
}

export default About