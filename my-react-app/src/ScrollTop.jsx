import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

function ScrollTop(){
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll(){ setVisible(window.scrollY > 500); }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-30 bg-brand-red hover:bg-brand-red-dark text-white p-3 rounded-full shadow-lg transition-colors"
      aria-label="Back to top"
    >
      <ArrowUp size={20}/>
    </button>
  );
}

export default ScrollTop