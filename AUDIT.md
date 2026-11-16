# Existing Portfolio Audit

## Scope and source of truth

This audit covers every file currently present in `existing-files/`:

- `r2.html` — 54.9 KB, 1,462 lines
- `resumev2.2.html` — 56.9 KB, 1,524 lines
- `IMAGE.jpeg` — 155,604 bytes, 1282 × 1600 portrait image
- `resume.pdf` — 79,260 bytes, two-page PDF

The original files were inspected without modification. The resume PDF is the source of truth for professional facts. Portfolio-only content should not be treated as verified until reconciled against it.

## Resume facts verified from `resume.pdf`

- Name: Ranajoy Bhowmick
- Professional summary: motivated programmer with Java, C, and Python knowledge; interested in new technologies and building simple, useful applications
- Education:
  - B.Tech in Computer Science and Engineering, specialization in Artificial Intelligence and Machine Learning
  - Brainware University, Barasat
  - August 2023 to present
  - Intermediate: Bidhan Chandra Institution, Durgapur, August 2021 to June 2023
  - Matric: St. Michael's School, Durgapur, April 2010 to June 2021
- Certifications:
  - NPTEL, organized by IIT Kharagpur: Java programming, 80/100, 2025
  - Samsung Innovation Campus: Artificial Intelligence Course, 2025
- Projects:
  - Farmer Chatbot Website, developed during SIH Hackathon 2025
  - Random Number Guessing Game in Python
- Internship:
  - Content Writer, Bharat Gaming News, August 2025 to December 2025
- Technical skills: Java, C, Python
- Coursework and learning areas: Data Structures and Algorithms, Object-Oriented Programming, Database Management Systems
- Soft skills: Time Management, Adaptability, Teamwork, Problem-Solving
- Languages: English, Hindi, Bengali
- Interests: reading story books, listening to music, watching movies
- Contact details and public profile URLs are present in the PDF and should be validated before publication.

## Existing implementation overview

Both HTML files are single-file applications. Each combines:

- HTML content
- A large inline stylesheet
- An inline script
- External Google Fonts, Three.js r128, GSAP 3.12.2, and ScrollTrigger

The visual direction is futuristic/neon rather than the requested nature-inspired redesign. The pages use a dark cyber/terminal aesthetic with glowing borders, monospace/display typography, a custom cursor, a loader, a WebGL particle background, and dense single-page sections.

### Shared page structure

Both files include:

1. Fixed navigation with desktop links, theme button, and mobile menu
2. Hero with animated role text, resume download/view buttons, and `IMAGE.jpeg`
3. About section with profile copy and contact/identity facts
4. Skills section with technical and soft-skill displays
5. Projects section
6. Education and certifications timeline
7. Experience timeline
8. Anonymous discussion zone
9. Web3Forms contact form
10. Contact links and footer

### Shared styling and interaction

Reusable existing behavior includes:

- Smooth scrolling and a fixed scroll-progress indicator
- Responsive navigation drawer with open, close, link-close, and outside-click behavior
- Loader with animated name reveal and progress bar
- Typewriter role rotation
- IntersectionObserver reveal animations
- Custom cursor and hover scaling
- Button ripple effect
- Resume download and new-tab view actions
- Three.js particle/line background with resize handling
- Light-mode CSS variable override
- Discussion posts with add, edit, delete, and HTML escaping
- Native required/email form validation

## File comparison

### `r2.html`

`r2.html` is the earlier version (footer version 2.8). It contains two projects: Farmer Chatbot Website and Number Guessing Game. The email is passed through Cloudflare email-obfuscation markup and depends on a Cloudflare-provided decode script/path. Its light-mode background variables are set to a gray-blue value rather than white.

### `resumev2.2.html`

`resumev2.2.html` is the newer and better content baseline (footer version 2.9). It adds:

- AcademiQ
- Chromify

It also uses the readable plain email address in both the identity and contact areas, removes the Cloudflare email-decode script, and changes the light-mode base variables to white. The font URL is split across lines and contains whitespace/newline formatting that should be normalized if reused.

The newer file should be used as reference for content structure, but not copied as the new implementation. It still inherits the same architectural and reliability problems.

## Reusable functionality

### Safe concepts to retain

- Content categories and section ordering required by the guide
- Resume download/view intent and local PDF asset
- Portrait asset and descriptive alt text
- Project card information model
- Education/certification/experience timeline model
- IntersectionObserver-based reveal approach
- Mobile navigation interaction model
- Scroll progress calculation
- `prefers-reduced-motion` requirement should be added to the new implementation
- Discussion input escaping concept, if the discussion feature remains in scope

