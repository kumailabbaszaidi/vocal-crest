# Vocal Crest — Website

This is a four-page static marketing site built with plain HTML, CSS and vanilla JavaScript. It has **no dependencies and no build step**, so you can deploy the folder as-is to any static host (Vercel, Netlify, Cloudflare Pages, S3 and similar). All internal links use clean, root-relative URLs (`/about/`, `/pricing/`, `/contact/`).

## Preview locally

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1      # http://localhost:8080/
```

`serve.ps1` also provides two **local-only** test endpoints for the contact form, `/__dev/form-ok` (returns 200) and `/__dev/form-fail` (returns 500). Never use them in production.

## Art direction — "Signal"

The logo is a voice line that rises into a crest, and the whole site is built from that idea:

| Element | Rule |
|---|---|
| Colour | The client palette only: `#020F25`, `#071A32`, `#0B1D36`, `#16DCEB`, `#FFFFFF` and `#A8B6C9`. Cyan is a *signal* colour, used sparingly. |
| Type | **Bricolage Grotesque** for display, **Geist** for body text, **Geist Mono** for annotations and data |
| Structure | Hairline grids, mono section indices `(01)`, and oversized display type. There are no rounded cards and no icon circles. |
| Motifs | The live signal-line canvas (hero and closing sections), the crest line (About page), and "document" panels that show real product output |
| Motion | Masked word reveals, scroll-lit text, a sticky step counter, sticky product visuals, page-wipe transitions, a first-visit loader, a cursor ring and magnetic CTAs |

## Structure

```
index.html            Home
about/index.html      About Us
pricing/index.html    Pricing
contact/index.html    Contact Us

assets/css/base.css        Tokens, reset, type scale, grid, motion primitives, loader/transitions
assets/css/components.css  Header, menu, buttons, links, accordion, marquee, doc panels,
                           form fields, closing CTA, footer, page hero, cursor
assets/css/home.css        Homepage compositions (+ shared .checks list)
assets/css/pages.css       About / Pricing / Contact compositions

assets/js/site-config.js   ★ Business values pending approval (pricing, phone, email, form endpoint)
assets/js/components.js    Header + full-screen menu + footer; binds config values into pages
assets/js/motion.js        Animation engine (see the header comment in the file for its data-attributes)
assets/js/main.js          Accordion
assets/js/form.js          Contact form validation + submission states
```

### Motion attributes

| Attribute | Effect |
|---|---|
| `data-split` | The heading reveals word by word behind a mask |
| `data-reveal` | The element fades up as it enters the viewport (`--d:120` adds a delay in ms) |
| `data-scrub` | Words light up as the reader scrolls through the text |
| `data-draw` | A hairline draws itself in |
| `data-speed="0.1"` | Parallax |
| `canvas[data-wave]` | The live signal line |
| `data-magnetic` | The element leans toward the cursor |

Every effect switches off under `prefers-reduced-motion`, and content is never hidden if JavaScript fails to run.

## ⚠️ Pending client input (`assets/js/site-config.js`)

- **Pricing** (`$75 / month, Trades Business Plan`) is copied from the reference site. While `pricing.approved` is `false`, a visible "Pricing pending Vocal Crest approval" flag is shown next to the price. Set it to `true` once the price is confirmed.
- **Phone / email** are empty, so the Contact page shows clearly marked placeholders. Until a number is added, the "Hear a sample call" buttons go to `/contact/`.
- **Form endpoint** is empty. The form validates input but tells the visitor honestly that the message was not sent. To activate it, add a Formspree, Basin or Getform URL, or your own API. The success state only appears after a 2xx response.
- **Canadian positioning** was carried over from the reference business. It appears in the config (`region`), on Home ("Why"), and on About ("spec sheet" and "Who we help").
