function getParams(func: Function) {
  // String representaation of the function code
  const funcS = func.toString()

  // Remove comments of the form /* ... */
  // Removing comments of the form //
  // Remove body of the function { ... }
  // removing '=>' if func is arrow function
  const str = funcS
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/(.)*/g, '')
    .replace(/{[\s\S]*}/, '')
    .replace(/=>/g, '')
    .trim()

  // Start parameter names after first '('
  const start = str.indexOf('(') + 1

  // End parameter names is just before last ')'
  const end = str.length - 1

  const result = str.substring(start, end).split(', ')

  const params = result
    .map((element) => {
      // Removing any default value
      element = element.replace(/=[\s\S]*/g, '').trim()
      return element.length > 0 ? element : undefined
    })
    .filter((element) => element)

  return params
}

function makeFsProxy(fsObject: any) {
  let fsProxied: any = {}
  for (const method in fsObject) {
    // @ts-ignore
    fsProxied[method] = new Proxy(fsObject[method], {
      apply: function (target: Function, thisArg, argumentsList) {
        console.group(
          `%cEXPOSED PROXY => ${target.name
          } | ${new Date().toLocaleTimeString()}`,
          'font-weight: bold; color: aqua;'
        )
        {
          const params = getParams(target)
          params.forEach((paramName, index) => {
            console.log(
              `%c ${index} %c ${paramName}\n`,
              'color: red; font-weight: bold;',
              'color: orange; font-weight: bold',
              argumentsList[index]
            )
          })
        }
        console.groupEnd()

        target(...argumentsList)
      },
    })
  }

  return fsProxied
}

export { makeFsProxy }
