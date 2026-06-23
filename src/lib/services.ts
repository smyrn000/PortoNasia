/** Services offered — shared by the Services page and the home preview. */
export const services = [
  {
    title: 'Interior Architecture',
    summary:
      'Full spatial design for residential and communal interiors — from first concept to construction-ready detail, balancing technical precision with atmosphere.',
  },
  {
    title: 'Space Planning',
    summary:
      'Plans that make a building work: clear circulation, generous shared rooms, calm private retreats, and accessible, level-access living designed in from the start.',
  },
  {
    title: 'Material & Colour',
    summary:
      'Considered palettes of timber, tile and tone. A tight, intentional material language that gives every project a coherent identity and a sense of warmth.',
  },
  {
    title: 'Custom Joinery & Furniture',
    summary:
      'Bespoke and modular furniture systems designed to fit the room and adapt to the people in it — built-in storage, seating and flexible kits of parts.',
  },
  {
    title: 'Lighting Design',
    summary:
      'Layered lighting schemes that shape mood and guide movement through a space, working with daylight rather than against it.',
  },
  {
    title: 'Visualisation',
    summary:
      'Photoreal renders, plans and concept imagery that let clients see and feel a space before a single wall is built.',
  },
] as const;

/** The studio's working process, shown on the Services page. */
export const process = [
  { step: '01', title: 'Listen', text: 'We start with how you want to live and use the space — needs, rituals, constraints and ambitions.' },
  { step: '02', title: 'Concept', text: 'A guiding idea, spatial strategy and material direction, presented with plans and early visuals.' },
  { step: '03', title: 'Develop', text: 'Detailed design: joinery, lighting, finishes and the technical drawings that make it buildable.' },
  { step: '04', title: 'Deliver', text: 'Documentation and support through to a finished, accessible, well-crafted interior.' },
] as const;
