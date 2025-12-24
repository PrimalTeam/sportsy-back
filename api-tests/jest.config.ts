import type { Config } from 'jest';

const config: Config = {
  rootDir: __dirname,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup/jest-setup.ts'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../src/$1',
  },
  maxWorkers: 1,
  verbose: false,
  detectOpenHandles: true,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: false,
    },
  },
};

export default config;
