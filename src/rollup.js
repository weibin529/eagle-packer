const rollup = require('rollup')

const nodePlugins = require('./plugins-node')
const browserPlugins = require('./plugins-browser')

const { resolve, parse, isAbsolute } = require('path')
const { existsSync, removeSync, mkdirsSync, copySync } = require('fs-extra')

const { logInfo, logOk, logWarning, logErr } = require('./logger')

const env = process.env.NODE_ENV || 'production'
const isProductionEnv = env === 'production'

function mergeOptions ({ cwd, options, entryOptions, entryName }) {
  const isNode = entryOptions.type === 'node'
  entryOptions.cwd = cwd
  return {
    inputOptions: {
      input: resolve(cwd, entryOptions.input),
      plugins: isNode ? nodePlugins(entryOptions, options) : browserPlugins(entryOptions, options),
      external: entryOptions.external || options.external || (isNode
        ? id => !isAbsolute(id) && ['.', '/'].indexOf(id[0]) < 0
        : undefined),
      onwarn: warning => {
        const { code, plugin, id, input, message, text } = warning
        logWarning('[B]', '[' + entryName + ']', code || warning)
        if (plugin) logWarning('...', '[plugin]', plugin)
        if (id) logWarning('...', '[id]', id)
        if (input) logWarning('...', '[input]', input.file || input)
        if (message) logWarning('...', '[message]', message)
        if (text) logWarning('...', '[message]', text)
      }
    },
    outputOptions: {
      file: resolve(cwd, entryOptions.output),
      format: isNode ? 'cjs' : 'iife',
      sourcemap: !(entryOptions.sourcemap === false ||
        (entryOptions.sourcemap !== true && options.sourcemap === false))
    }
  }
}

function clear (paths, entry, cwd) {
  for (let item of paths) {
    const clearPath = resolve(cwd, item)
    if (existsSync(clearPath)) {
      removeSync(clearPath)
      logOk('[D]', '[' + entry + ']', clearPath, 'deleted.')
    }
  }
}

function copy (items, entry, cwd) {
  for (let item in items) {
    const input = resolve(cwd, item)
    const output = resolve(cwd, items[item])
    if (existsSync(input)) {
      mkdirsSync(parse(output).dir)
      copySync(input, output)
      logOk('[C]', '[' + entry + ']', output, 'copied.')
    } else {
      logErr('[C]', '[' + entry + ']', input, 'not found!')
    }
  }
}

async function doRollup ({ cwd, entryName, options, entryOptions, watch }) {
  try {
    if (entryOptions.clear) clear(entryOptions.clear, entryName, cwd)
    if (entryOptions.copy) copy(entryOptions.copy, entryName, cwd)
    if (entryOptions.input) {
      options.html = {
        hash: !watch && isProductionEnv
      }
      const { inputOptions, outputOptions } = mergeOptions({ cwd, options, entryOptions, entryName })
      if (outputOptions.file) mkdirsSync(parse(outputOptions.file).dir)
      if (watch) {
        const watchOptions = Object.assign({}, inputOptions, { output: outputOptions })
        const watcher = rollup.watch(watchOptions)
        watcher.on('event', event => {
          switch (event.code) {
            case 'BUNDLE_END':
              logOk('[B]', '[' + entryName + ']', 'bundled.')
              logInfo('[W]', '[' + entryName + ']', 'waiting for changes ...')
              break
            case 'ERROR':
            case 'FATAL':
              const { code, message, stack } = event.error
              logErr('[B]', '[' + entryName + ']', code, message)
              logErr('...', '[' + entryName + ']', stack)
          }
        })
      } else {
        const bundle = await rollup.rollup(inputOptions)
        await bundle.write(outputOptions)
        logOk('[B]', '[' + entryName + ']', 'bundled.')
      }
    }
  } catch (e) {
    Object.defineProperty(e, 'stack', {
      enumerable: true
    })
    const { plugin, id, message, text, input, stack } = e
    if (plugin) logErr('...', '[plugin]', plugin)
    if (id) logErr('...', '[id]', id)
    if (input) logErr('...', '[input]', input.file || input)
    if (message) logErr('...', '[message]', message)
    if (text) logErr('...', '[message]', text)
    if (stack) logErr('...', '[stack]', stack)
    if (env === 'production') {
      throw e
    }
  }
}

module.exports = doRollup
