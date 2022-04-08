const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const d3ModuleGenerator = require('./d3/index.js')
const compModuleGenerator = require('./comp/index.js')


module.exports = plop => {
  plop.setGenerator('d3', d3ModuleGenerator)
  plop.setGenerator('comp', compModuleGenerator)
  // plop.addHelper('directory', comp => {
  //   try {
  //     fs.accessSync(
  //       path.join(__dirname, `../../src/comps/${comp}`),
  //       fs.constants.F_OK
  //     )
  //     return `comps/${comp}`
  //   } catch (e) {

  //   }
  // })
}
