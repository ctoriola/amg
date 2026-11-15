# Abuja Metropolitan Golf Club — Website

A static, single-page website for Abuja Metropolitan Golf Club (AMGC) and its intellectual arm, the Abuja Leadership Dialogue.

## Run it

No build step is needed. Open `index.html` in a browser, or serve the folder:

    python3 -m http.server 8000

Then visit http://localhost:8000. You can deploy it as-is to Netlify, Vercel, GitHub Pages or any static host.

## Structure

    index.html            All page content and sections
    assets/css/styles.css Design system (colours, type, layout, responsive rules)
    assets/js/main.js     Nav, scroll reveals, counters, slider, countdown, enquiry form
    assets/img/           Logos, club photos and course photography

## Sections

1. Hero: golf ball on a tee over an elliptical window cut through the card
2. The Club: about AMGC, plus a stats strip
3. Leadership Dialogue: intro and a three-slide carousel
4. Events 2026: Golf Kitty (10 Dec) and Gala & Dialogue (16 Dec), a live countdown and event parameters
5. Gala programme timeline
6. Policy pillars and speakers
7. Gallery
8. Partnership: value propositions, four sponsorship tiers, feature sponsorships and a comparison matrix
9. Contact: secretariat details, a map and an enquiry form that opens a pre-filled email
10. Footer

## Content sources

- Event details, pricing, programme and contacts come from the AMG Marketing & Partnership Prospectus.
- Club photos and logos were cropped from the prospectus. White and green transparent logo versions were generated from them.
- Course photography (hero, aerial, wedge, ball-and-cup, irons, golfer) comes from Unsplash under the Unsplash License, which allows free commercial use.
- Public facts about Chief Bukola Olopade (NSC Director-General since November 2024, founder of the Lagos Marathon) were checked against national press reports.

## Editing notes

- Colours live as CSS variables at the top of `styles.css` (`--ink`, `--lime`, `--paper`, `--bg`).
- The countdown target is set in `main.js` (16 Dec 2026, 18:00 WAT).
- The enquiry form has no backend. It opens the visitor's email app addressed to the secretariat. To collect submissions automatically, point the form at a webhook such as n8n, Make, Zapier or Formspree.
