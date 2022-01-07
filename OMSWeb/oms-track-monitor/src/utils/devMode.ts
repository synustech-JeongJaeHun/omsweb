const isDev = true

function devlog(...args: any[]) {
  if (!isDev) return
  console.log(args)
}

export { isDev, devlog }