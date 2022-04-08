const fs = require('fs')
const path = require('path')
const datavizComps = fs.readdirSync(
  path.join(__dirname, '../../src/dataviz')
)

const reactComps = fs.readdirSync(
  path.join(__dirname, '../../src/components')
)

function moduleDatavizExists(comp) {
  return datavizComps.indexOf(comp) >= 0
}

function moduleCompExists(comp) {
  return reactComps.indexOf(comp) >= 0
}

module.exports = {
  moduleDatavizExists,
  moduleCompExists
}
