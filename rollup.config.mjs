import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

const PROD = !!process.env.CI

console.log(`production: ${PROD}`)

const plugins = [
  typescript({
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs({
    ignoreGlobal: true,
    include: [/node_modules/],
  }),
  PROD && terser({}),
]

const banner = `/*! eth-connect ${JSON.stringify(
  {
    date: new Date().toISOString(),
    commit: process.env.GITHUB_SHA || 'HEAD',
    ref: process.env.GITHUB_REF || '?',
  },
  null,
  2
)} */`

export default {

  input: './src/index.ts',
  context: 'globalThis',
  plugins,
  output: [
    {
      file: './dist/eth-connect.js',
      format: 'umd',
      name: 'ethconnect',
      sourcemap: true,
      banner,
      exports: 'named',
      amd: {
        id: 'eth-connect',
      },
    }
  ],
}
