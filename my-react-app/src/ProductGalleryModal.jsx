import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getImageUrl(url) {
  if (!url) return "";
  const relative = url.replace(/^https?:\/\/localhost(:\d+)?/, '');
  return relative.startsWith('http') ? relative : `${API}${relative}`;
}

// Photos for a product: the images list first, then the main imageUrl (older products)
function getPhotos(product) {
  if (!product) return [];
  const raw = product.images?.length
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : (product.image ? [product.image] : []));
  return raw.map(getImageUrl).filter(Boolean);
}

function ProductGalleryModal({ product, onClose }){
  const [index, setIndex] = useState(0);
  const photos = getPhotos(product);
  const count = photos.length;

  useEffect(() => {
    setIndex(0);
    if (!product) return;

    function onKey(e){
      if (e.key === "Escape") onClose();
      if (count < 2) return;
      if (e.key === "ArrowRight") setIndex(i => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex(i => (i - 1 + count) % count);
    }

    // Stop the page behind the popup from scrolling while it is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} photos`}
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
          {count > 0 ? (
            <img
              src={photos[index]}
              alt={`${product.name} photo ${index + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <p className="text-sm opacity-60">No photos available for this product.</p>
          )}

          {count > 1 && (
            <>
              <button
                onClick={() => setIndex(i => (i - 1 + count) % count)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full"
              >
                <ChevronLeft size={18}/>
              </button>
              <button
                onClick={() => setIndex(i => (i + 1) % count)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green/80 hover:bg-brand-green text-white p-1.5 rounded-full"
              >
                <ChevronRight size={18}/>
              </button>
            </>
          )}
        </div>

        {count > 1 && (
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