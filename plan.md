Master Plan: Engineering Firm Website (Claymorphism × Hyperrealistic)
Here's the strategic blueprint before we touch any code.
1. Design Concept
"Tactile Precision" — hyperrealistic architectural photography (like your reference image) framed by soft, tactile claymorphism UI elements. The contrast is the magic: razor-sharp, real-world imagery sitting inside puffy, soft-shadowed "clay" containers and buttons. It reads premium because nothing feels flat — every button looks pressable, every card looks like it's resting slightly above the surface.
Claymorphism rules we'll follow:

Soft, rounded corners (18–32px radius)
Dual shadows: a soft dark shadow (bottom-right) + soft light highlight (top-left) to simulate light hitting a clay surface
No hard borders — depth comes from shadow, not lines
Muted-but-rich color blocks (not stark white/black)

2. Color & Typography System
TokenValueUse--navy-900#0A1330Header, hero overlay, dark sections--navy-700#14224AClay surface base (dark cards)--amber-500#F5A623Primary CTA, accents--amber-300#FFCB73Hover glow, highlights--cream-50#F7F5F0Light section backgrounds--clay-lightrgba(255,255,255,0.06)Top-left highlight shadow--clay-darkrgba(0,0,0,0.45)Bottom-right depth shadow

Display font: Space Grotesk or Clash Display (bold, geometric — matches your reference headline weight)
Body font: Inter or Manrope

3. Tech Stack

React + JSX, built with Vite
Plain CSS with CSS Custom Properties as design tokens (one tokens.css, no Tailwind, no preprocessor — keeps it portable)
Framer Motion — clay press/lift micro-interactions, scroll reveals
Lucide-react — icon set
React Hook Form — quote request form
Image strategy: WebP/AVIF, lazy-loaded, full-bleed hero with gradient overlay for text legibility

4. Site Map

Home
About Us
Sectors (industries served)
Services
Projects (grid → individual project detail pages)
Contacts
(optional) Careers

5. Homepage Section-by-Section

Sticky Header — logo, clay-pill nav, phone CTA pill (glowing amber on hover)
Hero — full-bleed hyperrealistic building photo, dark gradient overlay, bold headline, two clay buttons (filled amber "Request a Quote" / outlined ghost "Learn More")
Trust strip — animated counters (years active, projects delivered, engineers, countries)
About snapshot — short pitch + clay-framed photo
Sectors grid — clay icon-tiles (Commercial, Industrial, Residential, Infrastructure...)
Services — clay cards with hover-lift, icon, short description
Featured Projects — large hyperrealistic photography grid/carousel, hover reveals project name + sector
Process timeline — clay step-markers (Consult → Design → Build → Deliver)
Testimonials — clay quote cards
CTA banner — "Let's build something extraordinary" + Request a Quote
Footer — links, newsletter, contact info, mini map

6. Component Library to Build
ClayButton · ClayCard · ClayNavbar · ClayInput/Form · ClayIconTile · ClayBadge · ClayTimeline · ClayCarousel · ClayModal · StatCounter
7. Motion Language

Buttons "squish" inward on click (clay press effect)
Cards lift + shadow deepens on hover
Scroll-triggered fade/slide-up reveals per section
Subtle parallax on hero background
Numbers count up when scrolled into view

8. Build Phases

Foundation — design tokens, global CSS, core clay components
Hero + Header — the make-or-break first impression
Core sections — Sectors, Services, Projects grid
Inner pages — About, Contacts, Project detail template
Polish pass — animations, responsive QA, accessibility contrast check (claymorphism's soft shadows can hurt contrast — we'll guard against that)