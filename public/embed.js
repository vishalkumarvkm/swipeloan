/**
 * SwipeLoan Aanya Voice Agent - Client Embed Script
 * 
 * Usage on any client website:
 * <script src="https://ai.swipeloan.in/embed.js" async></script>
 * 
 * Optional Configuration Attributes:
 * - data-server="https://ai.swipeloan.in"
 * - data-position="bottom-right" | "bottom-left"
 * - data-label="Talk to Aanya"
 * - data-color="#10B981"
 * - data-auto-open="true" | "false"
 */
(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.__SWIPELOAN_AANYA_EMBED_LOADED__) return;
  window.__SWIPELOAN_AANYA_EMBED_LOADED__ = true;

  // Resolve script element & configuration
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && (scripts[i].src.indexOf('embed.js') !== -1 || scripts[i].src.indexOf('aanya') !== -1)) {
        return scripts[i];
      }
    }
    return scripts[scripts.length - 1];
  })();

  var scriptUrl = currentScript && currentScript.src ? currentScript.src : window.location.href;
  var defaultOrigin = (function() {
    try {
      if (currentScript && currentScript.src) {
        var u = new URL(currentScript.src);
        if (u.origin && u.origin !== 'null' && !u.origin.includes('localhost') && !u.origin.includes('127.0.0.1')) {
          return u.origin;
        }
      }
      return 'https://ai.swipeloan.in';
    } catch (_) {
      return 'https://ai.swipeloan.in';
    }
  })();

  var config = {
    server: (currentScript && currentScript.getAttribute('data-server')) || defaultOrigin,
    position: (currentScript && currentScript.getAttribute('data-position')) || 'bottom-right',
    theme: (currentScript && currentScript.getAttribute('data-theme')) || 'dark',
    label: (currentScript && currentScript.getAttribute('data-label')) || 'Talk to Aanya',
    subtitle: (currentScript && currentScript.getAttribute('data-subtitle')) || 'AI Loan Assistant',
    accentColor: (currentScript && currentScript.getAttribute('data-color')) || '#10B981',
    autoOpen: currentScript && currentScript.getAttribute('data-auto-open') === 'true'
  };

  // Inject Stylesheet
  var style = document.createElement('style');
  style.id = 'swipeloan-aanya-embed-styles';
  style.textContent = [
    '#swipeloan-aanya-root {',
    '  position: fixed;',
    '  z-index: 2147483645;',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    '  -webkit-font-smoothing: antialiased;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: flex-end;',
    '}',
    '#swipeloan-aanya-root.swipeloan-pos-bottom-left {',
    '  align-items: flex-start;',
    '}',
    '.swipeloan-pos-bottom-right { bottom: 24px; right: 24px; }',
    '.swipeloan-pos-bottom-left { bottom: 24px; left: 24px; }',
    
    '.swipeloan-popup-bubble {',
    '  display: none;',
    '  opacity: 0;',
    '  transform: translateY(20px) scale(0.9);',
    '  margin-bottom: 12px;',
    '  max-width: 285px;',
    '  background: rgba(15, 23, 42, 0.96);',
    '  backdrop-filter: blur(16px);',
    '  -webkit-backdrop-filter: blur(16px);',
    '  border: 1px solid rgba(51, 65, 85, 0.8);',
    '  border-radius: 16px;',
    '  padding: 10px 14px;',
    '  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.18);',
    '  cursor: pointer;',
    '  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;',
    '  position: relative;',
    '  box-sizing: border-box;',
    '}',
    '.swipeloan-popup-bubble.swipeloan-show {',
    '  display: flex;',
    '  align-items: flex-start;',
    '  justify-content: space-between;',
    '  gap: 10px;',
    '  opacity: 1;',
    '  transform: translateY(0) scale(1);',
    '}',
    '.swipeloan-popup-bubble:hover {',
    '  border-color: rgba(16, 185, 129, 0.5);',
    '  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.25);',
    '}',
    
    '/* Light Theme Overrides */',
    '.swipeloan-theme-light #swipeloan-launcher-btn {',
    '  background: rgba(255, 255, 255, 0.96);',
    '  border-color: rgba(226, 232, 240, 0.9);',
    '  color: #0f172a;',
    '  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.15);',
    '}',
    '.swipeloan-theme-light #swipeloan-launcher-btn:hover {',
    '  border-color: rgba(16, 185, 129, 0.5);',
    '  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.18), 0 0 28px rgba(16, 185, 129, 0.25);',
    '}',
    '.swipeloan-theme-light .swipeloan-title { color: #0f172a; }',
    '.swipeloan-theme-light .swipeloan-subtitle { color: #64748b; }',
    '.swipeloan-theme-light .swipeloan-popup-bubble {',
    '  background: rgba(255, 255, 255, 0.97);',
    '  border-color: rgba(226, 232, 240, 0.9);',
    '  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 0 20px rgba(16, 185, 129, 0.15);',
    '}',
    '.swipeloan-theme-light .swipeloan-popup-text { color: #0f172a; }',
    '.swipeloan-theme-light .swipeloan-popup-tail {',
    '  background: #ffffff;',
    '  border-right-color: rgba(226, 232, 240, 0.9);',
    '  border-bottom-color: rgba(226, 232, 240, 0.9);',
    '}',
    '.swipeloan-theme-light .swipeloan-popup-close { color: #64748b; }',
    '.swipeloan-theme-light .swipeloan-popup-close:hover { background: #f1f5f9; color: #0f172a; }',
    '.swipeloan-popup-text {',
    '  font-size: 13px;',
    '  color: #f1f5f9;',
    '  font-weight: 500;',
    '  line-height: 1.4;',
    '  margin: 0;',
    '}',
    '.swipeloan-popup-close {',
    '  width: 18px;',
    '  height: 18px;',
    '  border-radius: 50%;',
    '  background: transparent;',
    '  border: none;',
    '  color: #94a3b8;',
    '  cursor: pointer;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 15px;',
    '  line-height: 1;',
    '  transition: all 0.2s ease;',
    '  padding: 0;',
    '  flex-shrink: 0;',
    '  margin-top: 1px;',
    '}',
    '.swipeloan-popup-close:hover {',
    '  background: rgba(51, 65, 85, 0.6);',
    '  color: #ffffff;',
    '}',
    '.swipeloan-popup-tail {',
    '  position: absolute;',
    '  bottom: -6px;',
    '  right: 28px;',
    '  width: 12px;',
    '  height: 12px;',
    '  background: rgba(15, 23, 42, 0.96);',
    '  border-right: 1px solid rgba(51, 65, 85, 0.8);',
    '  border-bottom: 1px solid rgba(51, 65, 85, 0.8);',
    '  transform: rotate(45deg);',
    '}',
    '.swipeloan-pos-bottom-left .swipeloan-popup-tail {',
    '  left: 28px;',
    '  right: auto;',
    '  border-right: none;',
    '  border-left: 1px solid rgba(51, 65, 85, 0.8);',
    '}',
    
    '#swipeloan-launcher-btn {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 12px;',
    '  padding: 10px 16px 10px 12px;',
    '  border-radius: 9999px;',
    '  background: rgba(15, 23, 42, 0.95);',
    '  backdrop-filter: blur(16px);',
    '  -webkit-backdrop-filter: blur(16px);',
    '  border: 1px solid rgba(51, 65, 85, 0.7);',
    '  color: #ffffff;',
    '  cursor: pointer;',
    '  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(16, 185, 129, 0.12);',
    '  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);',
    '  outline: none;',
    '  user-select: none;',
    '}',
    '#swipeloan-launcher-btn:hover {',
    '  transform: translateY(-2px);',
    '  border-color: rgba(16, 185, 129, 0.5);',
    '  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.55), 0 0 28px rgba(16, 185, 129, 0.25);',
    '}',
    '#swipeloan-launcher-btn:active { transform: translateY(0) scale(0.98); }',
    
    '.swipeloan-avatar-wrap {',
    '  position: relative;',
    '  width: 42px;',
    '  height: 42px;',
    '  border-radius: 50%;',
    '  background: #ffffff;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 4px;',
    '  box-shadow: 0 2px 8px rgba(0,0,0,0.2);',
    '  flex-shrink: 0;',
    '  box-sizing: border-box;',
    '}',
    '.swipeloan-avatar-img {',
    '  width: 100%;',
    '  height: 100%;',
    '  object-fit: contain;',
    '}',
    '.swipeloan-online-dot {',
    '  position: absolute;',
    '  bottom: -1px;',
    '  right: -1px;',
    '  width: 10px;',
    '  height: 10px;',
    '  background: #10B981;',
    '  border-radius: 50%;',
    '  border: 2px solid #0f172a;',
    '}',
    
    '.swipeloan-text-wrap {',
    '  display: flex;',
    '  flex-direction: column;',
    '  text-align: left;',
    '}',
    '.swipeloan-title-row {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '}',
    '.swipeloan-title {',
    '  font-size: 14.5px;',
    '  font-weight: 700;',
    '  letter-spacing: -0.2px;',
    '  color: #f8fafc;',
    '  line-height: 1.2;',
    '}',
    '.swipeloan-badge {',
    '  font-size: 9px;',
    '  font-weight: 700;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.5px;',
    '  padding: 1px 6px;',
    '  border-radius: 4px;',
    '  background: rgba(16, 185, 129, 0.15);',
    '  color: #34d399;',
    '  border: 1px solid rgba(16, 185, 129, 0.25);',
    '}',
    '.swipeloan-subtitle {',
    '  font-size: 11px;',
    '  color: #94a3b8;',
    '  font-weight: 500;',
    '  line-height: 1.2;',
    '  margin-top: 3px;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 5px;',
    '}',
    
    '.swipeloan-wave-icon {',
    '  display: flex;',
    '  align-items: flex-end;',
    '  gap: 2px;',
    '  height: 10px;',
    '}',
    '.swipeloan-wave-bar {',
    '  width: 2px;',
    '  background: #10B981;',
    '  border-radius: 2px;',
    '  animation: swipeloan-bar 1.2s ease-in-out infinite alternate;',
    '}',
    '.swipeloan-wave-bar:nth-child(1) { height: 4px; animation-delay: 0.1s; }',
    '.swipeloan-wave-bar:nth-child(2) { height: 10px; animation-delay: 0.3s; }',
    '.swipeloan-wave-bar:nth-child(3) { height: 6px; animation-delay: 0.2s; }',
    '@keyframes swipeloan-bar {',
    '  0% { transform: scaleY(0.4); }',
    '  100% { transform: scaleY(1); }',
    '}',
    
    '.swipeloan-mic-cta {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 50%;',
    '  background: rgba(16, 185, 129, 0.12);',
    '  border: 1px solid rgba(16, 185, 129, 0.25);',
    '  color: #34d399;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  margin-left: 4px;',
    '  flex-shrink: 0;',
    '  transition: all 0.25s ease;',
    '}',
    '#swipeloan-launcher-btn:hover .swipeloan-mic-cta {',
    '  background: #10B981;',
    '  color: #0f172a;',
    '  border-color: #10B981;',
    '}',
    
    '#swipeloan-iframe-container {',
    '  display: none;',
    '  position: fixed;',
    '  inset: 0;',
    '  width: 100vw;',
    '  height: 100vh;',
    '  z-index: 2147483647;',
    '  background: transparent;',
    '  opacity: 0;',
    '  transition: opacity 0.25s ease-out;',
    '}',
    '#swipeloan-iframe-container.swipeloan-open {',
    '  display: block;',
    '  opacity: 1;',
    '}',
    '#swipeloan-iframe {',
    '  width: 100%;',
    '  height: 100%;',
    '  border: none;',
    '  background: transparent;',
    '  color-scheme: normal;',
    '  overflow: hidden;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // Create Container Elements
  var rootDiv = document.createElement('div');
  rootDiv.id = 'swipeloan-aanya-root';
  rootDiv.className = (config.position === 'bottom-left' ? 'swipeloan-pos-bottom-left' : 'swipeloan-pos-bottom-right') + (config.theme === 'light' ? ' swipeloan-theme-light' : '');

  var launcherBtn = document.createElement('button');
  launcherBtn.id = 'swipeloan-launcher-btn';
  launcherBtn.setAttribute('aria-label', config.label);
  launcherBtn.innerHTML = [
    '<div class="swipeloan-avatar-wrap">',
    '  <img class="swipeloan-avatar-img" src="https://swipeloan.in/wp-content/uploads/2024/04/swipefund_logo.png" alt="SwipeLoan" />',
    '  <span class="swipeloan-online-dot"></span>',
    '</div>',
    '<div class="swipeloan-text-wrap">',
    '  <div class="swipeloan-title-row">',
    '    <span class="swipeloan-title">' + config.label + '</span>',
    '    <span class="swipeloan-badge">AI Voice</span>',
    '  </div>',
    '  <span class="swipeloan-subtitle">',
    '    <span class="swipeloan-wave-icon">',
    '      <span class="swipeloan-wave-bar"></span>',
    '      <span class="swipeloan-wave-bar"></span>',
    '      <span class="swipeloan-wave-bar"></span>',
    '    </span>',
    '    ' + config.subtitle,
    '  </span>',
    '</div>',
    '<div class="swipeloan-mic-cta">',
    '  <svg style="width: 16px; height: 16px; fill: currentColor;" viewBox="0 0 24 24">',
    '    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>',
    '    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>',
    '  </svg>',
    '</div>'
  ].join('');


  // Create Pop-up Bubble element (WhatsApp Notification Style)
  var popupMessages = [
    '👋 Namaste! Need instant help finding the best loan?',
    '⚡ Get instant pre-approval & lowest interest rates',
    '💬 Salaried or self-employed? Ask me any loan question!',
    '🎙️ Tap here to speak live with me directly!'
  ];
  var currentMsgIndex = 0;
  var isPopupDismissed = false;
  var popupCycleTimer = null;
  var hideTimer = null;

  var popupBubble = document.createElement('div');
  popupBubble.id = 'swipeloan-popup-bubble';
  popupBubble.className = 'swipeloan-popup-bubble';
  popupBubble.innerHTML = [
    '<p id="swipeloan-popup-text" class="swipeloan-popup-text">' + popupMessages[0] + '</p>',
    '<button id="swipeloan-popup-close" class="swipeloan-popup-close" aria-label="Dismiss">&times;</button>',
    '<div class="swipeloan-popup-tail"></div>'
  ].join('');

  rootDiv.appendChild(popupBubble);
  rootDiv.appendChild(launcherBtn);
  document.body.appendChild(rootDiv);

  var popupTextEl = popupBubble.querySelector('#swipeloan-popup-text');
  var popupCloseBtn = popupBubble.querySelector('#swipeloan-popup-close');

  function clearPopupTimers() {
    if (hideTimer) clearTimeout(hideTimer);
    if (popupCycleTimer) clearTimeout(popupCycleTimer);
  }

  // Dismiss handler
  popupCloseBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    isPopupDismissed = true;
    popupBubble.classList.remove('swipeloan-show');
    clearPopupTimers();
  });

  // Clicking popup opens call
  popupBubble.addEventListener('click', function(e) {
    e.preventDefault();
    openWidget();
  });

  // WhatsApp-like Notification Loop: Appears -> Visible for 4.8s -> Disappears -> Pauses 3.2s -> Next message & Re-appears
  function runNotificationCycle() {
    if (isPopupDismissed || isOpen) return;

    // 1. Appear (slide/bounce up)
    popupBubble.classList.add('swipeloan-show');

    // 2. Stay for 4.8s, then disappear
    hideTimer = setTimeout(function() {
      if (isPopupDismissed || isOpen) return;
      popupBubble.classList.remove('swipeloan-show');

      // 3. Stay disappeared for 3.2s, then cycle to next message & re-appear
      popupCycleTimer = setTimeout(function() {
        if (isPopupDismissed || isOpen) return;
        currentMsgIndex = (currentMsgIndex + 1) % popupMessages.length;
        popupTextEl.textContent = popupMessages[currentMsgIndex];
        runNotificationCycle();
      }, 3200);
    }, 4800);
  }

  // Initial delay before first WhatsApp notification
  setTimeout(runNotificationCycle, 1400);

  // Create Modal Overlay / Iframe container
  var iframeContainer = document.createElement('div');
  iframeContainer.id = 'swipeloan-iframe-container';

  var iframe = document.createElement('iframe');
  iframe.id = 'swipeloan-iframe';
  iframe.allow = 'microphone; autoplay; camera';
  iframe.setAttribute('allowtransparency', 'true');
  iframeContainer.appendChild(iframe);
  document.body.appendChild(iframeContainer);

  var isIframeLoaded = false;
  var isOpen = false;

  function primeAudioContext() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        var dummyCtx = new AudioCtx({ latencyHint: 'playback' });
        dummyCtx.resume().then(function() {
          dummyCtx.close();
        }).catch(function() {});
      }
    } catch (_) {}
  }

  function openWidget() {
    primeAudioContext();
    var embedUrl = config.server.replace(/\/+$/, '') + '/aanya/embed';
    if (!isIframeLoaded) {
      iframe.src = embedUrl;
      isIframeLoaded = true;
    } else {
      try {
        iframe.contentWindow.postMessage({ type: 'swipeloan_open_call' }, '*');
      } catch (_) {}
    }

    iframeContainer.classList.add('swipeloan-open');
    launcherBtn.style.display = 'none';
    popupBubble.classList.remove('swipeloan-show');
    clearPopupTimers();
    isOpen = true;
  }

  function closeWidget() {
    iframeContainer.classList.remove('swipeloan-open');
    launcherBtn.style.display = 'flex';
    isOpen = false;
    if (!isPopupDismissed) {
      setTimeout(runNotificationCycle, 800);
    }
    try {
      iframe.contentWindow.postMessage({ type: 'swipeloan_close_call' }, '*');
    } catch (_) {}
  }

  launcherBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openWidget();
  });

  // Listen for close & state messages from the embed iframe
  window.addEventListener('message', function(e) {
    if (!e.data) return;
    if (e.data.type === 'swipeloan_widget_close') {
      closeWidget();
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) {
      closeWidget();
    }
  });

  if (config.autoOpen) {
    setTimeout(openWidget, 1000);
  }

  // Expose global controller
  window.SwipeLoanAanya = {
    open: openWidget,
    close: closeWidget,
    isOpen: function() { return isOpen; }
  };
})();
