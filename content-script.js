const BLOCKER_ID = 'reel-blocker-overlay';

function isReelsFeed() {
  const pathname = window.location.pathname;
  return /^\/reels\/?$/.test(pathname);
}

function showBlocker() {
  if (document.getElementById(BLOCKER_ID)) return;

  const blocker = document.createElement('div');
  blocker.id = BLOCKER_ID;
  blocker.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #d0d0d0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #666;
  `;

  const message = document.createElement('div');
  message.style.cssText = `
    font-size: 24px;
    font-weight: 600;
    text-align: center;
  `;
  message.textContent = 'Scroll des reels désactivé';

  const subtext = document.createElement('div');
  subtext.style.cssText = `
    font-size: 14px;
    color: #999;
    text-align: center;
    max-width: 300px;
  `;
  subtext.textContent = 'Tu peux toujours regarder les reels envoyés en DM ou via lien direct';

  blocker.appendChild(message);
  blocker.appendChild(subtext);
  document.body.appendChild(blocker);
}

function removeBlocker() {
  const blocker = document.getElementById(BLOCKER_ID);
  if (blocker) blocker.remove();
}

function checkRoute() {
  if (isReelsFeed()) {
    showBlocker();
  } else {
    removeBlocker();
  }
}

// Run on page load
checkRoute();

// Patch history.pushState to detect SPA navigations
const originalPushState = window.history.pushState;
window.history.pushState = function(...args) {
  originalPushState.apply(window.history, args);
  setTimeout(checkRoute, 100);
};

// Listen to popstate (back/forward button)
window.addEventListener('popstate', () => {
  setTimeout(checkRoute, 100);
});

// Fallback: listen to hash changes
window.addEventListener('hashchange', checkRoute);
