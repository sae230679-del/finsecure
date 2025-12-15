import { beforeAll, afterAll } from 'vitest';
import { app, initializeApp } from '../server/app';
import { pool } from '../server/db';

export { app };

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initializeApp();
});

afterAll(async () => {
  await pool.end();
});
