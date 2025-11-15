export async function initializeDatabase(db) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'telecaller')),
      manager_id INTEGER,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )
  `)

  // Contacts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      company TEXT,
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
      assigned_to INTEGER,
      source TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `)

  // Calls table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      duration INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'missed', 'failed')),
      call_type TEXT DEFAULT 'outbound' CHECK(call_type IN ('inbound', 'outbound')),
      notes TEXT,
      twilio_sid TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // Call recordings/logs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      details TEXT,
      FOREIGN KEY (call_id) REFERENCES calls(id)
    )
  `)

  // Analytics/KPIs table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date DATE NOT NULL,
      calls_made INTEGER DEFAULT 0,
      calls_connected INTEGER DEFAULT 0,
      calls_converted INTEGER DEFAULT 0,
      total_talk_time INTEGER DEFAULT 0,
      contacts_created INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  console.log("Database schema created successfully")
}
