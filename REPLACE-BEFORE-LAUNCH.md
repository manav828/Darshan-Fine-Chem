# Darshan Fine Chem Private Limited — Website: Things To Replace Before Launch

> New corporate site is built and verified (all pages return HTTP 200, JSON-LD is valid, all images present). Replace the following placeholders before going live.

## 1. Domain (used in links, canonical tags & SEO)
The site is built against this domain. Wherever it appears, replace all occurrences of:
`https://www.darshanfinechem.com/`
→ `https://your-real-domain.com/`

Occurrences:  every HTML `<head>` (canonical/og:url) and `sitemap.xml`.

## 2. Contact details (currently placeholders)
| Field | Current value | Replace with |
|---|---|---|
| Phone / WhatsApp | `+91 98765 43210` | real phone number |
| Phone (tel: link) | `tel:+919876543210` | real E.164 number |
| Email (primary) | `info@darshanfinechem.com` | real company email |
| Email (sales) | `sales@darshanfinechem.com` | real sales email |
| Address | `GIDC Industrial Estate, Ankleshwar, Bharuch, Gujarat 393002, India` | registered office / plant address |
| Postal code in map link | `393002` | real PIN (if different) |

Files: all 7 HTML pages, `llms.txt`, `sitemap.xml`, `robots.txt`.

## 3. Email address in contact form
`css/style.css` and `contact.html` wire the contact form via a `data-contact-form="…"` attribute and the JS falls back to `mailto:` using that email. Either:
- keep `info@darshanfinechem.com` and point it at a real inbox, **or**
- connect `contact.html`'s `<form>` to a form backend (Formspree / Netlify Forms / Getform / a custom endpoint) and remove the `data-contact-form` `mailto` behavior in `js/main.js`.

## 4. Certifications
The site says quality systems are **"ISO 9001:2015-aligned"** (deliberately honest). Replace on `quality.html` if you hold:
- ISO 9001 certificate
- ISO 14001 (environmental) / ISO 45001 (OHS)
- any export / regulatory certificates (GPCB consent, REACH, FDA, etc.)

## 5. Manufacturing capacity numbers
`manufacturing.html` and the Hero **Stats** strip on `index.html` avoid fake numbers (only "6 products, 99.5 % assay, 4 industries, 100 % batch COA"). Add real figures if you want them:
- reactor capacity (MT)
- monthly/annual capacity
- years in operation / establishment year
- employee count

## 6. Company tagline / headlines (optional polish)
Review once the design is in a real browser:
- Hero H1: *"High-Purity Phosphorus Derivatives for Industry"* (currently client-stated: *"Leading Manufacturer of High-Quality Phosphorus Derivatives"* lives in the eyebrow).
- Footer blurb and the `PRODUCT / SPEC` formula strip.

## 7. Favicons / brand
`favicon.svg` is the orange-P mark, referenced as the tab icon on every page. Optional extras (not required):
- `favicon.ico`
- `site.webmanifest` + Apple touch icons
- add `apple-touch-icon` lines in each `<head>`.

## 8. Analytics / search
Nothing is currently injected. When ready, drop tags just before `</body>` (or in `<head>`) of every page, or better — via your host / a small include:
- Google Analytics 4 (`gtag.js`)
- Google Search Console verification
- (Optional) a site search — not wired up; skip `WebSite.potentialAction` in the JSON-LD if you stay without search.

## 9. Host & HTTPS
The site is static — host on GitHub Pages, Netlify, Vercel, or equivalent, all of which auto-provision **HTTPS** (required for `mailto`/form security and for OG image resolution). Ensure 301-redirects from `http://` → `https://` and `apex → www`.

## 10. Image credits (not required, but nice)
Hero / section photos are from **Pexels** (free for commercial use, no attribution required). If you swap them for your own plant photos, replace the files in `assets/img/` (keep filenames) so HTML references stay valid:
- `hero-plant.jpg`, `aerial-plant.jpg`, `plant-exterior.jpg`, `pipelines.jpg`, `storage-tanks.jpg`, `water-treatment.jpg`
- people: `team-engineers.jpg`, `worker-machinery.jpg`
- product cards: `product-pcl3.jpg`, `product-pocl3.jpg`, `product-pcl5.jpg`, `product-p2o5.jpg`, `product-tpp.jpg`, `product-ppa.jpg`
- industries: `industry-agro.jpg`, `industry-pharma.jpg`, `industry-dyes.jpg`
- quality: `quality-lab.jpg`

---

### Quick sanity commands (after replacing values)
```bash
# 1. serve locally
python -m http.server 8765        # then open http://localhost:8765

# 2. grep for any leftover placeholders
grep -rIn "darshanfinechem.com\|98765\|GIDC Industrial Estate, Ankleshwar" . --include=*.html --include=*.xml --include=*.txt --include=*.css
# should return nothing once everything is swapped

# 3. validate JSON-LD again
# (every <script type="application/ld+json"> must parse — re-run your validator or https://search.google.com/structured-data/testing-tool)
```

Built Aug 2026 · Darshan Fine Chem Private Limited
