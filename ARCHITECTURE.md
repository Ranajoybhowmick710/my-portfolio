# Recommended Technical Architecture

## Goals

Build a lightweight static portfolio using HTML5, CSS3, and modern Vanilla JavaScript ES modules. The architecture supports Auto Theme, six manual themes, four independent layouts, shared verified content, responsive behavior, accessibility, and the existing games without introducing a framework.

## Proposed directory structure

```text
new-portfolio/
├── index.html
├── README.md
├── resume.pdf
├── assets/
│   ├── images/
│   │   ├── portrait.jpg
│   │   └── ...
│   ├── icons/
│   └── audio/
├── css/
│   ├── reset.css
│   ├── tokens.css
│   ├── base.css
│   ├── components.css
│   ├── themes.css
│   ├── layouts.css
│   ├── game.css
│   ├── quest.css
│   ├── responsive.css
│   └── modern.css
└── js/
    ├── main.js
    ├── content.js
    ├── state/
    │   ├── preferences.js
    │   └── storage.js
    ├── theme/
    │   ├── theme-controller.js
    │   ├── background-controller.js
    │   └── music-controller.js
    ├── audio/
    │   └── procedural-audio.js
    ├── game/
    │   ├── secret-garden.js
    │   └── pattern-quest.js
    ├── layout/
    │   └── layout-controller.js
    ├── ui/
    │   ├── navigation.js
    │   ├── reveal.js
    │   ├── loader.js
    │   └── project-cards.js
    ├── contact/
    │   └── contact-form.js
```

The exact file split can be reduced if implementation size stays small, but the boundaries should remain clear. Content, state, presentation, and feature behavior should not be combined into another monolithic HTML file.

## Application model

### Single content source

`content.js` should export typed-by-convention plain data for:

- identity and summary
- contact links
- skills
- projects
- education
- certifications and achievements
- experience
- resume metadata

Layouts consume the same data. They must not maintain separate copies of professional content. Any uncertain item should be excluded or marked for approval rather than invented.

### Independent preference state

Maintain separate state values:

```text
theme: auto-theme | botanical-morning | tropical-paradise | ocean-breeze | sunset-horizon | midnight-forest | starry-night
layout: nature-editorial | modern-bento | creative-storytelling | minimal-developer
```

Use separate versioned localStorage keys, for example:

```text
ranajoy-portfolio:theme:v1
ranajoy-portfolio:layout:v1
ranajoy-portfolio:game-high-score:v1
```

`theme-controller.js` resolves Auto Theme using six exact Asia/Kolkata periods: Botanical Morning (05:00–09:00), Tropical Paradise (09:00–12:00), Ocean Breeze (12:00–15:00), Dusk Forest (15:00–18:00 using the Midnight Forest palette), Sunset Horizon (18:00–21:00), and Starry Night (21:00–05:00). It schedules the next boundary without requiring a refresh, while preserving a manual selection until the visitor changes it. `modern.css` is loaded as the final presentation layer so spacing, card treatment, responsive alignment, and restrained Starry Night effects can be refined without replacing the existing feature styles.

`contact-form.js` reads the public Web3Forms access key from `window.__PORTFOLIO_CONFIG__`. GitHub Actions generates the ignored `config.runtime.js` file for Pages deployments, while the optional ignored `config.local.js` file supports local development and can override the runtime value. `.env.example` remains an empty reference template because the no-build site does not read `.env` files at runtime.

Storage reads must validate against allowed values. Invalid or unavailable storage must use a default without breaking the page. Theme and layout controllers must emit or apply independent state changes so changing one never resets the other.

## Rendering strategy

Use one semantic shell in `index.html` and a shared content render layer. Layout-specific classes or templates may control section ordering and composition, but all layouts must expose the same required sections and accessible labels.

Recommended approach:

1. Parse and validate saved preferences.
2. Apply the default theme/layout before first paint where practical to reduce flash.
3. Render the shared content model.
4. Initialize navigation and accessible controls.
5. Initialize noncritical reveal effects.
6. Lazy-initialize SECRET GARDEN only after discovery/open.

Avoid recreating the entire document for a theme change. CSS custom properties should handle visual theme changes. A layout change may update a root layout attribute and rearrange defined section containers, but should preserve user state and focus.

## Theme architecture

Themes should be token sets in CSS, selected with a root attribute:

```html
<html data-theme="botanical-morning">
```

Each theme must define a complete identity:

