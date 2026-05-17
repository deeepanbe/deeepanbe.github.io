(function() {
  const btn = document.createElement('button');
  btn.id = 'dj-float-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open DJ AI chat');
  btn.innerHTML = `
    <div class="dj-float-ring"></div>
    <span>DJ</span>
  `;
  btn.onclick = () => window.open('dj/dj.html', '_blank', 'noopener');
  document.body.appendChild(btn);

  const style = document.createElement('style');
  style.textContent = `
    #dj-float-btn {
      position: fixed; bottom: 32px; right: 32px; z-index: 999;
      width: 56px; height: 56px;
      background: #1A1A18; color: #F7F5F0;
      border-radius: 50%; cursor: pointer; border: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Sans', sans-serif; font-size: 13px;
      font-weight: 500; letter-spacing: 0.02em;
      transition: transform 0.2s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    #dj-float-btn:hover { transform: scale(1.08); }
    .dj-float-ring {
      position: absolute; width: 100%; height: 100%;
      border-radius: 50%; border: 2px solid rgba(200,151,58,0.5);
      animation: djPulse 2.5s ease-in-out infinite;
    }
    @keyframes djPulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      50%  { transform: scale(1.3); opacity: 0; }
      100% { transform: scale(1);   opacity: 0; }
    }
    @media (max-width: 640px) {
      #dj-float-btn { right: 18px; bottom: 22px; }
    }
  `;
  document.head.appendChild(style);
})();
