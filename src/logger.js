const { blue, green, red, yellow } = require('chalk')
const dayjs = require('dayjs')

function dateSegment () {
  return '[' + dayjs().format('hh:mm:ss') + ']'
}

function logInfo () {
  console.log.apply(this, [dateSegment(), blue('[i]')].concat(Array.prototype.slice.apply(arguments)))
}

function logOk () {
  console.log.apply(this, [dateSegment(), green('[√]')].concat(Array.prototype.slice.apply(arguments)))
}

function logWarning () {
  console.log.apply(this, [dateSegment(), yellow('[!]')].concat(Array.prototype.slice.apply(arguments)))
}

function logErr () {
  console.log.apply(this, [dateSegment(), red('[x]')].concat(Array.prototype.slice.apply(arguments)))
}

module.exports = {
  logInfo,
  logOk,
  logWarning,
  logErr
}
