import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useMe } from './useMe.js'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Globe, AlertTriangle, CheckCircle2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const EMPTY_FORM = { name: "", cat: "Soap", price: "", size: "", blurb: "", best: false, hidden: false, outOfStock: false, scope: "local", images: [], shopeeUrl: "", lazadaUrl: ""};
const MAX_PHOTOS = 12;

// Helper to clean up old localhost URLs stored in MongoDB and point them to Render
function getImageUrl(url) {
  if (!url) return "";
  const relative = url.replace(/^https?:\/\/localhost(:\d+)?/, '');
  return relative.startsWith('http') ? relative : `${API}${relative}`;
}

function AdminProducts(){
  const { token } = useAuth(); 
  const me = useMe();
  const [products, setProducts] = useState([]); 
  const [form, setForm] = useState(EMPTY_FORM); 
  const [editingId, setEditingId] = useState(null); 
  const [uploading, setUploading] = useState(false); 
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const formRef = useRef(null); 
  const [successMsg, setSuccessMsg] = useState("");
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text: "..." }

  const searching = searchTerm.trim() !== "";

  function showNotice(type, text){
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 6000);
  }

  function loadProducts(){
    fetch(`${API}/api/admin/products`, { headers: { Authorization: `Bearer ${token}`}})
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleImageUpload(e){
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    const uploadedUrls = [];
    const failures = [];
    for (const file of files) {
      const data = new FormData();
      data.append('image', file);
      try {
        const res = await fetch(`${API}/api/admin/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          failures.push(`${file.name}: ${err.error || res.statusText || res.status}`);
          continue;
        }
        const result = await res.json();
        uploadedUrls.push(result.url);
      } catch (err) {
        failures.push(`${file.name}: ${err.message}`);
      }
    }

    setForm(f => ({ ...f, images: [...f.images, ...uploadedUrls] }));
    setUploading(false);
    e.target.value = "";

    if (failures.length > 0) {
      showNotice("error", `Upload failed for ${failures.join("; ")}`);
    }
  }

  function removeImage(index){
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function moveImage(index, direction){
    setForm(f => {
      const newImages = [...f.images];
      const target = index + direction;
      if (target < 0 || target >= newImages.length) return f;
      [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
      return { ...f, images: newImages };
    });
  }

  function handleDragOver(e){
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e){
    e.preventDefault();
    setDragActive(false);
  }

  function handleDrop(e){
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload({ target: { files: e.dataTransfer.files, value: "" } });
    }
  }

  async function handleSubmit(e){
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, imageUrl: form.images[0] || "" };
    const url = editingId ? `${API}/api/admin/products/${editingId}` : `${API}/api/admin/products`;
    const method = editingId ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);

      setSuccessMsg(editingId ? "Product successfully updated!" : "Product successfully added!");
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);

      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      setForm(EMPTY_FORM);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p){
    setEditingId(p._id);
    setForm({ name: p.name, cat: p.cat, price: p.price, size: p.size, blurb: p.blurb, best: p.best, scope: p.scope, images: p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : []), 
      shopeeUrl: p.shopeeUrl || "",
      lazadaUrl: p.lazadaUrl || "",
      hidden: !!p.hidden,
      outOfStock: !!p.outOfStock,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDelete(p){
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/api/admin/products/${p._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
      showNotice("success", `"${p.name}" was deleted.`);
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      loadProducts();
    }
  }

  async function moveProduct(id, direction){
    try {
      const res = await fetch(`${API}/api/admin/products/${id}/move`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
    } catch (err) {
      showNotice("error", err.message);
    } finally {
      loadProducts();
    }
  }

   async function toggleFlag(p, field){
     const turningOn = !p[field];
     try {
       const res = await fetch(`${API}/api/admin/products/${p._id}/flags`, {
         method: "PUT",
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({ [field]: turningOn }),
       });
       const data = await res.json().catch(() => ({}));
       if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
       const text = field === "hidden"
         ? (turningOn ? `"${p.name}" is now hidden from the website.` : `"${p.name}" is now visible on the website.`)
         : (turningOn ? `"${p.name}" is marked out of stock.` : `"${p.name}" is back in stock.`);
       showNotice("success", text);
     } catch (err) {
       showNotice("error", err.message);
     } finally {
       loadProducts();
     }
   }

  const filteredProducts = products.filter(p =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Support accounts cannot manage products (the server also refuses them)
  if (me && me.role === 'support') {
    return (
      <div className="min-h-screen bg-brand-cream px-6 py-10">
        <div className="max-w-xl mx-auto">
          <p className="text-brand-red text-sm mb-4">Your account does not have permission to manage products.</p>
          <Link to="/admin" className="text-sm text-brand-green underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Manage Products</h1>
          <div className="flex gap-3">
            <nav className="flex items-center gap-10">
              <Link 
                to="/admin" 
                className="group flex items-center gap-1.5 text-sm font-semibold tracking-wider uppercase text-brand-green transition-colors duration-200"
              >
                <LayoutDashboard size={16}/>
                <span className="relative">
                  Back to dashboard
                  <span className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-brand-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </span>
              </Link>

              <a 
                href="/" 
                className="group flex items-center gap-1.5 text-sm font-semibold tracking-wider uppercase text-brand-green transition-colors duration-200"
              >
                <Globe size={16}/>
                <span className="relative">
                  View public site
                  <span className="absolute left-0 -bottom-0.5 h-[2px] w-full bg-brand-red origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </span>
              </a>
            </nav>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="bg-brand-paper border border-brand-green rounded p-6 mb-10 grid md:grid-cols-2 gap-4">
          
          {successMsg && (
            <div className="mb-2 p-3 bg-brand-green text-brand-cream rounded-sm text-sm font-semibold text-center shadow-md transition-all md:col-span-2">
              {successMsg}
            </div>
          )}

          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm" required/>
          <select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm">
            <option value="Soap">Soap</option>
            <option value="Skincare">Skincare</option>
          </select>
          <input placeholder="Price (e.g. ₱98.00)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm"/>
          <input placeholder="Size (e.g. 135g)" value={form.size} onChange={e => setForm({...form, size: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm"/>
          <select value={form.scope} onChange={e => setForm({...form, scope: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm">
            <option value="local">Local</option>
            <option value="export">Export</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.best} onChange={e => setForm({...form, best: e.target.checked})}/>
            Best seller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.outOfStock} onChange={e => setForm({...form, outOfStock: e.target.checked})}/>
              Out of stock (shows a label, hides the buy buttons)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hidden} onChange={e => setForm({...form, hidden: e.target.checked})}/>
              Hidden (not shown on the public website)
            </label>
          <textarea placeholder="Description" value={form.blurb} onChange={e => setForm({...form, blurb: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm md:col-span-2" rows={2}/>

          <input 
                placeholder="Shopee Product Link (https://shopee.ph/...)" 
                value={form.shopeeUrl} 
                onChange={e => setForm({...form, shopeeUrl: e.target.value})} 
                className="border border-brand-green rounded px-3 py-2 text-sm md:col-span-2"
              />
          <input 
                placeholder="Lazada Product Link (https://lazada.com.ph/...)" 
                value={form.lazadaUrl} 
                onChange={e => setForm({...form, lazadaUrl: e.target.value})} 
                className="border border-brand-green rounded px-3 py-2 text-sm md:col-span-2"
              />

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">
              Product photos ({form.images.length})
            </label>
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded py-6 cursor-pointer transition-colors ${
                dragActive ? "border-brand-red bg-brand-red/5" : "border-brand-green bg-brand-paper"
              }`}
            >
              <span className="text-sm font-semibold">
                {dragActive ? "Drop images here" : "Drag & drop images here, or click to browse"}
              </span>
              <span className="text-xs opacity-60">You can select multiple files at once</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden"/>
            </label>

            {uploading && <p className="text-xs opacity-70 mt-1">Uploading...</p>}

            {form.images.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={getImageUrl(url)} alt={`Photo ${i + 1}`} className="h-20 w-20 object-contain border border-brand-green rounded bg-white"/>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-brand-red text-white text-xs w-5 h-5 rounded-full"
                    >
                      ×
                    </button>
                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-green text-white text-[10px] text-center">Main</span>}
                    <div className="flex justify-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="text-xs border border-brand-green rounded px-1.5 disabled:opacity-30"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === form.images.length - 1}
                        className="text-xs border border-brand-green rounded px-1.5 disabled:opacity-30"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-brand-green hover:opacity-90 text-brand-cream font-semibold px-5 py-2 rounded transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }} className="border border-brand-green px-5 py-2 rounded-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search product by name to edit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 border border-brand-green bg-brand-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          {searching && (
            <p className="text-xs opacity-60 mt-1">Clear the search to reorder products with the arrows.</p>
          )}
        </div>

        <div className="space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p, i) => (
                        <div
                key={p._id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-paper border border-brand-green rounded p-4 ${p.hidden ? "opacity-60" : ""}`}
              >
                
                <div className="flex items-center gap-4">
                  {p.imageUrl && <img src={getImageUrl(p.imageUrl)} alt={p.name} className="w-14 h-14 object-contain flex-shrink-0"/>}
                  <div>
                    <p className="font-semibold text-sm sm:text-base">
                      {p.name}
                      {p.hidden && <span className="ml-2 text-[10px] font-semibold uppercase bg-brand-ink/10 text-brand-ink px-1.5 py-0.5 rounded">Hidden</span>}
                      {p.outOfStock && <span className="ml-2 text-[10px] font-semibold uppercase bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded">Out of stock</span>}
                    </p>
                    <p className="text-xs text-brand-red">{p.size} · {p.price} · {p.scope} · {p.images?.length || 0} photo(s)</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-green/20">
                  <button onClick={() => moveProduct(p._id, 'up')} disabled={searching || i === 0} className="text-sm border border-brand-green rounded px-2.5 py-1 disabled:opacity-30">↑</button>
                  <button onClick={() => moveProduct(p._id, 'down')} disabled={searching || i === filteredProducts.length - 1} className="text-sm border border-brand-green rounded px-2.5 py-1 disabled:opacity-30">↓</button>
                  <button onClick={() => toggleFlag(p, 'outOfStock')} className="text-sm font-medium underline px-2 py-1">{p.outOfStock ? "In stock" : "Out of stock"}</button>
                  <button onClick={() => toggleFlag(p, 'hidden')} className="text-sm font-medium underline px-2 py-1">{p.hidden ? "Show" : "Hide"}</button>
                  <button onClick={() => startEdit(p)} className="text-sm font-medium underline px-2 py-1">Edit</button>
                  <button onClick={() => handleDelete(p)} className="text-sm font-medium text-brand-red underline px-2 py-1">Delete</button>
                </div>

              </div>
          ) : (
            <p className="text-sm opacity-70 bg-brand-paper border border-brand-green rounded p-4 text-center">
              {searching ? `No products found matching "${searchTerm}"` : "No products yet."}
            </p>
          )}
        </div>
      </div>

      {/* Floating notice (always visible at the top of the screen) */}
      {notice && (
        <div
          role="alert"
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md flex items-start gap-2 p-3 rounded border shadow-lg text-sm bg-brand-paper ${
            notice.type === "success"
              ? "border-brand-green text-brand-green"
              : "border-brand-red text-brand-red"
          }`}
        >
          {notice.type === "success"
            ? <CheckCircle2 size={16} className="mt-0.5 shrink-0"/>
            : <AlertTriangle size={16} className="mt-0.5 shrink-0"/>}
          <span>{notice.text}</span>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;