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
    loginTitle: 'Logga in',
    loginDescription: 'Endast inbjudna användare kan logga in.',
    emailLabel: 'E-post',
    passwordLabel: 'Lösenord',
    displayNameLabel: 'Visningsnamn',
    profileTitle: 'Slutför din profil',
    profileDescription: 'Ange ett visningsnamn så att andra i hushållet kan se vem du är.',
    profileSave: 'Spara profil',
    profileError: 'Kunde inte spara profilen. Försök igen.',
    errors: {
      invalidCredentials: 'Fel e-post eller lösenord.',
      invalidPassword: 'Lösenordet uppfyller inte kraven.',
      signupDisabled: 'Registrering är stängd. Kontakta administratören.',
      generic: 'Inloggningen misslyckades. Försök igen.',
    },
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
