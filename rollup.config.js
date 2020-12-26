import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import { terser } from 'rollup-plugin-terser'

const PROD = !!process.env.CI

console.log(`production: ${PROD}`)

const plugins = [
  typescript({
    verbosity: 2,
    clean: true,
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs({
    ignoreGlobal: true,
    include: [/node_modules/],
    namedExports: {
      'js-sha3': [
        'keccak_224',
        'keccak224',
        'keccak_256',
        'keccak256',
        'keccak_384',
        'keccak384',
        'keccak_512',
        'keccak512',
        'sha3_224',
        'sha3_256',
        'sha3_384',
        'sha3_512',
        'shake_128',
        'shake128',
        'shake_256',
        'shake256',
        'cshake_128',
        'cshake128',
        'cshake_256',
        'cshake256',
        'kmac_128',
        'kmac128',
        'kmac_256',
        'kmac256',
      ],
      utf8: ['encode', 'decode'],
      'crypto-js': ['enc'],
      react: ['Children', 'Component', 'PropTypes', 'createElement', 'useEffect', 'useState', 'useRef'],
      'node_modules/secp256k1/elliptic.js': [
        'privateKeyVerify',
        'privateKeyNegate',
        'privateKeyTweakAdd',
        'privateKeyTweakMul',
        'publicKeyVerify',
        'publicKeyCreate',
        'publicKeyConvert',
        'publicKeyNegate',
        'publicKeyCombine',
        'publicKeyTweakAdd',
        'publicKeyTweakMul',
        'signatureNormalize',
        'ecdsaSign',
        'ecdsaVerify',
        'ecdsaRecover',
        'ecdh',
      ],
    },
  }),

  PROD && terser({}),
  globals({}),
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
      amd: {
        id: 'eth-connect',
      },
    }
  ],
}
