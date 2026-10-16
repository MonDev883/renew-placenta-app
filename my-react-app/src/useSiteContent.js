import { useState, useEffect } from 'react'
import { SITE_DEFAULTS, mergeContent } from './siteDefaults.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

let cached = null;
let pending = null;

export function clearSiteContentCache(){
  cached = null;
  pending = null;
}

export function useSiteContent(){
  const [content, setContent] = useState(cached || SITE_DEFAULTS);

  useEffect(() => {
    if (cached) { setContent(cached); return; }
    if (!pending) {
      pending = fetch(`${API}/api/site-content`)
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => { cached = mergeContent(data); return cached; })
        .catch(() => { pending = null; return null; });
    }
    let active = true;
    pending.then(result => { if (active && result) setContent(result); });
    return () => { active = false; };
  }, []);

  return content;
}