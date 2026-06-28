export const sv = {
  app: {
    name: 'Biljämförelse',
    tagline: 'Jämför total ägandekostnad över 10 år',
  },
  nav: {
    overview: 'Översikt',
    prospects: 'Bilar',
    compare: 'Jämför',
    equipment: 'Utrustning',
    settings: 'Inställningar',
    activity: 'Aktivitet',
    login: 'Logga in',
    logout: 'Logga ut',
  },
  auth: {
    gatePlaceholder: 'Inloggning kommer i nästa steg',
  },
  home: {
    title: 'Översikt',
    healthOk: 'Convex ansluten',
    healthError: 'Convex svarar inte',
    openDrawer: 'Öppna formulär',
    drawerTitle: 'Exempelformulär',
    drawerDescription: 'Formulär öppnas i sidopanel på desktop och helskärm på mobil.',
    confirmDemo: 'Visa bekräftelse',
    confirmTitle: 'Bekräfta åtgärd',
    confirmDescription: 'Dialoger reserveras för bekräftelse och destruktiva val.',
    confirmAction: 'Bekräfta',
    cancel: 'Avbryt',
  },
  common: {
    loading: 'Laddar…',
    close: 'Stäng',
  },
} as const

export type SwedishCopy = typeof sv
