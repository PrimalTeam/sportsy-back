import 'reflect-metadata';
import { existsSync } from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const envCandidates = [
  process.env.API_TEST_ENV_FILE,
  path.resolve(process.cwd(), '.env.test'),
  path.resolve(process.cwd(), '.env'),
].filter((candidate): candidate is string => Boolean(candidate));

for (const candidate of envCandidates) {
  if (existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

// Allow extra time for remote HTTP calls to finish during CI runs.
jest.setTimeout(120_000);
jest.retryTimes(0);
