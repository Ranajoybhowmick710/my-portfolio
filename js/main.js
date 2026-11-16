import { portfolioContent as content } from './content.js';
import { loadPreferences } from './state/preferences.js';
import { initThemeController } from './theme/theme-controller.js';
import { initBackgroundController } from './theme/background-controller.js';
import { initMusicController } from './theme/music-controller.js';
import { initLayoutController } from './layout/layout-controller.js';
import { initNavigation } from './ui/navigation.js';
import { initReveal } from './ui/reveal.js';
import { initContactForm } from './contact/contact-form.js';
import { initGuestbook } from './ui/guestbook.js';
import { initSecretGarden } from './game/secret-garden.js';
import { initPatternQuest } from './game/pattern-quest.js';

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function renderAbout() {
  const target = document.querySelector('[data-content="about"]');
  target.innerHTML = `
    <div class="about-story reveal">
      <p>${escapeHtml(content.identity.summary)}</p>
      <p>Currently studying at ${escapeHtml(content.education[0].organization)}, I’m building a practical foundation in programming, algorithms, databases, and object-oriented thinking.</p>
    </div>
    <dl class="fact-list reveal reveal--late">
      <div><dt>Based in</dt><dd>${escapeHtml(content.identity.location)}</dd></div>
      <div><dt>Focus</dt><dd>${escapeHtml(content.identity.focus)}</dd></div>
      <div><dt>Approach</dt><dd>Curious, patient, practical</dd></div>
    </dl>`;
}

function renderSkills() {
  const target = document.querySelector('[data-content="skills"]');
  target.innerHTML = `
    <div class="skill-cloud reveal">${content.technicalSkills.map(skill => `<span class="skill-pill"><strong>${escapeHtml(skill.name)}</strong><small>${escapeHtml(skill.note)}</small></span>`).join('')}</div>
    <div class="supporting-skills reveal reveal--late">
      <div><h3>People skills</h3><p>${content.softSkills.map(escapeHtml).join(' · ')}</p></div>
      <div><h3>Languages</h3><p>${content.languages.map(escapeHtml).join(' · ')}</p></div>
      <div><h3>Off-screen</h3><p>${content.interests.map(escapeHtml).join(' · ')}</p></div>
    </div>`;
}

function renderProjects() {
  const target = document.querySelector('[data-content="projects"]');
  target.innerHTML = content.projects.map((project, index) => `
    <article class="project-card reveal ${index % 2 ? 'project-card--offset' : ''}">
      <div class="project-number">0${index + 1}</div>
      <div class="project-card-body">
        <p class="card-kicker">${escapeHtml(project.period)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="tag-list">${project.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
        ${project.links.length ? `<div class="project-links">${project.links.map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : ''}
      </div>
    </article>`).join('');
}

function renderJourney() {
  const target = document.querySelector('[data-content="journey"]');
  const renderTimeline = items => `<div class="timeline">${items.map(item => `
    <article class="timeline-item reveal">
      <p class="card-kicker">${escapeHtml(item.period)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="timeline-org">${escapeHtml(item.organization)}</p>
      ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ''}
    </article>`).join('')}</div>`;
  target.innerHTML = `
    <section id="education" class="journey-subsection">
      <h3 class="subsection-title">Education</h3>${renderTimeline(content.education)}
    </section>
    <section id="experience" class="journey-subsection">
      <h3 class="subsection-title">Experience</h3>${renderTimeline(content.experience)}
    </section>
    <section id="certifications" class="journey-subsection">
      <h3 class="subsection-title">Certifications &amp; achievements</h3>${renderTimeline(content.certifications)}
    </section>`;
}

function renderContact() {
  const target = document.querySelector('[data-content="contact"]');
  target.innerHTML = `
    <p class="contact-lede">Whether you want to share an idea, talk about a project, or simply say hello, I’d be glad to hear from you.</p>
    <a class="contact-email" href="mailto:${escapeHtml(content.social.email)}">${escapeHtml(content.social.email)} <span aria-hidden="true">↗</span></a>
    <div class="social-links">
      <a href="${escapeHtml(content.social.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
      <a href="${escapeHtml(content.social.github)}" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </div>`;
}

function renderContent() {
  renderAbout();
  renderSkills();
  renderProjects();
  renderJourney();
  renderContact();
}

function initScrollProgress() {
  const progress = document.querySelector('[data-scroll-progress]');
  if (!progress) return;
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.setProperty('--scroll-progress', `${Math.min(100, percentage)}%`);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

const preferences = loadPreferences();
renderContent();
const musicController = initMusicController(preferences.theme);
initThemeController(preferences.theme, musicController.setTheme);
initBackgroundController(preferences.background, musicController.setBackground);
initLayoutController(preferences.layout);
initNavigation();
initReveal();
initContactForm();
initGuestbook();
initSecretGarden();
initPatternQuest();
initScrollProgress();
