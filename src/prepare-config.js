const isString = require('lodash.isstring')
const { resolve, isAbsolute } = require('path')
const { existsSync, copySync, mkdirsSync, removeSync } = require('fs-extra')

const { logErr } = require('./logger')

const cwd = process.cwd()

const SEEK_DIRS = [
  {
    src: [
      {
        service: 'node'
      },
      {
        'web-content': 'browser'
      },
      {
        'web-content': [
          {
            'modules': [
              {
                '*': 'browser'
              }
            ]
          }
        ]
      }
    ]
  }
]

function generateConfigViaSeeking () {

}

function generateConfigByEntry (entry) {

}

function prepareConfig ({ config, entry }) {
  if (config || !entry) {
    const configFile = resolve(cwd, isString(config) ? config : 'iwop-pack.config.js')
    if (existsSync(configFile)) {
      return require(configFile)
    }
  }
  if (isString(entry)) {
    const entryFile = isAbsolute(entry) ? entry : resolve(cwd, entry)
    if (existsSync(entryFile)) {
      return generateConfigByEntry(entryFile)
    }
  } else {
    return generateConfigViaSeeking()
  }
}

module.exports = prepareConfig