- background and surface palette
- text and muted text colors
- accent colors
- gradients
- border and shadow language
- typography pairing or weight treatment
- botanical/organic decorative treatment
- interactive states

Use contrast-safe tokens for normal, hover, focus, disabled, form-error, and success states. Decorative elements must not convey required information.

## Layout architecture

Use a root attribute or class:

```html
<body data-layout="nature-editorial">
```

The four layouts should differ in composition:

- **Nature Editorial:** reading flow, large typography, image-led sections, editorial rhythm.
- **Modern Bento Portfolio:** responsive grid, compact modules, project and skill tiles.
- **Creative Storytelling:** chronological narrative, scroll chapters, progressive visual transitions.
- **Minimal Developer Portfolio:** restrained hierarchy, high information density, fast scanning.

Layout-specific CSS should alter grid, ordering, spacing, and component composition while sharing tokens and content. Do not duplicate the professional information in four HTML trees.

## Interaction architecture

### Navigation

`navigation.js` should manage:

- menu open/close
- `aria-expanded` and `aria-controls`
- Escape and outside-click handling
- focus return to the menu trigger
- body scroll lock only while the menu is open
- active section indication

### Reveal and motion

`reveal.js` should use IntersectionObserver and a CSS class. It should:

- observe only intended elements
- unobserve after reveal where appropriate
- disable or simplify animation when `prefers-reduced-motion: reduce`
- avoid blocking content if JavaScript fails

All essential information must remain visible without animation.

### Project cards

Project data should render accessible cards with real links only. External links should use `target="_blank"` only where useful and include `rel="noopener noreferrer"`. A card should not rely on hover to expose its primary action.

### Resume

Use a normal accessible link for download with `download` where supported and a separate view link. Keep the PDF local to the new portfolio and test the final relative path.

## SECRET GARDEN architecture

Keep the game isolated from the portfolio shell:

- `secret-garden.js` owns lifecycle, score, countdown, and render loop.
- `game-state.js` defines explicit states: idle, playing, paused, game-over.
- `input.js` normalizes keyboard, pointer, and touch input into one command model.
- `audio.js` owns mute state, lazy audio initialization, and failure-safe sound playback.

The game should mount only when opened, stop its animation loop when closed or hidden, and clean up listeners on teardown. High-score persistence must use validated numeric data. The game must remain playable without sound and must provide readable status text.

## Contact architecture

`contact-form.js` should use one submit listener and an explicit state machine:

```text
idle -> validating -> submitting -> success
                              \-> error
```

Requirements:

- native constraints plus accessible custom messages where needed
- submit-button disabled state during request
- duplicate submission prevention
- timeout and non-OK response handling
- success/error status in a live region
- no private service credential in committed client code
- configurable endpoint strategy documented in `README.md`

## Performance and resilience

- Keep initial HTML semantic and useful before scripts load.
- Load only the font weights actually used.
- Prefer CSS effects over continuous JavaScript animation.
- Lazy-load game audio and noncritical images.
- Use `requestAnimationFrame` only for active, visible effects.
- Cap canvas pixel ratio and disable WebGL enhancement when unsupported.
- Avoid GSAP, Three.js, or other dependencies unless a measured requirement justifies them.
- Add `loading="lazy"` to below-the-fold images and explicit dimensions to prevent layout shift.
- Keep error handling explicit; do not silently convert failures into fake success.

## Accessibility baseline

- Use landmarks and a logical heading hierarchy.
- Add a skip link.
- Preserve visible focus indicators.
- Ensure all controls are keyboard reachable.
- Associate labels and inputs.
- Provide text alternatives for meaningful images and empty alt text for decorative images.
- Use `aria-live` only for status updates.
- Support reduced motion.
- Do not hide the native pointer or require hover.
- Check color contrast across all five themes.
- Ensure touch targets are comfortably sized at the smallest viewport.

## Validation plan

Before implementation is considered complete:

1. Test all five themes in all four layouts.
2. Test the six required viewport widths from the project guide.
3. Test keyboard navigation and a screen-reader smoke path.
4. Test reduced-motion mode.
5. Test resume download and viewing.
6. Test every project/contact URL and confirm no `#` placeholders remain.
7. Test contact validation, loading, success, error, timeout, and duplicate submission.
8. Test game discovery, start, countdown, scoring, restart, high score, mute, and all input modes.
9. Check console errors, broken assets, overflow, and layout shifts.
10. Verify the deployed relative paths and contact endpoint configuration.
