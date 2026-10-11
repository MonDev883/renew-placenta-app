import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getImageUrl(url) {
  if (!url) return "";
  const relative = url.replace(/^https?:\/\/localhost(:\d+)?/, '');
  return relative.startsWith('http') ? relative : `${API}${relative}`;
}

function ProductGalleryModal({ product, onClose }){
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    function onKey(e){
      if (!product) return;
      const rawPhotos = product.images?.length ? product.images : (product.image ? [product.image] : []);
      const photos = rawPhotos.map(getImageUrl);
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex(i => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setIndex(i => (i - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product]);

  if (!product) return null;

  const rawPhotos = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const photos = rawPhotos.map(getImageUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-paper rounded max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-green">
          <h3 className="font-display font-semibold text-sm">{product.name}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 hover:text-brand-red">
            <X size={20}/>
          </button>
        </div>

        <div className="relative h-72 md:h-96 bg-white flex items-center justify-center">
          {photos.length > 0 && (
            <img
              src={photos[index]}
              alt={`${product.name} photo ${index + 1}`}
              className="w-full h-full object-contain"
            />
          )}

          {photos.length > 1 && (
            <>
              <button
                onClick={() => setIndex(i => (i - 1 + photos.length) % photos.length)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full"
              >
                <ChevronLeft size={18}/>
              </button>
              <button
                onClick={() => setIndex(i => (i + 1) % photos.length)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full"
              >
                <ChevronRight size={18}/>
              </button>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="flex justify-center gap-1.5 py-3">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`w-2 h-2 rounded-full ${i === index ? "bg-brand-green" : "bg-brand-line"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGalleryModal