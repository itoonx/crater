#!/usr/bin/env babel-node
// @flow

import asyncScript from './util/asyncScript'
import execAsync from './util/execAsync'
import spawnAsync from './util/spawnAsync'
import path from 'path'
import build from './build'
import buildDir from '../buildDir'

const root = path.resolve(__dirname, '..')

process.on('SIGINT', (): any => process.exit(1))

const opts = {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
}

asyncScript(async (): Promise<void> => {
  await build()
  const commitHash = (await execAsync('git rev-parse HEAD', {silent: true})).stdout.trim()
  const {TARGET} = process.env
  const tag = `jedwards1211/crater${TARGET ? '-' + TARGET : ''}:${commitHash}`
  await spawnAsync('docker', [
    'build',
    '--build-arg', `BUILD_DIR=${path.relative(root, buildDir)}`,
    '--build-arg', `TARGET=${TARGET || ''}`,
    '-t', tag,
    root
  ], opts)
})
