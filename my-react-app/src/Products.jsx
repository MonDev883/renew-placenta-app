import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import ProductGalleryModal from './ProductGalleryModal.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const PREVIEW_COUNT = 6;

function Products(){
  const [allProducts, setAllProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [scope, setScope] = useState("local");
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const cats = ["All", "Soap", "Skincare"];

  function loadProducts(){
    setStatus("loading");
    fetch(`${API}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(() => {
        setAllProducts([]);
        setStatus("error");
      });
  }

  useEffect(() => { loadProducts(); }, []);

  const inScope = allProducts.filter(p => (p.scope ?? "local") === scope);
  const filtered = filter === "All" ? inScope : inScope.filter(p => p.cat === filter);
  const shown = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);

  return (
    <section id="products" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-brand-red font-semibold text-sm">The range</div>
        <h2 className="font-['Playfair_Display',serif] font-bold text-2xl md:text-3xl mt-1.5 mb-6">
          A few of our best-known formulations
        </h2>

        <div className="flex gap-2 mb-6">
          {[["local", "Local Products"], ["export", "Export Products"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setScope(key); setFilter("All"); setShowAll(false); }}
              className={`px-5 py-2.5 rounded-sm text-sm font-semibold ${
                scope === key
                  ? "bg-brand-green text-brand-cream"
                  : "bg-brand-paper border border-brand-green"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2.5 mb-6 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => { setFilter(c); setShowAll(false); }}
              className={`px-4 py-2 rounded-sm border text-sm ${
                filter === c
                  ? "bg-brand-green text-brand-cream border-brand-green"
                  : "border-brand-green"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {status === "loading" && (
          <p className="text-sm opacity-70">
            Loading products... the first visit can take up to a minute while the server wakes up.
          </p>
        )}

        {status === "error" && (
          <div className="text-sm bg-brand-paper border border-brand-green rounded p-4">
            <p className="mb-2">We couldn't load the products right now.</p>
            <button
              onClick={loadProducts}
              className="text-brand-red font-semibold underline hover:text-brand-red-dark"
            >
              Try again
            </button>
          </div>
        )}

        {status === "ready" && filtered.length === 0 && (
          <p className="text-sm opacity-70">No products to show in this category yet.</p>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
          {shown.map(p => <ProductCard key={p._id} product={p} onView={setViewProduct} />)}
        </div>

        {filtered.length > PREVIEW_COUNT && (
          <button
            onClick={() => setShowAll(s => !s)}
            className="mt-8 mx-auto flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
          >
            {showAll ? "View less" : `View all ${filtered.length} products`}
            {showAll ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          </button>
        )}
      </div>

      <ProductGalleryModal product={viewProduct} onClose={() => setViewProduct(null)} />
    </section>
  );
}

export default Products