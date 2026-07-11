CREATE TABLE IF NOT EXISTS flows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zoom REAL DEFAULT 1.0,
    viewport_x REAL DEFAULT 0.0,
    viewport_y REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS credentials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('postgre', 'mysql', 'sqlite', 'api')),
    value1 TEXT,
    value2 TEXT,
    value3 TEXT
);

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    flow_id TEXT NOT NULL,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    x REAL NOT NULL,
    y REAL NOT NULL,
    data TEXT,
    FOREIGN KEY(flow_id) REFERENCES flows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connections (
    id TEXT PRIMARY KEY,
    flow_id TEXT NOT NULL,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    type TEXT,
    source_handle TEXT,
    target_handle TEXT,
    data TEXT,
    FOREIGN KEY(flow_id) REFERENCES flows(id) ON DELETE CASCADE,
    FOREIGN KEY(source) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY(target) REFERENCES nodes(id) ON DELETE CASCADE
);
