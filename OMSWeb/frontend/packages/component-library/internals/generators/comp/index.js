const { moduleCompExists } = require('../../utils/moduleExists')

module.exports = {
  description: 'Add a react component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'what should it be called?',
      default: 'SimpleButton',
      validate: value => {
        if (/.+/.test(value)) {
          return moduleCompExists(value) ? 'A component with this name already exists': true
        }

        return 'The name is required'
      }
    }
  ],
  actions: data => {
    const actions = [
      {
        type: 'add',
        path: '../../src/components/{{pascalCase name}}/index.tsx',
        templateFile: './comp/index.tsx.hbs',
        abortOnFail: true
      },
      {
        type: 'add',
        path: '../../src/components/{{pascalCase name}}/{{pascalCase name}}.stories.tsx',
        templateFile: './comp/index.stories.tsx.hbs',
        abortOnFail: true
      }
    ]

    return actions
  }
}
