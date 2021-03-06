'use strict'
const sourceMapSupport = require('source-map-support')
const StackUtils = require('stack-utils')
const path = require('path')
const tapDir = path.resolve(__dirname, '..')
const {homedir} = require('os')

const resc = str =>
  str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')

// Ignore tap if it's a dependency, or anything
// in this lib folder.
// don't skip when developing on tap itself
const skip = (process.cwd() !== tapDir ||
  +process.env.TAP_DEV_SHORTSTACK === 1) &&
  +process.env.TAP_DEV_LONGSTACK !== 1
? [
    /node_modules[\/\\]tap[\/\\]/,
    /at internal\/.*\.js:\d+:\d+/m,
    new RegExp(resc(path.resolve(homedir(), '.node-spawn-wrap-')) + '.*'),
    new RegExp(resc(tapDir) + '\\b', 'i'),
    new RegExp('at ' + resc('Generator.next (<anonymous>)'), 'i'),
  ].concat(/* istanbul ignore next */ require.resolve
    ? [
        new RegExp(resc(require.resolve('function-loop'))),
        new RegExp(resc(require.resolve('esm'))),
        new RegExp(resc(require.resolve('nyc').replace(/(node_modules[\/\\]nyc).*$/, '$1'))),
        new RegExp(resc(require.resolve('import-jsx'))),
      ]
    : [])
: +process.env.TAP_DEV_LONGSTACK !== 1 ? [
    /at internal\/.*\.js:\d+:\d+/m,
    new RegExp(resc(require.resolve('esm'))),
    new RegExp(resc(require.resolve('nyc').replace(/(node_modules[\/\\]nyc).*$/, '$1'))),
    new RegExp(resc(require.resolve('import-jsx'))),
  ]
: []

sourceMapSupport.install({environment:'node'})

let nodeInternals = []
try {
  nodeInternals = StackUtils.nodeInternals()
} catch (error) {
  // Do nothing.
}

module.exports = new StackUtils({
  internals: nodeInternals.concat(skip),
  wrapCallSite: sourceMapSupport.wrapCallSite
})
