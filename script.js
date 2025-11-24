document.addEventListener('DOMContentLoaded', function(){
  // Filters
  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.card');
  filters.forEach(f=>{
    f.addEventListener('click', ()=>{
      filters.forEach(b=>b.classList.remove('active'));
      f.classList.add('active');
      const filter = f.dataset.filter;
      cards.forEach(c=>{
        const tags = (c.dataset.tags||'').split(' ').map(t=>t.trim()).filter(Boolean);
        c.style.display = (filter === 'all' || tags.includes(filter)) ? '' : 'none';
      });
    });
  });
  // Accessibility: enable Enter key
  filters.forEach(b=>{ b.setAttribute('tabindex','0'); b.addEventListener('keypress', e=>{ if(e.key==='Enter') b.click(); }); });
});
