import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const location = process.env.DATABASE_PATH || (process.env.VERCEL ? '/tmp/arcade.db' : 'database/arcade.db');
mkdirSync(dirname(location), { recursive: true });
export const db = new Database(location);

const schema = `
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,mode TEXT NOT NULL,token TEXT,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS messages(id TEXT NOT NULL,session_id TEXT NOT NULL,subject TEXT NOT NULL,sender TEXT NOT NULL,snippet TEXT NOT NULL,labels TEXT NOT NULL,PRIMARY KEY(id,session_id));
CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,session_id TEXT NOT NULL,created INTEGER NOT NULL,ended INTEGER,undone INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY,run_id TEXT NOT NULL,message_id TEXT NOT NULL,kind TEXT NOT NULL,before_labels TEXT NOT NULL,after_labels TEXT NOT NULL,status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS scores(run_id TEXT PRIMARY KEY,name TEXT NOT NULL,score INTEGER NOT NULL,created INTEGER NOT NULL);
`;

db.exec(schema);
export const one = (sql, ...args) => db.prepare(sql).get(...args);
export const all = (sql, ...args) => db.prepare(sql).all(...args);
export const write = (sql, ...args) => db.prepare(sql).run(...args);

