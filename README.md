# Personal Portfolio (Three.js)

A professional, creative portfolio website with a subtle Three.js background. Sections include About, Skills, Projects, Certifications, Education, and Contact.

## Features

- Elegant dark theme with glassy cards and responsive layout
- Three.js animated starfield and wireframe centerpiece with mouse parallax
- Smooth scrolling, sticky header, accessible forms and focus states
- Zero build tooling (plain HTML/CSS/JS via CDN)

## Structure

- `index.html` — Page structure and content sections
- `styles.css` — Visual styling and layout
- `main.js` — Three.js scene + small site interactions
- `assets/` — (Optional) images/logos if you add them

## How to run (Windows PowerShell)

You can open `index.html` directly in your browser. For best results (and to avoid any CORS quirks), run a tiny local server.

```powershell
# Option 1: PowerShell static file server (Windows 10+)
Start-Process microsoft-edge:http://localhost:8000; python -m http.server 8000

# Option 2: If you have Node.js installed (optional)
npx serve .
```

Then visit: http://localhost:8000

## Customize

- Replace "Your Name" and contact links in `index.html`.
- Update Skills in the `#skills` section (pill list).
- Add real projects in the `#projects` grid (title, stack, description, links).
- Fill `#certifications` and `#education` items.
- Update the `mailto:` address in `main.js` (search for `you@example.com`).
 - Drop your profile photo or use the hosted one. The About section currently references:
	 - https://moremi777.github.io/virtual_cv/olebogeng.png
 - Add demo videos (MP4) to `assets/` and the cards will play them automatically:
	 - `assets/ai-waste-demo.mp4`
	 - `assets/warehouse-demo.mp4`
	 - `assets/flappy-bird-demo.mp4`
	 - `assets/messaging-app-demo.mp4`
	 - `assets/pet-pals-demo.mp4`
	 - `assets/aes-encryption-demo.mp4`
	 If a file is missing, the card shows a soft fallback with links.

	### Add Education images

	Place school images here (filenames referenced in `index.html`):

	- `assets/edu/milner-high.jpg`
	- `assets/edu/nwu.jpg`

	You can use any JPG/PNG; recommended size: around 1200×675 (16:9), compressed.

	### Add Certificate images

	You can keep using hosted images from your current site, or add local copies under:

	- `assets/certs/website.png`
	- `assets/certs/wordpress.png`

	Then update the image `src` in the Certifications section to point to the local files if desired.

## Notes

- The Three.js modules are loaded via jsDelivr CDN. If you need to pin a different version, update the URLs in `main.js`.
- If performance is a concern on low-end devices, the scene respects the user's Reduced Motion setting and pauses animations.
- No trackers, no frameworks — just clean, portable code.
 - Skill icons use Devicon via CDN. You can add/remove icons in the `#skills` grid.
