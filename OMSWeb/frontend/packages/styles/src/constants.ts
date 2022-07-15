// Global style variables
export const color = {
  text: '#3A3A3A',
  selected: '#2E426C',
  line: '#D8D8D8',
  bg: 'white',
  primary: '#41D2FF',
  inputLine: '#31497C',
  // secondary: '#1EA7FD', // ocean
  // tertiary: '#DDDDDD',
  healthLv1: '#408AFF',
  healthLv2: '#1FB886',
  healthLv3: '#EAA539',
  healthLv4: '#EF6711',
  healthLv5: '#DF1D4C',
  extraLv1: '#7EA6FF',
  extraLv2: '#595FD6',
  extraLv3: '#7C63EA',
  extraLv4: '#A155FA',
  extraLv1Text: '#98B8FF',
  extraLv2Text: '#8D91EA',
  extraLv3Text: '#9A87EF',
  extraLv4Text: '#C99BFF',
  theme: {
    purple: [
      '#C468F7',
      '#8059D4',
      '#6F6EEB',
      '#597FD4',
      '#62BDF5'
    ]
  }
}

export const background = {
  app: color.bg,
}

export const spacing = {
  padding: {},
  margin: {},
  borderRadius: {
    small: 5,
    default: 10,
  },
}

export const zIndex = {
  GNB: 150,
  GNBItem: 151,
  popoverInner: 112,
  popoverBg: 111,
  popover: 110,
  popoverOverlay: 100,
  headerPopover: 90,
  header: 80,
  durationPopover: 70,
  drawer: 65,
  bottomOverlay: 60,
  LNB: 50,
  contentOverlay: 40,
  contentDrawer: 30,
  contentPane: 20,
  bg: 1,
  zero: 0,
} as const

export const typography = {
  type: {
    primary: 'NS, Helvetica, sans-serif',
  },
  weight: {
    light: '300',
    regular: '400',
    bold: '700',
    extrabold: '800',
  },
  size: {
    s1: 10,
    s2: 12,
    s3: 13,
    s4: 14,
    m1: 18,
    m2: 20,
    l1: 30,
    l2: 40,
  },
  lineHeight: {
    default: 1.66,
  },
} as const

export const breakpoint = {}

export const paneBodyBreakpoint = {
  sm: [0, 1000],
  md: [1000, 2060],
  lg: [2060, 3000],
}
