PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,mode TEXT NOT NULL,token TEXT,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS messages(id TEXT,session_id TEXT REFERENCES sessions(id),subject TEXT,sender TEXT,snippet TEXT,labels TEXT,PRIMARY KEY(id,session_id));
CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,session_id TEXT REFERENCES sessions(id),created INTEGER NOT NULL,ended INTEGER,undone INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY,run_id TEXT REFERENCES runs(id),message_id TEXT,kind TEXT,before_labels TEXT,after_labels TEXT,status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS scores(run_id TEXT PRIMARY KEY REFERENCES runs(id),name TEXT NOT NULL,score INTEGER NOT NULL,created INTEGER NOT NULL);
