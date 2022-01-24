const
  Millimeter = 1,
  Centimeter = 10 * Millimeter,
  Meter = 100 * Centimeter,
  Kilometer = 1000 * Meter

function getHumanReadableLength(mm: number): string {
  if (mm < Centimeter) { // with mm
    return `${mm}mm`
  } else if (mm < Meter) { // with cm
    return `${mm / Centimeter}cm`
  } else if (mm < Kilometer) { // with m
    return `${mm / Meter}m`
  } else { // with km
    return `${mm / Kilometer}km`
  }
}

export { getHumanReadableLength }