// ganache depends on @trufflesuite/uws-js-unofficial, which only ships prebuilt
// native binaries up to Node ABI 115 (Node 20). On Node 24 (ABI 137) the native
// module is missing and ganache.server().listen() fails on linux-x64.
// ganache (and uws) are unmaintained, so no newer version ships an ABI 137 binary.
// Force uws to use its pure-JS fallback implementation, which is portable across
// all Node ABIs. This must run before any test imports 'ganache'.
process.env.UWS_USE_FALLBACK = 'true'
