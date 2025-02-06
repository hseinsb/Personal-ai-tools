import Database from "better-sqlite3";

// Initialize the database and specify its location
const db = new Database("./data/database.db");

// ✅ Create the tools table with the correct schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    link TEXT NOT NULL,
    description TEXT
  );
`);

export default db;
