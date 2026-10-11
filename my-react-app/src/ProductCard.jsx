import { Droplet, Sparkles } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function ProductCard({ product, onView }){
  const Icon = product.cat === "Soap" ? Droplet : Sparkles;
  
  // Safely resolve image URL whether it's an absolute URL or a relative /uploads path
  const imageUrl = product.imageUrl 
    ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${API}${product.imageUrl}`)
    : "";

  return (
    <div className="group relative bg-brand-paper border border-brand-green rounded overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
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
          className="w-full h-44 object-contain bg-brand-paper p-2 pt-6"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      <div className="p-5">
        <Icon className="text-brand-green mb-2" size={22} strokeWidth={1.75}/>
        <h3 className="text-lg font-semibold pr-10 mb-1.5">{product.name}</h3>
        <div className="text-xs text-brand-red font-semibold mb-2.5">{product.size}</div>
        <p className="text-sm opacity-85 mb-3.5 text-justify">{product.blurb}</p>
        <div className="font-display text-xl font-semibold">₱{product.price}</div>
        
        {/* Shopee and Lazada Action Buttons */}
        <div className="flex gap-2 mt-3.5 flex-wrap">
          <a 
            href={product.shopeeUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => { if (!product.shopeeUrl) e.preventDefault(); }}
            className={`flex-1 text-center bg-brand-red text-white text-sm font-semibold px-2.5 py-2 rounded-sm whitespace-nowrap transition-colors ${!product.shopeeUrl ? 'opacity-40 pointer-events-none' : 'hover:bg-brand-red-dark'}`}
          >
            Buy at Shopee
          </a>
          <a 
            href={product.lazadaUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => { if (!product.lazadaUrl) e.preventDefault(); }}
            className={`flex-1 text-center bg-brand-red text-white text-sm font-semibold px-2.5 py-2 rounded-sm whitespace-nowrap transition-colors ${!product.lazadaUrl ? 'opacity-40 pointer-events-none' : 'hover:bg-brand-red-dark'}`}
          >
            Buy at Lazada
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;