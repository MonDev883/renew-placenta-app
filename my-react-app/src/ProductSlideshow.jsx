import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const API = 'http://localhost:4000';

function ProductSlideshow(){
  const [slides, setSlides] = useState([]);
  const [trackIndex, setTrackIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [paused, setPaused] = useState(false);
  const resetTimeout = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(data => {
        const localOnly = data.filter(p => !p.noSlide && (p.scope ?? "local") === "local");
        setSlides(localOnly);
      })
      .catch(() => setSlides([]));
  }, []);

  const extended = slides.length > 0 ? [slides[slides.length - 1], ...slides, slides[0]] : [];

  const goNext = () => setTrackIndex(i => i + 1);
  const goPrev = () => setTrackIndex(i => i - 1);

  useEffect(() => {
    if (slides.length === 0 || paused) return;
    const id = setInterval(goNext, 4000);
    return () => clearInterval(id);
  }, [slides, paused]);

  useEffect(() => {
    if (slides.length === 0) return;
    if (trackIndex === extended.length - 1) {
      resetTimeout.current = setTimeout(() => {
        setWithTransition(false);
        setTrackIndex(1);
      }, 700);
    } else if (trackIndex === 0) {
      resetTimeout.current = setTimeout(() => {
        setWithTransition(false);
        setTrackIndex(extended.length - 2);
      }, 700);
    }
    return () => clearTimeout(resetTimeout.current);
  }, [trackIndex, slides]);

  useEffect(() => {
    if (!withTransition) {
      const raf = requestAnimationFrame(() => setWithTransition(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [withTransition]);

  if (slides.length === 0) return null;

  const realIndex = (trackIndex - 1 + slides.length) % slides.length;
  const product = slides[realIndex];

  return (
    <div className="mt-10">
      <div className="relative w-full h-48 md:h-64 rounded overflow-hidden bg-brand-paper border border-brand-green py-6">
        <div
          className={`flex h-full ${withTransition ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
        >
          {extended.map((p, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center">
              {(p.slideImageUrl || p.imageUrl) && (
                <img
                  src={p.slideImageUrl || p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.opacity = "0"; }}
                />
              )}
            </div>
          ))}
        </div>

        <button onClick={goPrev} aria-label="Previous product" className="absolute left-2 top-1/2 -translate-y-1/2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full">
          <ChevronLeft size={18}/>
        </button>
        <button onClick={goNext} aria-label="Next product" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full">
          <ChevronRight size={18}/>
        </button>
        <button
          onClick={() => setPaused(p => !p)}
          aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          className="absolute bottom-2 right-2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full"
        >
          {paused ? <Play size={14}/> : <Pause size={14}/>}
        </button>
      </div>

      <div className="text-center mt-3">
        <h3 className="font-display text-lg font-semibold">{product.name}</h3>
        <p className="text-xs text-brand-red font-semibold mt-1">{product.size}</p>
        <p className="text-sm opacity-80 mt-1 text-justify">{product.blurb}</p>
        <p className="text-xs opacity-60 mt-1">{realIndex + 1} / {slides.length}</p>
      </div>
    </div>
  );
}

export default ProductSlideshow