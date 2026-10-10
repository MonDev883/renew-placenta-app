import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext.jsx'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Globe } from 'lucide-react'


const API = 'http://localhost:4000';
const EMPTY_FORM = { name: "", cat: "Soap", price: "", size: "", blurb: "", best: false, scope: "local", images: [], shopeeUrl: "", lazadaUrl: ""};
const MAX_PHOTOS = 12;

function AdminProducts(){
  const { token } = useAuth(); // Retrieves the admin authentication token for secure API requests
  const [products, setProducts] = useState([]); // Stores the complete list of products fetched from the database
  const [form, setForm] = useState(EMPTY_FORM); // Stores input data for creating or editing a product
  const [editingId, setEditingId] = useState(null); // Tracks the ID of the product currently being edited (null = creating a new one)
  const [uploading, setUploading] = useState(false); // Tracks whether product photos are currently uploading
  const [dragActive, setDragActive] = useState(false); // Tracks drag-and-drop state for the image upload dropzone
  const [searchTerm, setSearchTerm] = useState(''); // Stores the search input text for filtering products by name
  const formRef = useRef(null); // Reference used to smooth scroll back up to the form when editing
  const [successMsg, setSuccessMsg] = useState("");

  // Function to fetch all products from the backend server
  function loadProducts(){
    fetch(`${API}/api/products`).then(r => r.json()).then(setProducts);
  }

  // Automatically load the product list when the component first opens (mounts)
  useEffect(() => { loadProducts(); }, []);

  // Handles uploading one or multiple product images to the backend server
  async function handleImageUpload(e){
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);

    const uploadedUrls = [];
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
          alert(`Upload failed for ${file.name}: ${err.error || res.statusText}`);
          continue;
        }
        const result = await res.json();
        uploadedUrls.push(result.url);
      } catch (err) {
        alert(`Upload failed for ${file.name}: ${err.message}`);
      }
    }

    // Append newly uploaded image URLs to the existing list of images in the form
    setForm(f => ({ ...f, images: [...f.images, ...uploadedUrls] }));
    setUploading(false);
    e.target.value = "";
  }

  // Removes a specific image from the form's image list by its array index
  function removeImage(index){
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  // Reorders images left or right within the form preview list
  function moveImage(index, direction){
    setForm(f => {
      const newImages = [...f.images];
      const target = index + direction;
      if (target < 0 || target >= newImages.length) return f;
      [newImages[index], newImages[target]] = [newImages[target], newImages[index]];
      return { ...f, images: newImages };
    });
  }

  // Drag-and-drop helper event handlers
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

  // Handles submitting the form to either Create (POST) or Update (PUT) a product
  async function handleSubmit(e){
    e.preventDefault();
    const payload = { ...form, imageUrl: form.images[0] || "" };
    const url = editingId ? `${API}/api/admin/products/${editingId}` : `${API}/api/admin/products`;
    const method = editingId ? "PUT" : "POST";
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    // Trigger success notification banner
    setSuccessMsg(editingId ? "Product successfully updated!" : "Product successfully added!");
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);

    // Smooth scroll back up to the top of the form so the success banner is visible on laptops
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    setForm(EMPTY_FORM);
    setEditingId(null);
    loadProducts();
  }

  // Populates the form fields with an existing product's data when "Edit" is clicked
  function startEdit(p){
    setEditingId(p._id);
    setForm({ name: p.name, cat: p.cat, price: p.price, size: p.size, blurb: p.blurb, best: p.best, scope: p.scope, images: p.images?.length ? p.images : (p.imageUrl ? [p.imageUrl] : []), 
      shopeeUrl: p.shopeeUrl || "", //New added code 10-08-2026
      lazadaUrl: p.lazadaUrl || "", //New added code 10-08-2026
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Deletes a product by its ID after user confirmation
  async function handleDelete(id){
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadProducts();
  }

  // Moves a product's display position up or down in the list
  async function moveProduct(id, direction){
    await fetch(`${API}/api/admin/products/${id}/move`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ direction }),
    });
    loadProducts();
  }

  // Filters the product list dynamically based on the search input query (case-insensitive)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-cream px-6 py-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section & Navigation Links */}
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

        {/* Product Input Form (Handles both Creating and Updating) */}
        <form ref={formRef} onSubmit={handleSubmit} className="bg-brand-paper border border-brand-green rounded p-6 mb-10 grid md:grid-cols-2 gap-4">
          
          {/* Success Notification Pop-up Banner */}
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
          <textarea placeholder="Description" value={form.blurb} onChange={e => setForm({...form, blurb: e.target.value})} className="border border-brand-green rounded px-3 py-2 text-sm md:col-span-2" rows={2}/>

          {/*New added feature 10-08-2026*/}
          {/* Shopee & Lazada Link Inputs */}
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

          {/* Drag & Drop Photo Upload Section */}
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

            {/* Preview Thumbnails for Uploaded Photos */}
            {form.images.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt={`Photo ${i + 1}`} className="h-20 w-20 object-contain border border-brand-green rounded bg-white"/>
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

          {/* Form Action Buttons (Submit / Cancel) */}
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-brand-green hover:opacity-90 text-brand-cream font-semibold px-5 py-2 rounded transition-opacity">
              {editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }} className="border border-brand-green px-5 py-2 rounded-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Search Input Box (Allows your boss's niece to filter products by name) */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search product by name to edit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 border border-brand-green bg-brand-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>

        {/* Filtered Product List Display */}
        <div className="space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p, i) => (
              <div key={p._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-paper border border-brand-green rounded p-4">
                
                {/* Product Image & Info */}
                <div className="flex items-center gap-4">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-contain flex-shrink-0"/>}
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{p.name}</p>
                    <p className="text-xs text-brand-red">{p.size} · {p.price} · {p.scope} · {p.images?.length || 0} photo(s)</p>
                  </div>
                </div>

                {/* Action Buttons (Stacked on mobile, inline on desktop) */}
                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-green/20">
                  <button onClick={() => moveProduct(p._id, 'up')} disabled={i === 0} className="text-sm border border-brand-green rounded px-2.5 py-1 disabled:opacity-30">↑</button>
                  <button onClick={() => moveProduct(p._id, 'down')} disabled={i === filteredProducts.length - 1} className="text-sm border border-brand-green rounded px-2.5 py-1 disabled:opacity-30">↓</button>
                  <button onClick={() => startEdit(p)} className="text-sm font-medium underline px-2 py-1">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-sm font-medium text-brand-red underline px-2 py-1">Delete</button>
                </div>

              </div>
            ))
          ) : (
            <p className="text-sm opacity-70 bg-brand-paper border border-brand-green rounded p-4 text-center">
              No products found matching "{searchTerm}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;