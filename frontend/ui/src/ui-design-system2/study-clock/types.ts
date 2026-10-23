export interface StudyClockSession {
  id: string;
  name: string;
  timeLabel: string;
  angle: number;
  badge: string;
  hours: string;
  recommendedSupplies: string;
}

export const CLOCK_SESSIONS: StudyClockSession[] = [
  {
    id: 'lecture',
    name: '08:00 LECTURE',
    timeLabel: '08:00',
    angle: -90,
    badge: 'ACTIVE BLOCK: 08:00 LECTURE • B5 JOURNAL + 0.5MM GEL PEN',
    hours: '08:00 - 12:00',
    recommendedSupplies: 'B5 Dot-Grid Journal + 0.5mm Gel Pen 6-Pack',
  },
  {
    id: 'studio',
    name: '13:00 STUDIO LAB',
    timeLabel: '13:00',
    angle: 12,
    badge: 'ACTIVE BLOCK: 13:00 STUDIO CRIT • 30CM ALUMINUM RULER + DRAFTING PENCIL',
    hours: '13:00 - 17:00',
    recommendedSupplies: 'Aluminum Scale Ruler + 0.5mm Drafting Pencil',
  },
  {
    id: 'library',
    name: '17:00 LIBRARY SPRINT',
    timeLabel: '17:00',
    angle: 68,
    badge: 'ACTIVE BLOCK: 17:00 LIBRARY SPRINT • PASTEL HIGHLIGHTERS + INDEX FLAGS',
    hours: '17:00 - 20:30',
    recommendedSupplies: 'Pastel Highlighters + Index Tab & Sticky Kit',
  },
  {
    id: 'exam',
    name: '21:00 EXAM REVIEW',
    timeLabel: '21:00',
    angle: 135,
    badge: 'ACTIVE BLOCK: 21:00 EXAM PREP • GRAPHING SCIENTIFIC CALC + SUMMARY SHEETS',
    hours: '20:30 - 23:30',
    recommendedSupplies: 'Graphing Scientific Calculator + B5 Refills',
  },
];
