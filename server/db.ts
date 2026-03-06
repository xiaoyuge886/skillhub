import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'skills.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    engine TEXT NOT NULL,
    version TEXT NOT NULL,
    status TEXT NOT NULL,
    icon TEXT,
    author_name TEXT,
    author_handle TEXT,
    author_avatar TEXT,
    stats_stars INTEGER DEFAULT 0,
    stats_downloads INTEGER DEFAULT 0,
    stats_installs INTEGER DEFAULT 0,
    security_virusTotal TEXT,
    security_openClaw TEXT,
    security_confidence TEXT,
    security_message TEXT,
    readme TEXT,
    local_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skill_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id TEXT NOT NULL,
    version TEXT NOT NULL,
    date TEXT NOT NULL,
    changes TEXT, -- JSON array of strings
    security_virusTotal TEXT,
    security_openClaw TEXT,
    FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
  );
`);

// Migration: Add local_path if it doesn't exist
try {
  db.exec(`ALTER TABLE skills ADD COLUMN local_path TEXT;`);
} catch (e) {
  // Column already exists or other error
}

// Helper to parse history changes from JSON
const parseHistory = (historyRows: any[]) => {
  return historyRows.map(row => ({
    version: row.version,
    date: row.date,
    changes: JSON.parse(row.changes || '[]'),
    security: {
      virusTotal: row.security_virusTotal,
      openClaw: row.security_openClaw
    }
  }));
};

export const skillService = {
  getAllSkills: () => {
    const skills = db.prepare('SELECT * FROM skills ORDER BY created_at DESC').all();
    return skills.map((skill: any) => {
      const history = db.prepare('SELECT * FROM skill_history WHERE skill_id = ? ORDER BY date DESC').all(skill.id);
      return {
        ...skill,
        author: {
          name: skill.author_name,
          handle: skill.author_handle,
          avatar: skill.author_avatar
        },
        stats: {
          stars: skill.stats_stars,
          downloads: skill.stats_downloads,
          installs: skill.stats_installs
        },
        security: {
          virusTotal: skill.security_virusTotal,
          openClaw: skill.security_openClaw,
          confidence: skill.security_confidence,
          message: skill.security_message
        },
        localPath: skill.local_path,
        history: parseHistory(history)
      };
    });
  },

  getSkillById: (id: string) => {
    const skill: any = db.prepare('SELECT * FROM skills WHERE id = ?').get(id);
    if (!skill) return null;

    const history = db.prepare('SELECT * FROM skill_history WHERE skill_id = ? ORDER BY date DESC').all(id);
    
    return {
      ...skill,
      author: {
        name: skill.author_name,
        handle: skill.author_handle,
        avatar: skill.author_avatar
      },
      stats: {
        stars: skill.stats_stars,
        downloads: skill.stats_downloads,
        installs: skill.stats_installs
      },
      security: {
        virusTotal: skill.security_virusTotal,
        openClaw: skill.security_openClaw,
        confidence: skill.security_confidence,
        message: skill.security_message
      },
      localPath: skill.local_path,
      history: parseHistory(history)
    };
  },

  createSkill: (skill: any) => {
    const stmt = db.prepare(`
      INSERT INTO skills (
        id, name, description, type, provider, engine, version, status, icon,
        author_name, author_handle, author_avatar,
        stats_stars, stats_downloads, stats_installs,
        security_virusTotal, security_openClaw, security_confidence, security_message,
        readme, local_path
      ) VALUES (
        @id, @name, @description, @type, @provider, @engine, @version, @status, @icon,
        @author_name, @author_handle, @author_avatar,
        @stats_stars, @stats_downloads, @stats_installs,
        @security_virusTotal, @security_openClaw, @security_confidence, @security_message,
        @readme, @local_path
      )
    `);

    const info = stmt.run({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      type: skill.type,
      provider: skill.provider,
      engine: skill.engine,
      version: skill.version,
      status: skill.status,
      icon: skill.icon,
      author_name: skill.author.name,
      author_handle: skill.author.handle,
      author_avatar: skill.author.avatar,
      stats_stars: skill.stats.stars,
      stats_downloads: skill.stats.downloads,
      stats_installs: skill.stats.installs,
      security_virusTotal: skill.security.virusTotal,
      security_openClaw: skill.security.openClaw,
      security_confidence: skill.security.confidence,
      security_message: skill.security.message,
      readme: skill.readme,
      local_path: skill.localPath || null
    });

    // Insert history if exists
    if (skill.history && skill.history.length > 0) {
      const historyStmt = db.prepare(`
        INSERT INTO skill_history (skill_id, version, date, changes, security_virusTotal, security_openClaw)
        VALUES (@skill_id, @version, @date, @changes, @security_virusTotal, @security_openClaw)
      `);
      
      for (const h of skill.history) {
        historyStmt.run({
          skill_id: skill.id,
          version: h.version,
          date: h.date,
          changes: JSON.stringify(h.changes),
          security_virusTotal: h.security.virusTotal,
          security_openClaw: h.security.openClaw
        });
      }
    }

    return info;
  },

  updateSkill: (id: string, updates: any) => {
    // Dynamic update query construction
    const fields = [];
    const values: any = { id };

    // Flatten nested objects for SQL
    if (updates.author) {
      if (updates.author.name) { fields.push('author_name = @author_name'); values.author_name = updates.author.name; }
      if (updates.author.handle) { fields.push('author_handle = @author_handle'); values.author_handle = updates.author.handle; }
      if (updates.author.avatar) { fields.push('author_avatar = @author_avatar'); values.author_avatar = updates.author.avatar; }
    }
    
    // ... map other fields similarly or use a more generic mapper if strict type checking allows
    // For brevity, mapping top-level fields:
    const topLevelFields = ['name', 'description', 'type', 'provider', 'engine', 'version', 'status', 'icon', 'readme', 'local_path'];
    for (const field of topLevelFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = @${field}`);
        values[field] = updates[field];
      }
    }

    if (fields.length === 0) return { changes: 0 };

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(`UPDATE skills SET ${fields.join(', ')} WHERE id = @id`);
    return stmt.run(values);
  },

  deleteSkill: (id: string) => {
    return db.prepare('DELETE FROM skills WHERE id = ?').run(id);
  }
};
