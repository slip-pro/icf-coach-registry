/**
 * ICF Registry — project mode (site BACKLOG #57).
 *
 * `?project=wit` turns the catalogue into a coaching project's choice page:
 * only the coaches the lead accepted, in an order of this visitor's own, each
 * with the places left and a "Choose this coach" button instead of contacts.
 * A direct message would bypass the count, so the contacts stay hidden.
 *
 * Choosing asks for the participant's name, email, Fienta ticket number and
 * consent; the Apps Script checks the ticket and sends both an introduction.
 */

import { t } from './i18n.js';
import { esc } from './utils.js';

const ORDER_KEY = 'icf-project-order';

/** The project slug from the page address, or '' for the plain catalogue. */
export function projectSlug(search = (typeof location !== 'undefined' ? location.search : '')) {
  const slug = new URLSearchParams(search).get('project') || '';
  return /^[a-z0-9-]{1,40}$/i.test(slug) ? slug.toLowerCase() : '';
}

/** GET /api/project — null when the project is unknown or the call failed. */
export async function fetchProject(apiBase, slug) {
  try {
    const response = await fetch(`${apiBase.replace(/\/$/, '')}/project?slug=${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(20000) });
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.project : null;
  } catch (_err) {
    return null;
  }
}

/** A small seeded generator, so one visitor keeps one order across re-renders. */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function visitorSeed() {
  try {
    const kept = Number(sessionStorage.getItem(ORDER_KEY));
    if (kept) return kept;
    const fresh = Math.floor(Math.random() * 2 ** 31) + 1;
    sessionStorage.setItem(ORDER_KEY, String(fresh));
    return fresh;
  } catch (_err) {
    return Math.floor(Math.random() * 2 ** 31) + 1;
  }
}

/**
 * The project's coaches out of the catalogue, with `placesLeft`, shuffled
 * for this visitor. Nobody is first for everybody, so nobody is swamped.
 */
export function projectCoaches(coaches, project, seed = visitorSeed()) {
  const places = new Map(project.coaches.map((c) => [(c.email || '').toLowerCase(), c.placesLeft]));
  const mine = coaches
    .filter((c) => places.has((c.email || '').toLowerCase()))
    .map((c) => ({ ...c, placesLeft: places.get(c.email.toLowerCase()) }));
  const random = seededRandom(seed);
  for (let i = mine.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [mine[i], mine[j]] = [mine[j], mine[i]];
  }
  return mine;
}

/** The card's bottom: places left and the button, in place of the contacts. */
export function renderProjectAction(coach, index) {
  if (coach.placesLeft < 1) {
    return `<p class="icf-project-places icf-project-places--full">${esc(t('projectFull'))}</p>`;
  }
  return `
    <p class="icf-project-places">${esc(t('projectPlacesLeft').replace('{n}', coach.placesLeft))}</p>
    <button type="button" class="icf-project-choose" data-choose-index="${index}">
      ${esc(t('projectChoose'))}
    </button>`;
}

/** The line under the header (which carries the project's name): what the page is for. */
export function renderProjectIntro(project) {
  const closed = project.status !== 'open';
  return `
    <section class="icf-project-intro">
      <p>${esc(t(closed ? 'projectClosedNote' : 'projectIntro'))}</p>
    </section>`;
}

/** Answers that mean "ask again", not "no". */
const RETRY_ERRORS = ['busy', 'timeout', 'unavailable'];

const ERROR_KEYS = {
  ticket_not_found: 'projectErrTicketNotFound',
  ticket_used: 'projectErrTicketUsed',
  ticket_other_event: 'projectErrTicketOther',
  ticket_required: 'projectErrTicketRequired',
  coach_full: 'projectErrCoachFull',
  coach_not_in_project: 'projectErrCoachFull',
  project_closed: 'projectClosedNote',
  consent_required: 'projectErrConsent',
  name_email_required: 'projectErrNameEmail',
};

/**
 * Opens the choice form for a coach. `onDone` runs after a successful
 * choice, so the page can refresh the places.
 */
export function openChooseForm(coach, { apiBase, slug, paid = true, onDone, onClose } = {}) {
  closeChooseForm();
  let chosen = false;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="icf-modal-overlay icf-choose-overlay" role="dialog" aria-label="${esc(t('projectChooseTitle'))}">
      <form class="icf-modal icf-choose-form" novalidate>
        <button type="button" class="icf-modal__close" aria-label="${esc(t('closeModal'))}">&times;</button>
        <h2 class="icf-choose-form__title">${esc(t('projectChooseTitle'))}</h2>
        <p class="icf-choose-form__coach">${esc(coach.name)}</p>
        <label class="icf-choose-form__field">${esc(t('projectYourName'))}
          <input name="name" type="text" autocomplete="name" required></label>
        <label class="icf-choose-form__field">${esc(t('projectYourEmail'))}
          <input name="email" type="email" autocomplete="email" required></label>
        ${paid ? `<label class="icf-choose-form__field">${esc(t('projectTicket'))}
          <input name="ticket" type="text" autocomplete="off" required>
          <small>${esc(t('projectTicketHint'))}</small></label>` : ''}
        <label class="icf-choose-form__consent"><input name="consent" type="checkbox" required>
          <span>${esc(t('projectConsent'))}</span></label>
        <p class="icf-choose-form__message" role="status" aria-live="polite"></p>
        <button type="submit" class="icf-project-choose">${esc(t('projectSubmit'))}</button>
      </form>
    </div>`;
  const overlay = wrapper.firstElementChild;
  (document.querySelector('.icf-registry') || document.body).appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  const form = overlay.querySelector('form');
  const message = overlay.querySelector('.icf-choose-form__message');
  const submit = form.querySelector('button[type="submit"]');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.icf-modal__close')) {
      closeChooseForm();
      if (onClose) onClose(chosen);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(form));
    if (!fields.consent) { message.textContent = t('projectErrConsent'); return; }
    submit.disabled = true;
    message.textContent = t('projectSending');
    const body = JSON.stringify({
      action: 'chooseCoach', project: slug, coachEmail: coach.email,
      name: fields.name, email: fields.email, ticket: fields.ticket || '', consent: true,
    });
    // Google sometimes keeps the script waiting. Asking again is safe — the
    // same ticket gets the same coach — so a slow or busy answer is retried
    // before the visitor is told anything went wrong.
    let data = null;
    for (let tries = 0; tries < 3; tries++) {
      try {
        const response = await fetch(`${apiBase.replace(/\/$/, '')}/project`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.timeout(65000),
        });
        data = await response.json();
      } catch (_err) {
        data = null;
      }
      if (data && (data.success || !RETRY_ERRORS.includes(data.error))) break;
      if (tries === 0) message.textContent = t('projectStillChecking');
    }
    if (data && data.success) {
      form.innerHTML = `
        <button type="button" class="icf-modal__close" aria-label="${esc(t('closeModal'))}">&times;</button>
        <h2 class="icf-choose-form__title">${esc(t('projectDoneTitle'))}</h2>
        <p>${esc(t(data.already ? 'projectAlready' : 'projectDone').replace('{coach}', data.coachName || coach.name))}</p>`;
      chosen = true;
      if (onDone) onDone();
      return;
    }
    submit.disabled = false;
    message.textContent = t((data && ERROR_KEYS[data.error]) || 'projectErrGeneric');
  });
}

export function closeChooseForm() {
  const overlay = document.querySelector('.icf-choose-overlay');
  if (!overlay) return;
  overlay.remove();
  document.body.style.overflow = '';
}
