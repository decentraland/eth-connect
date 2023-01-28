export default {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: 'ts-jest',
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "test"
  ],
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'test/tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/*.ts"
  ],
  verbose: true
};
