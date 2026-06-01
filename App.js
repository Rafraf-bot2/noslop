import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef } from 'react';

const CONTENT_SCRIPT = `
(function() {
  if (window.__NOREELS__) return;
  window.__NOREELS__ = true;

  var BLOCKER_ID = 'reel-blocker-overlay';

  // --- Overlay (blocks /reels/ feed) ---
  function isReelsFeed() {
    var p = window.location.pathname;
    return p === '/reels' || p === '/reels/' || p.startsWith('/reels/?');
  }

  function showBlocker() {
    if (document.getElementById(BLOCKER_ID)) return;
    var el = document.createElement('div');
    el.id = BLOCKER_ID;
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#d0d0d0;z-index:2147483647;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;font-family:sans-serif;';
    el.innerHTML = '<div style="font-size:20px;font-weight:700;color:#444;text-align:center;">Scroll des reels désactivé</div><div style="font-size:13px;color:#888;text-align:center;max-width:260px;">Les reels reçus en DM restent accessibles via lien direct</div>';
    document.body.appendChild(el);
  }

  function removeBlocker() {
    var el = document.getElementById(BLOCKER_ID);
    if (el) el.remove();
  }

  // --- Hide reels nav tab ---
  function hideReelsTab() {
    // by href (with and without trailing slash)
    ['a[href="/reels/"]', 'a[href="/reels"]'].forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(a) {
        var parent = a.closest('li') || a.closest('[role="listitem"]') || a.parentElement;
        if (parent) parent.style.setProperty('display','none','important');
        a.style.setProperty('display','none','important');
      });
    });
    // by aria-label
    ['Reels', 'Reels Feed'].forEach(function(label) {
      document.querySelectorAll('[aria-label="' + label + '"]').forEach(function(el) {
        var parent = el.closest('li') || el.parentElement;
        if (parent) parent.style.setProperty('display','none','important');
        el.style.setProperty('display','none','important');
      });
    });
  }

  // --- Intercept clicks on reels tab as extra layer ---
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (a && (a.getAttribute('href') === '/reels/' || a.getAttribute('href') === '/reels')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  // --- Patch pushState to catch SPA navigations ---
  var _push = window.history.pushState;
  window.history.pushState = function() {
    _push.apply(window.history, arguments);
    tick();
  };
  window.addEventListener('popstate', tick);

  function tick() {
    setTimeout(function() {
      hideReelsTab();
      if (isReelsFeed()) showBlocker(); else removeBlocker();
    }, 80);
  }

  // --- Polling fallback (catches anything that slips through) ---
  setInterval(function() {
    hideReelsTab();
    if (isReelsFeed()) showBlocker(); else removeBlocker();
  }, 600);

  tick();
})();
true;
`;

export default function App() {
  const webViewRef = useRef(null);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.instagram.com' }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        userAgent="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        injectedJavaScriptBeforeContentLoaded={CONTENT_SCRIPT}
        injectedJavaScript={CONTENT_SCRIPT}
        scalesPageToFit={true}
        mixedContentMode="always"
        onNavigationStateChange={(navState) => {
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(CONTENT_SCRIPT);
          }
        }}
      />
    </View>
  );
}
