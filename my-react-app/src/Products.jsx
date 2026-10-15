import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import ProductCard from './ProductCard.jsx'
import ProductGalleryModal from './ProductGalleryModal.jsx'
import logoImg from '/favicon.png'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// 6 products on phones, 12 on larger screens (12 divides evenly into 2, 3, 4 and 6 columns)
function getPreviewCount(){
  return typeof window !== "undefined" && window.innerWidth < 640 ? 6 : 12;
}

function Products(){
  const [allProducts, setAllProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [scope, setScope] = useState("local");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [previewCount, setPreviewCount] = useState(getPreviewCount);

  const [loadingMessage, setLoadingMessage] = useState("Loading Renew Placenta...");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingMessage("Waking up server, please wait a moment...");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function update(){ setPreviewCount(getPreviewCount()); }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
  const cats = ["All", ...Array.from(new Set(inScope.map(p => p.cat).filter(Boolean)))];
  const query = search.trim().toLowerCase();
  const byCategory = filter === "All" ? inScope : inScope.filter(p => p.cat === filter);
  const filtered = query
    ? byCategory.filter(p => `${p.name || ""} ${p.blurb || ""} ${p.size || ""}`.toLowerCase().includes(query))
    : byCategory;
  // While searching, show every match instead of only the preview
  const shown = (showAll || query) ? filtered : filtered.slice(0, previewCount);

  return (
    <section id="products" className="py-16 border-b border-brand-green">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-6">
        <div className="text-brand-red font-semibold text-sm">The range</div>
        <h2 className="font-['Playfair_Display',serif] font-bold text-2xl md:text-3xl mt-1.5 mb-6">
          A few of our best-known formulations
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {[["local", "Local Products"], ["export", "Export Products"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setScope(key); setFilter("All"); setSearch(""); setShowAll(false); }}
              aria-pressed={scope === key}
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

        <div className="relative mb-4 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-green"/>
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full border border-brand-green bg-brand-paper rounded pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-green hover:text-brand-red"
            >
              <X size={16}/>
            </button>
          )}
        </div>

        <div className="flex gap-2.5 mb-6 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => { setFilter(c); setShowAll(false); }}
              aria-pressed={filter === c}
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

        {query && status === "ready" && (
          <p className="text-xs opacity-70 mb-4">
            {filtered.length} {filtered.length === 1 ? "result" : "results"} for "{search.trim()}"
          </p>
        )}
      {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute h-20 w-20 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin"></div>
              <img
                src={logoImg}
                alt="Renew Placenta Logo"
                className="h-10 w-10 object-contain animate-pulse relative z-10"
              />
            </div>
            <h3 className="font-['Playfair_Display',serif] text-lg font-semibold text-emerald-900 mb-1">
              Renew Placenta
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700/80 max-w-sm animate-pulse">
              {loadingMessage}
            </p>
          </div>
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
          <div className="text-sm opacity-80">
            {query ? (
              <p>
                No products match "{search.trim()}".{" "}
                <button onClick={() => setSearch("")} className="text-brand-red font-semibold underline">Clear search</button>
              </p>
            ) : (
              <p>No products to show in this category yet.</p>
            )}
          </div>
        )}

        {status === "ready" && (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
              {shown.map(p => <ProductCard key={p._id} product={p} onView={setViewProduct} />)}
            </div>

            {!query && filtered.length > previewCount && (
              <button
                onClick={() => setShowAll(s => !s)}
                className="mt-8 mx-auto flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
              >
                {showAll ? "View less" : `View all ${filtered.length} products`}
                {showAll ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
              </button>
            )}
          </>
        )}
      </div>

      <ProductGalleryModal product={viewProduct} onClose={() => setViewProduct(null)} />
    </section>
  );
}

export default Products