### Reuse with redesign/refactoring

- Theme switching should become a data-driven theme system with localStorage, not a single body class toggle.
- Layout markup should be generated or selected from shared content data so four layouts can show identical information.
- Resume actions should use a semantic link/button structure and explicit failure behavior.
- Project cards should be data-driven and should not render placeholder `href="#"` links.
- Contact form behavior should be asynchronous, validated, duplicate-submission-safe, and should expose success/error states.
- WebGL background should be optional, lazy, and disabled or simplified for reduced motion, low-power devices, and unsupported WebGL.

## Existing problems and risks

### Content and correctness

- The two HTML files disagree about the current project set; `resumev2.2.html` is newer, but all professional content still needs final reconciliation against the PDF.
- Project cards for Farmer Chatbot and Number Guessing Game use the GitHub profile URL rather than project-specific repositories and include nonfunctional `#` demo links.
- Project details in the newer page include AcademiQ and Chromify, but these are not present in the supplied resume PDF. They require explicit confirmation before being presented as resume-backed claims.
- The page includes a public phone number and email address. Publication should be intentional and consistent with the final contact strategy.
- The discussion zone is not part of the project guide's required portfolio sections and has no persistence or moderation model.

### Security and privacy

- A Web3Forms access key is hardcoded in both HTML files. Treat it as exposed, rotate it if valid, and never copy it into the new source.
- The contact form submits directly to a third party and redirects to `thankyou.html`, which is not present in `existing-files/`.
- External links opened with `target="_blank"` do not consistently include `rel="noopener noreferrer"`.
- Third-party CDN dependencies create availability, privacy, and supply-chain considerations.

### Functional defects

- `resumev2.2.html` loads GSAP and ScrollTrigger but does not use them; they are unnecessary payload.
- The light-mode cursor selectors target `body.light-theme`, while the toggle applies `light-mode`, so those cursor rules do not activate.
- The theme toggle changes the class only for the current page; it does not persist preferences.
- The `setTimeout(() => {}, 1200)` in the typewriter logic does not pause the typewriter.
- The WebGL animation runs continuously and is not gated by reduced-motion preference or visibility.
- The cursor's `setInterval` is never cleared and is unsuitable for touch devices; the CSS hides the cursor only in a media query.
- The discussion edit action writes user input with `textContent`, which is safe, but the initial seeded message and UI affordances imply a social feature without persistence or moderation.
- The HTML structure places contact information outside the closing form/section flow in a way that is difficult to maintain and should be corrected during redesign.
- The Cloudflare email decode dependency in `r2.html` can fail when the file is opened outside the original deployment.

### Accessibility

- The custom cursor hides the native cursor on all body content and adds interaction cost.
- Many buttons and labels are styled but the form labels are not associated with inputs using `for`/`id`.
- The mobile menu lacks a complete dialog/expanded-state/focus-management model.
- Decorative canvas, loader, and animation behavior are not fully announced or reduced for assistive technology.
- Contrast, keyboard navigation, focus-visible styling, touch targets, and screen-reader status messages need dedicated validation.

### Performance and maintainability

- Each HTML file is a monolith with duplicated CSS and JavaScript.
- The page loads Three.js and multiple font families before the main content is usable.
- The particle system creates 1,200 points and 80 line objects and runs continuously.
- Inline handlers, global functions, duplicated selectors, and inconsistent naming (`fade-up`/`fu`, `section-title`/`sec-title`) make changes risky.
- No localStorage, module boundaries, content model, build process, or automated test surface exists.
- There is no evidence in the supplied directory of responsive testing, broken-link testing, or contact integration testing.

## Asset assessment

`IMAGE.jpeg` is a usable portrait with a large vertical composition and enough resolution for a responsive hero/profile image. It has a blurred outdoor background and a centered head-and-shoulders subject. The new implementation should use `object-fit`/`object-position` deliberately, provide a responsive crop, and consider a compressed derivative for initial loading.

`resume.pdf` should be copied or referenced from the new portfolio only after confirming the final filename/path and validating both download and new-tab viewing. It should not be regenerated from HTML.

## Recommended baseline

Use `resumev2.2.html` as the content/layout reference, not as code to duplicate. Preserve verified resume facts, retain the portrait and PDF, and selectively retain the interaction ideas listed above. Rebuild the implementation around the required five themes, four independent layouts, modular ES modules, accessible controls, persisted preferences, reduced-motion support, and explicit contact-form states.

