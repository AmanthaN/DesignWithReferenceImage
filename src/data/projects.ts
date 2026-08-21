// ── Portfolio Projects ────────────────────────────────────────────────────────
//
// TO ADD A PROJECT MANUALLY:
//   1. Drop your image(s) into  public/uploads/  (e.g. public/uploads/myproject.jpg)
//   2. Copy one of the entries below and paste it at the end of the array.
//   3. Set  images: ['/uploads/myproject.jpg']  (paths are relative to /public).
//   4. Save — Vite hot-reloads instantly.
//
// TO REMOVE A PROJECT MANUALLY:
//   Delete its object from the array below and save.
//
// NOTE: Projects added through the UI are saved in localStorage and merged
//       with this list at runtime. They do NOT appear here automatically.

export interface Project {
  id: number
  title: string
  category: string
  desc: string
  tags: string[]
  images: string[]   // first image is the card cover
  wide: boolean      // true = spans full grid width (use for hero projects)
  iframeSrc?: string // optional: iframe embed URL (Figma prototype, etc.)
  link?: string      // optional: external link shown in lightbox
}

export const BUILT_IN_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'CRABIGO',
    category: 'Holiday Booking Platform · UEXPLUS',
    desc: 'A full-scale booking platform covering both user and host experiences across web and mobile — from information architecture to polished, responsive high-fidelity UI.',
    tags: ['UI/UX Design', 'Figma', 'Responsive', 'Prototyping', 'User Research'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=800&fit=crop&auto=format'],
    wide: true,
  },
  {
    id: 2,
    title: 'JetPay',
    category: 'FinTech Payment Platform',
    desc: 'Responsive fintech platform focused on trust, security-centered UX, seamless onboarding and conversion-focused design.',
    tags: ['FinTech', 'Mobile', 'Web', 'UX Research'],
    images: ['https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=700&fit=crop&auto=format'],
    wide: false,
  },
  {
    id: 3,
    title: 'Serene Ayurveda',
    category: 'Luxury Wellness Centre',
    desc: 'Premium wellness website built around relaxation, usability and visual elegance with large imagery and a bespoke design system.',
    tags: ['Web Design', 'Figma', 'Design System', 'Luxury'],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&h=700&fit=crop&auto=format'],
    wide: false,
  },
  {
    id: 4,
    title: 'Duskpine',
    category: 'Natural Wellness E-commerce',
    desc: 'A premium e-commerce experience for a natural wellness brand — earth-toned identity, reduced cognitive load, and conversion-optimized checkout.',
    tags: ['E-commerce', 'Branding', 'Conversion UX'],
    images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop&auto=format'],
    wide: false,
  },
  {
    id: 5,
    title: 'MyDialog',
    category: 'UI Study · Interface Recreation',
    desc: 'A meticulous UI study recreating key screens of the MyDialog mobile app, focusing on component consistency, Auto Layout, and design system analysis.',
    tags: ['UI Study', 'Components', 'Auto Layout', 'Figma'],
    images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=700&fit=crop&auto=format'],
    wide: false,
  },
]

// IDs of built-in projects — used to separate them from user-added ones.
export const BUILT_IN_IDS = new Set(BUILT_IN_PROJECTS.map(p => p.id))
