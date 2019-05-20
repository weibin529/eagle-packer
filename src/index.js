#!/usr/bin/env node

const { argv } = require('yargs')
  .alias('w', 'watch')
  .alias('c', 'config')
if (argv.env) process.env.NODE_ENV = argv.env

const prepareConfig = require('./prepare-config')
const { logErr } = require('./logger')
const doRollup = require('./rollup')

const options = Object(
  prepareConfig({
    config: argv.config,
    entry: argv._[0]
  })
)
const { entries, cwd } = options

if (entries) {
  ;(async () => {
    let watch = argv.watch
    for (let key in entries) {
      await doRollup({
        cwd,
        entryName: key,
        options,
        entryOptions: entries[key],
        watch
      })
    }
  })()
} else {
  logErr('invalid configuration or cannot find entry file ! ')
}
