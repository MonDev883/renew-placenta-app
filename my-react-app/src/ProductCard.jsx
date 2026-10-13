import { Droplet, Sparkles } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getImageUrl(url) {
  if (!url) return "";
  const relative = url.replace(/^https?:\/\/localhost(:\d+)?/, '');
  return relative.startsWith('http') ? relative : `${API}${relative}`;
}

function safeLink(value) {
  const raw = (value || "").trim();
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function cleanPrice(price) {
  return String(price ?? "").replace(/^\s*₱\s*/, "").trim();
}

function ProductCard({ product, onView }){
  const Icon = product.cat === "Soap" ? Droplet : Sparkles;
  const imageUrl = getImageUrl(product.imageUrl);
  const shopee = safeLink(product.shopeeUrl);
  const lazada = safeLink(product.lazadaUrl);
  const price = cleanPrice(product.price);
  const soldOut = !!product.outOfStock;

  const buttonClass = "flex-1 text-center bg-brand-red hover:bg-brand-red-dark text-white text-sm font-semibold px-2.5 py-2 rounded-sm whitespace-nowrap transition-colors";

  return (
    <div className="group relative bg-brand-paper border border-brand-green rounded overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
      {soldOut && (
        <span className="absolute top-3 left-4 z-10 bg-brand-ink text-white text-xs font-semibold px-2.5 py-1 rounded">
          Out of stock
        </span>
      )}
      <span className="absolute top-14 right-4 z-10 bg-brand-red text-white text-xs font-semibold px-2.5 py-1 rounded">
        {product.best ? "Best seller" : product.cat}
      </span> 
      <button
        onClick={() => onView(product)}
        className="absolute top-3 right-4 z-10 bg-white/90 hover:bg-white text-brand-ink text-xs font-semibold px-2.5 py-1 rounded shadow-sm"
      >
        View
      </button>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-44 object-contain bg-brand-paper p-2 pt-6 ${soldOut ? "grayscale opacity-70" : ""}`}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      <div className="p-5">
        <Icon className="text-brand-green mb-2" size={22} strokeWidth={1.75}/>
        <h3 className="text-lg font-semibold pr-10 mb-1.5">{product.name}</h3>
        <div className="text-xs text-brand-red font-semibold mb-2.5">{product.size}</div>
        <p className="text-sm opacity-85 mb-3.5 text-justify">{product.blurb}</p>
        {price && <div className="font-display text-xl font-semibold">₱{price}</div>}
        
        {soldOut ? (
          <p className="mt-3.5 text-sm font-semibold text-brand-red">Currently out of stock</p>
        ) : (shopee || lazada) ? (
          <div className="flex gap-2 mt-3.5 flex-wrap">
            {shopee && (
              <a href={shopee} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                Buy at Shopee
              </a>
            )}
            {lazada && (
              <a href={lazada} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                Buy at Lazada
              </a>
            )}
          </div>
        ) : (
          <p className="mt-3.5 text-xs opacity-60 italic">Online store link coming soon</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;