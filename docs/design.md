# Design Documentation

## Design Vision
The application is designed to be a premium, high-end travel companion. The goal was to move away from generic "colorful" travel sites and towards a sophisticated, minimalist interface that feels like a modern SaaS or high-end lifestyle app.

## Shadcn UI Principles
We have adopted several core principles from the **Shadcn UI** library:
- **Zinc Palette**: Using a neutral grayscale (Zinc/Slate) for the foundation to allow content and small accents to pop.
- **Modern Typography**: Utilizing `Inter` for its excellent legibility and clean, professional look.
- **Subtle Borders**: Replacing heavy shadows with thin, 1px borders (`hsl(var(--border))`) and high-contrast text.
- **Consistent Radii**: All interactive elements and containers share a consistent `0.5rem` (8px) border radius.
- **Clutter-Free Layout**: Removing unnecessary decorations to focus on the information (dates, cities, and plans).

## Theme: Autumn "Koyo" Accents
While the base is minimalist, we have integrated a "Trip Accent" color (`#f97316`) representing the vibrant orange of Japanese maple leaves (Koyo). This color is used sparingly for:
- Timeline markers.
- Personal notes/badges.
- Key highlights.

## Motion and Interactivity
- **Scroll Reveal**: Using `IntersectionObserver` to fade in and slide timeline items as the user scrolls, creating a sense of progression.
- **Glassmorphism**: The cards use a subtle `backdrop-filter: blur(8px)` with a semi-transparent background to give a layered, modern depth over the hero image.
- **Responsiveness**: A mobile-first approach ensures the vertical timeline remains readable and interactive on smaller screens.
