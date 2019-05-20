const json = require('rollup-plugin-json')
const string = require('rollup-plugin-string').string
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const terser = require('rollup-plugin-terser').terser

const env = process.env.NODE_ENV || 'production'
const isProductionEnv = env === 'production'

module.exports = (entryOptions, options) => {
  const stringModuleOptions = Object.assign(
    {
      include: '**/*.{sql,txt,text}'
    },
    options.stringModuleOptions,
    entryOptions.stringModuleOptions
  )
  const plugins = [
    json(),
    string(stringModuleOptions),
    resolve(),
    commonjs()
  ]
  if (isProductionEnv) plugins.push(terser())
  return plugins
}
