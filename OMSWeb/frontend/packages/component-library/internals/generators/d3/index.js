const { moduleDatavizExists } = require('../../utils/moduleExists')

module.exports = {
  description: 'Add a d3 component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'what should it be called?',
      default: 'line',
      validate: value => {
        if (/.+/.test(value)) {
          return moduleDatavizExists(value) ? 'A component with this name already exists': true
        }

        return 'The name is required'
      }
    }
  ],
  actions: data => {
    const actions = [
      {
        type: 'add',
        path: '../../src/dataviz/{{camelCase name}}/index.ts',
        templateFile: './d3/index.ts.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/dataviz/{{camelCase name}}/{{camelCase name}}.stories.tsx',
        templateFile: './d3/index.stories.tsx.hbs',
        abortOnFail: true
      }
    ]

    return actions
  }
}
