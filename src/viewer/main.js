// CSS loaded via <link> in HTML; dynamic import for Vite build compat
import('./viewer.css').catch(() => {});
import { DEFAULT_PAGE, prototypeGroups, prototypePageMap } from './prototype-pages.js';

const viewerNav = document.getElementById('viewerNav');
const viewerFrame = document.getElementById('viewerFrame');
const viewerSidebar = document.getElementById('viewerSidebar');
const viewerDrawerToggle = document.getElementById('viewerDrawerToggle');
const viewerDrawerClose = document.getElementById('viewerDrawerClose');
const viewerDrawerOverlay = document.getElementById('viewerDrawerOverlay');
const viewerCurrentTitle = document.getElementById('viewerCurrentTitle');
const viewerCurrentPath = document.getElementById('viewerCurrentPath');
const viewerStatus = document.getElementById('viewerStatus');
const viewerSearchInput = document.getElementById('viewerSearchInput');
const viewerBackBtn = document.getElementById('viewerBackBtn');
const viewerForwardBtn = document.getElementById('viewerForwardBtn');
const viewerRefreshBtn = document.getElementById('viewerRefreshBtn');
const viewerOpenBtn = document.getElementById('viewerOpenBtn');
const viewerCopyBtn = document.getElementById('viewerCopyBtn');

let currentPage = '';
let isDrawerOpen = false;

const toggleDrawer = (open) => {
  isDrawerOpen = open;
  viewerSidebar.classList.toggle('is-open', open);
  viewerDrawerToggle.setAttribute('aria-expanded', String(open));
  viewerDrawerOverlay.hidden = !open;
  document.body.classList.toggle('viewer-drawer-open', open);
};

const normalizePagePath = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return DEFAULT_PAGE;
  }

  return trimmed.replace(/^\/+/, '');
};

const getPageFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return normalizePagePath(params.get('page'));
};

const setStatus = (message) => {
  viewerStatus.textContent = message;
};

const getShareUrl = (page) => {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  return url.toString();
};

const updateToolbar = (page) => {
  const matchedPage = prototypePageMap.get(page);
  viewerCurrentTitle.textContent = matchedPage ? `${matchedPage.groupLabel} / ${matchedPage.label}` : 'Custom Page';
  viewerCurrentPath.textContent = page;
  viewerOpenBtn.disabled = false;
  viewerCopyBtn.disabled = false;
};

const highlightActivePage = (page) => {
  viewerNav.querySelectorAll('[data-page-path]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.pagePath === page);
  });
};

const syncUrl = (page, mode = 'replace') => {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);

  if (mode === 'push') {
    window.history.pushState({ page }, '', url);
  } else {
    window.history.replaceState({ page }, '', url);
  }
};

const updateViewerState = (page, options = {}) => {
  const normalizedPage = normalizePagePath(page);
  currentPage = normalizedPage;
  highlightActivePage(normalizedPage);
  updateToolbar(normalizedPage);
  syncUrl(normalizedPage, options.historyMode || 'replace');
};

const openPage = (page, options = {}) => {
  const normalizedPage = normalizePagePath(page);
  const nextUrl = new URL(normalizedPage, window.location.href);

  if (viewerFrame.getAttribute('src') !== nextUrl.pathname.replace(/^\//, '') && viewerFrame.getAttribute('src') !== normalizedPage) {
    viewerFrame.src = normalizedPage;
  }

  updateViewerState(normalizedPage, { historyMode: options.historyMode || 'push' });
  setStatus(`已打开 ${normalizedPage}`);
};

const renderNavigation = (keyword = '') => {
  const loweredKeyword = keyword.trim().toLowerCase();

  viewerNav.innerHTML = prototypeGroups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        if (!loweredKeyword) {
          return true;
        }

        return `${group.label} ${item.label} ${item.path}`.toLowerCase().includes(loweredKeyword);
      });

      if (filteredItems.length === 0) {
        return '';
      }

      return `
        <section class="viewer-nav__group">
          <h2>${group.label}</h2>
          <div class="viewer-nav__items">
            ${filteredItems
              .map(
                (item) => `
                  <button type="button" data-page-path="${item.path}">
                    <span>${item.label}</span>
                    <small>${item.path}</small>
                  </button>
                `,
              )
              .join('')}
          </div>
        </section>
      `;
    })
    .join('');

  viewerNav.querySelectorAll('[data-page-path]').forEach((button) => {
    button.addEventListener('click', () => {
      openPage(button.dataset.pagePath, { historyMode: 'push' });
      toggleDrawer(false);
    });
  });

  highlightActivePage(currentPage);
};

const resolveFramePage = () => {
  try {
    const frameUrl = new URL(viewerFrame.contentWindow.location.href);
    const relativePath = frameUrl.pathname.replace(window.location.pathname.replace(/index\.html$/, ''), '').replace(/^\//, '');
    return normalizePagePath(relativePath);
  } catch {
    return currentPage;
  }
};

viewerSearchInput.addEventListener('input', () => {
  renderNavigation(viewerSearchInput.value);
});

viewerDrawerToggle.addEventListener('click', () => {
  toggleDrawer(!isDrawerOpen);
});

viewerDrawerClose.addEventListener('click', () => {
  toggleDrawer(false);
});

viewerDrawerOverlay.addEventListener('click', () => {
  toggleDrawer(false);
});

viewerBackBtn.addEventListener('click', () => {
  try {
    viewerFrame.contentWindow.history.back();
    setStatus('预览页后退。');
  } catch {
    setStatus('当前预览无法后退。');
  }
});

viewerForwardBtn.addEventListener('click', () => {
  try {
    viewerFrame.contentWindow.history.forward();
    setStatus('预览页前进。');
  } catch {
    setStatus('当前预览无法前进。');
  }
});

viewerRefreshBtn.addEventListener('click', () => {
  try {
    viewerFrame.contentWindow.location.reload();
    setStatus('预览已刷新。');
  } catch {
    viewerFrame.src = currentPage;
    setStatus('预览已重载。');
  }
});

viewerOpenBtn.addEventListener('click', () => {
  if (!currentPage) {
    return;
  }

  window.open(new URL(currentPage, window.location.href), '_blank', 'noopener,noreferrer');
});

viewerCopyBtn.addEventListener('click', async () => {
  if (!currentPage) {
    return;
  }

  try {
    await navigator.clipboard.writeText(getShareUrl(currentPage));
    setStatus('分享链接已复制。');
  } catch {
    setStatus('剪贴板不可用,请手动复制当前 URL。');
  }
});

viewerFrame.addEventListener('load', () => {
  const framePage = resolveFramePage();
  updateViewerState(framePage, { historyMode: 'replace' });
  setStatus(`预览已同步至 ${framePage}`);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isDrawerOpen) {
    toggleDrawer(false);
  }
});

window.addEventListener('popstate', () => {
  const page = getPageFromUrl();
  if (page !== currentPage) {
    viewerFrame.src = page;
    updateViewerState(page, { historyMode: 'replace' });
    setStatus(`从浏览器历史恢复 ${page}。`);
  }
});

renderNavigation();
toggleDrawer(false);

const initialPage = prototypePageMap.has(getPageFromUrl()) ? getPageFromUrl() : DEFAULT_PAGE;
openPage(initialPage, { historyMode: 'replace' });

if (!prototypePageMap.has(initialPage)) {
  setStatus(`已加载自定义页面 ${initialPage}`);
}
