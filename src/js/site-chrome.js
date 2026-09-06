/**
 * ICF Registry -- shared site chrome for the standalone pages.
 *
 * The registry lives on its own subdomain, so without this a visitor
 * arriving from "Find a coach" lands on a page with no way back and a
 * different-looking header. This renders the same header and footer as
 * the main ICF Cyprus site around the widget.
 *
 * Deliberately NOT used by the widget itself: a WordPress page embeds
 * the widget alone and keeps its own theme chrome.
 *
 * @module site-chrome
 */

/**
 * The main ICF Cyprus website. Update here when the custom domain is
 * attached — this is the only place the address appears.
 */
const SITE_URL = 'https://icf-cyprus-website.vercel.app';

const NAV = [
  { href: '/about', label: 'About ICF & coaching' },
  { href: '/events', label: 'Events' },
  { href: '/articles', label: 'Articles & blog' },
  { href: '/coaches', label: 'Find a coach', current: true },
  { href: '/friends', label: 'Friends of ICF' },
  { href: '/partnership', label: 'Partnership' },
];

const LOGO_ALT = 'ICF Cyprus Charter Chapter';

/**
 * @param {{ href: string, label: string, current?: boolean }} item
 * @returns {string}
 */
function navLink(item) {
  const current = item.current ? ' aria-current="page"' : '';
  return `<a href="${SITE_URL}${item.href}"${current}>${item.label}</a>`;
}

/**
 * Build the header and footer markup.
 * @param {string} logoUrl -- path to the logo, relative to the calling page
 * @returns {{ header: string, footer: string }}
 */
export function siteChromeHTML(logoUrl) {
  const header = `
    <header class="icf-site-header">
      <div class="icf-site-header__inner">
        <a href="${SITE_URL}" aria-label="ICF Cyprus — home">
          <img src="${logoUrl}" alt="${LOGO_ALT}" class="icf-site-header__logo">
        </a>

        <nav class="icf-site-nav">${NAV.map(navLink).join('')}</nav>

        <!-- Wrapper stays in the layout even when the menu inside it is hidden,
             so space-between distributes the header exactly as it does on the
             main site. Without it the nav slides to the right edge and the two
             headers no longer line up. -->
        <div class="icf-site-header__actions">
          <details class="icf-site-menu">
            <summary aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
                <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor"
                      stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
            </summary>
            <nav class="icf-site-menu__panel">${NAV.map(navLink).join('')}</nav>
          </details>
        </div>
      </div>
    </header>
  `;

  const footer = `
    <footer class="icf-site-footer">
      <div class="icf-site-footer__inner">
        <div>
          <img src="${logoUrl}" alt="${LOGO_ALT}" class="icf-site-footer__logo">
          <p>
            Demetras 9, Strovolos, 2058 Nicosia, Cyprus<br>
            info.icf.cyprus@gmail.com
          </p>
          <p class="icf-site-footer__legal">
            &copy; ${new Date().getFullYear()} ICF Cyprus Chapter
          </p>
        </div>
        <div>
          <p><a href="${SITE_URL}">Back to the ICF Cyprus website &rarr;</a></p>
          <p><a href="${SITE_URL}/friends">Friends of ICF Cyprus &rarr;</a></p>
          <p><a href="${SITE_URL}/events">Upcoming events &rarr;</a></p>
        </div>
      </div>
    </footer>
  `;

  return { header, footer };
}

/**
 * Wrap the widget container with the site header and footer.
 *
 * @param {string} containerId -- id of the widget container element
 * @param {string} logoUrl -- path to the logo, relative to the calling page
 */
export function mountSiteChrome(containerId, logoUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { header, footer } = siteChromeHTML(logoUrl);
  container.insertAdjacentHTML('beforebegin', header);
  container.insertAdjacentHTML('afterend', footer);
  document.body.classList.add('icf-site');
}
