import ProductSlideshow from './ProductSlideshow.jsx'

function Hero(){
  return (
    <div className="bg-brand-green text-brand-cream">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6 py-14 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="animate-fade-up min-w-0">
          <h1 className="font-['Playfair_Display',serif] italic font-bold text-4xl md:text-5xl 2xl:text-6xl leading-tight">
            Trusted for almost 25 years in skincare and personal care.
          </h1>
          <p className="mt-4 max-w-md text-lg opacity-90">
            Renew Herbal Beauty Products are trusted for almost 25 years in the line of skincare and personal care products.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#products" className="bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-6 py-3 rounded-sm">
              View products
            </a>
            <a href="#contact-form" className="border border-brand-cream hover:bg-white/10 font-semibold px-6 py-3 rounded-sm">
              Contact Us
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <ProductSlideshow/>
        </div>
      </div>
    </div>
  );
}

export default Hero