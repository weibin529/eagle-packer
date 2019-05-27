const vue = require('eagle-rollup-plugin-vue')
const json = require('rollup-plugin-json')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const re = require('rollup-plugin-re')
const babel = require('rollup-plugin-babel')
const terser = require('rollup-plugin-terser').terser
const html = require('rollup-plugin-gen-html')

const postcss = require('rollup-plugin-postcss')
const postcssAutoprefixer = require('autoprefixer')
const postcssCalc = require('postcss-calc')
const postcssClean = require('postcss-clean')
const postcssConditionals = require('postcss-conditionals')
const postcssEach = require('postcss-each')
const postcssFor = require('postcss-for')
const postcssImport = require('postcss-import')
const postcssMixins = require('postcss-mixins')
const postcssMixColor = require('postcss-mix-color')
const postcssNested = require('postcss-nested')
const postcssSelectorNot = require('postcss-selector-not')
const postcssVars = require('postcss-simple-vars')
const postcssUnprefix = require('postcss-unprefix')

const env = process.env.NODE_ENV || 'production'
const isProductionEnv = env === 'production'

module.exports = (entryOptions, options) => {
  const vueOptions = Object.assign({}, entryOptions.rollupVueOptions || options.rollupVueOptions)
  const plugins = [
    vue(vueOptions),
    json(),
    postcss({
      extract: true,
      plugins: [
        postcssImport,
        postcssUnprefix,
        postcssSelectorNot,
        postcssMixins,
        postcssEach,
        postcssVars({
          variables: entryOptions.postcssVariables || options.postcssVariables
        }),
        postcssCalc,
        postcssNested,
        postcssFor,
        postcssConditionals,
        postcssMixColor,
        postcssAutoprefixer,
        postcssClean(isProductionEnv ? undefined : {
          format: {
            breaks: {
              afterAtRule: true,
              afterBlockBegins: true,
              afterBlockEnds: true,
              afterComment: true,
              afterProperty: true,
              afterRuleBegins: true,
              afterRuleEnds: true,
              beforeBlockEnds: true,
              betweenSelectors: true
            },
            spaces: {
              aroundSelectorRelation: true,
              beforeBlockBegins: true,
              beforeValue: true
            },
            semicolonAfterLastProperty: true,
            indentBy: 2
          }
        })
      ]
    }),
    resolve({
      mainFields: ['module', 'main', 'browser']
    }),
    commonjs(),
    re({
      replaces: {
        'process.env.VERSION': JSON.stringify(process.env.VERSION || 'snapshot'),
        'process.env.NODE_ENV': JSON.stringify(env)
      }
    }),
    babel(Object.assign({
      exclude: [/\/core-js\//],
      externalHelpers: true
      // extensions: ['.js', '.jsx', '.es6', '.es', '.mjs']
    }, entryOptions.babel || options.babel)),
    html(Object.assign({
      cwd: entryOptions.cwd || options.cwd,
      hash: options.html.hash,
      replaceToMinScripts: isProductionEnv
    }, entryOptions.html))
  ]
  if (isProductionEnv) plugins.push(terser())
  return plugins
}
