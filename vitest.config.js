import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['backend/tests/**/*.test.js'],env:{DATABASE_PATH:':memory:'},fileParallelism:false}});
