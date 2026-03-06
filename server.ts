import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_demo';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Health check - critical for platform detection
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper to get DB service safely
  async function getSkillService() {
    try {
      const mod = await import('./server/db');
      return mod.skillService;
    } catch (e) {
      console.error("Failed to load database module:", e);
      return null;
    }
  }

  async function getUserService() {
    try {
      const mod = await import('./server/db');
      return mod.userService;
    } catch (e) {
      console.error("Failed to load database module:", e);
      return null;
    }
  }

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      next();
    } catch (err) {
      res.status(403).json({ error: 'Invalid token' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const service = await getUserService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const existingUser = service.getUserByUsername(username) || service.getUserByEmail(email);
      if (existingUser) return res.status(400).json({ error: 'User already exists' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const id = Math.random().toString(36).substring(2, 15);

      service.createUser({ id, username, email, passwordHash });
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to register' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const service = await getUserService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const user = service.getUserByUsername(username);
      if (!user) return res.status(400).json({ error: 'Invalid username or password' });

      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const service = await getUserService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const user = service.getUserById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // API Routes
  app.get('/api/skills', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });
      
      const skills = service.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch skills' });
    }
  });

  app.get('/api/skills/:id', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const skill = service.getSkillById(req.params.id);
      if (!skill) return res.status(404).json({ error: 'Skill not found' });
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch skill' });
    }
  });

  app.post('/api/skills', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      service.createSkill(req.body);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create skill' });
    }
  });

  app.put('/api/skills/:id', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      service.updateSkill(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update skill' });
    }
  });

  app.delete('/api/skills/:id', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      service.deleteSkill(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete skill' });
    }
  });

  // Comments Routes
  app.get('/api/skills/:id/comments', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const comments = service.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  app.post('/api/skills/:id/comments', authenticateToken, async (req: any, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Comment content is required' });

      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const userService = await getUserService();
      const user = userService?.getUserById(req.user.id);

      service.addComment({
        skillId: req.params.id,
        userId: req.user.id,
        userName: user?.username || 'Unknown',
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'anon'}`,
        content
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to add comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  // Get Skill Files List
  app.get('/api/skills/:id/files', async (req, res) => {
    try {
      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const skill = service.getSkillById(req.params.id);
      if (!skill || !skill.localPath) {
        return res.json([]); // No local files
      }

      if (!fs.existsSync(skill.localPath)) {
        return res.status(404).json({ error: 'Skill directory not found' });
      }

      const getFiles = (dir: string, baseDir: string): any[] => {
        const items = fs.readdirSync(dir);
        return items.map(item => {
          const fullPath = path.join(dir, item);
          const relativePath = path.relative(baseDir, fullPath);
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            return {
              name: item,
              path: relativePath,
              type: 'folder',
              children: getFiles(fullPath, baseDir)
            };
          } else {
            return {
              name: item,
              path: relativePath,
              type: 'file'
            };
          }
        });
      };

      const files = getFiles(skill.localPath, skill.localPath);
      res.json(files);
    } catch (error) {
      console.error('Failed to list files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  });

  // Get Skill File Content
  app.get('/api/skills/:id/files/content', async (req, res) => {
    try {
      const { path: filePath } = req.query;
      if (!filePath) return res.status(400).json({ error: 'Missing file path' });

      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const skill = service.getSkillById(req.params.id);
      if (!skill || !skill.localPath) {
        return res.status(404).json({ error: 'Skill or local path not found' });
      }

      const fullPath = path.join(skill.localPath, String(filePath));
      
      // Security check: ensure the file is within the skill's directory
      if (!fullPath.startsWith(path.resolve(skill.localPath))) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        return res.status(404).json({ error: 'File not found' });
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ content });
    } catch (error) {
      console.error('Failed to read file:', error);
      res.status(500).json({ error: 'Failed to read file' });
    }
  });

  // Update Skill File Content
  app.post('/api/skills/:id/files/content', async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      if (!filePath) return res.status(400).json({ error: 'Missing file path' });
      if (content === undefined) return res.status(400).json({ error: 'Missing content' });

      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      let skill = service.getSkillById(req.params.id);
      if (!skill) return res.status(404).json({ error: 'Skill not found' });

      // If mock skill has no local path, create one
      if (!skill.localPath) {
        const skillsDir = path.join(process.cwd(), 'skills');
        if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir);
        
        const newPath = path.join(skillsDir, skill.id);
        if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
        
        service.updateSkill(skill.id, { local_path: newPath });
        skill = service.getSkillById(req.params.id); // Refresh
      }

      if (!skill || !skill.localPath) {
        return res.status(500).json({ error: 'Failed to ensure local path' });
      }

      const fullPath = path.join(skill.localPath, String(filePath));
      
      // Security check
      const resolvedBase = path.resolve(skill.localPath);
      const resolvedFile = path.resolve(fullPath);
      if (!resolvedFile.startsWith(resolvedBase)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      fs.writeFileSync(fullPath, content, 'utf-8');

      // If this is the main readme file, update the database column too
      const isReadme = ['skill.md', 'readme.md'].includes(String(filePath).toLowerCase());
      if (isReadme) {
        service.updateSkill(req.params.id, { readme: content });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update file:', error);
      res.status(500).json({ error: 'Failed to update file' });
    }
  });

  // Create New Skill File
  app.post('/api/skills/:id/files/create', async (req, res) => {
    try {
      const { path: filePath, name, type = 'file' } = req.body;
      if (!name) return res.status(400).json({ error: 'Missing name' });

      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      let skill = service.getSkillById(req.params.id);
      if (!skill) return res.status(404).json({ error: 'Skill not found' });

      // If mock skill has no local path, create one
      if (!skill.localPath) {
        const skillsDir = path.join(process.cwd(), 'skills');
        if (!fs.existsSync(skillsDir)) fs.mkdirSync(skillsDir);
        
        const newPath = path.join(skillsDir, skill.id);
        if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
        
        service.updateSkill(skill.id, { local_path: newPath });
        skill = service.getSkillById(req.params.id); // Refresh
      }

      if (!skill || !skill.localPath) {
        return res.status(500).json({ error: 'Failed to ensure local path' });
      }

      const targetDir = filePath ? path.join(skill.localPath, String(filePath)) : skill.localPath;
      const fullPath = path.join(targetDir, name);
      
      // Security check
      const resolvedBase = path.resolve(skill.localPath);
      const resolvedFile = path.resolve(fullPath);
      if (!resolvedFile.startsWith(resolvedBase)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (fs.existsSync(fullPath)) {
        return res.status(400).json({ error: 'File or directory already exists' });
      }

      if (type === 'folder') {
        fs.mkdirSync(fullPath, { recursive: true });
      } else {
        fs.writeFileSync(fullPath, '', 'utf-8');
      }

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Failed to create file/folder:', error);
      res.status(500).json({ error: 'Failed to create file/folder' });
    }
  });

  // Upload Skill Endpoint
  app.post('/api/skills/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const service = await getSkillService();
      if (!service) return res.status(503).json({ error: 'Database unavailable' });

      const zipPath = req.file.path;
      const zip = new AdmZip(zipPath);
      
      // Create skills directory if it doesn't exist
      const skillsDir = path.join(process.cwd(), 'skills');
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir);
      }

      // Extract to a temporary directory first to read metadata
      const tempDir = path.join(process.cwd(), 'uploads', `temp_${Date.now()}`);
      fs.mkdirSync(tempDir);
      zip.extractAllTo(tempDir, true);

      // Recursive function to find skill metadata
      const findSkillRoot = (dir: string): { root: string, type: 'skill' | 'package' | 'markdown', data: any } | null => {
        const items = fs.readdirSync(dir);
        
        // Priority 1: skill.json or .mcp.json
        const skillJson = items.find(i => i.toLowerCase() === 'skill.json' || i.toLowerCase() === '.mcp.json');
        if (skillJson) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(dir, skillJson), 'utf-8'));
            // If it's an MCP config, map it to our skill structure
            if (skillJson.toLowerCase() === '.mcp.json') {
              return {
                root: dir,
                type: 'skill',
                data: {
                  id: (data.name || path.basename(dir)).replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Date.now(),
                  name: data.name || path.basename(dir),
                  description: data.description || 'MCP Skill package',
                  version: data.version || '1.0.0',
                  type: 'MCP',
                  provider: 'Local',
                  engine: 'MCP',
                  status: 'active',
                  icon: 'cpu',
                  author: {
                    name: 'Local User',
                    handle: '@local',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=local'
                  },
                  stats: { stars: 0, downloads: 0, installs: 0 },
                  security: { confidence: 'HIGH', message: 'MCP standard package' },
                  readme: fs.existsSync(path.join(dir, 'README.md')) ? fs.readFileSync(path.join(dir, 'README.md'), 'utf-8') : '# ' + (data.name || 'MCP Skill')
                }
              };
            }
            return { root: dir, type: 'skill', data };
          } catch (e) { console.error('Error parsing metadata JSON', e); }
        }

        // Priority 2: package.json
        const packageJson = items.find(i => i.toLowerCase() === 'package.json');
        if (packageJson) {
          try {
            const pkg = JSON.parse(fs.readFileSync(path.join(dir, packageJson), 'utf-8'));
            const data = {
              id: pkg.name.replace(/[^a-z0-9]/gi, '-').toLowerCase(),
              name: pkg.name,
              description: pkg.description || 'No description provided',
              version: pkg.version || '1.0.0',
              type: 'Plugin',
              provider: 'Local',
              engine: 'Node.js',
              status: 'active',
              icon: 'box',
              author: {
                name: pkg.author || 'Unknown',
                handle: '@local',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=local'
              },
              stats: { stars: 0, downloads: 0, installs: 0 },
              security: { confidence: 'HIGH', message: 'Locally installed' },
              readme: fs.existsSync(path.join(dir, 'README.md')) ? fs.readFileSync(path.join(dir, 'README.md'), 'utf-8') : '# ' + pkg.name
            };
            return { root: dir, type: 'package', data };
          } catch (e) { console.error('Error parsing package.json', e); }
        }

        // Priority 3: SKILL.md
        const skillMd = items.find(i => i.toLowerCase() === 'skill.md');
        if (skillMd) {
          const readmeContent = fs.readFileSync(path.join(dir, skillMd), 'utf-8');
          const firstLine = readmeContent.split('\n')[0].replace(/^#+\s*/, '').trim();
          const originalName = req.file!.originalname.replace('.zip', '');
          const name = firstLine || originalName;
          
          const data = {
            id: originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Date.now(),
            name: name,
            description: 'Skill imported from Markdown package',
            version: '1.0.0',
            type: 'Utility',
            provider: 'Local',
            engine: 'Markdown',
            status: 'active',
            icon: 'file-text',
            author: {
              name: 'Local User',
              handle: '@local',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=local'
            },
            stats: { stars: 0, downloads: 0, installs: 0 },
            security: { confidence: 'MEDIUM', message: 'Imported from Markdown structure' },
            readme: readmeContent
          };
          return { root: dir, type: 'markdown', data };
        }

        // Recurse into subdirectories
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            const found = findSkillRoot(fullPath);
            if (found) return found;
          }
        }

        return null;
      };

      let skillInfo = findSkillRoot(tempDir);

      // If no metadata found, create a default one based on the ZIP name
      if (!skillInfo) {
        const originalName = req.file!.originalname.replace('.zip', '');
        const data = {
          id: originalName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-' + Date.now(),
          name: originalName,
          description: 'Custom skill package',
          version: '1.0.0',
          type: 'Utility',
          provider: 'Local',
          engine: 'General',
          status: 'active',
          icon: 'box',
          author: {
            name: 'Local User',
            handle: '@local',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=local'
          },
          stats: { stars: 0, downloads: 0, installs: 0 },
          security: { confidence: 'MEDIUM', message: 'Imported package' },
          readme: '# ' + originalName + '\n\nCustom skill package imported from ZIP.'
        };
        skillInfo = { root: tempDir, type: 'markdown', data };
      }

      const { root: skillRoot, data: skillData } = skillInfo;

      // Move to final destination
      const finalDest = path.join(skillsDir, skillData.id);
      if (fs.existsSync(finalDest)) {
        fs.rmSync(finalDest, { recursive: true, force: true });
      }
      
      // If the root is a subfolder, we move its contents. If it's the tempDir itself, we rename it.
      if (skillRoot === tempDir) {
        fs.renameSync(tempDir, finalDest);
      } else {
        fs.mkdirSync(finalDest, { recursive: true });
        const items = fs.readdirSync(skillRoot);
        for (const item of items) {
          fs.renameSync(path.join(skillRoot, item), path.join(finalDest, item));
        }
        // Cleanup tempDir
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      // Add local path to metadata
      skillData.localPath = finalDest;

      // Save to database
      service.createSkill(skillData);

      // Cleanup ZIP
      fs.unlinkSync(zipPath);

      res.status(201).json({ success: true, skill: skillData });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process skill package' });
    }
  });

  // Debug Engine Endpoint (SSE)
  app.get('/api/debug/run', async (req, res) => {
    const { prompt, engine: engineName, skillId, apiKey, apiUrl, model } = req.query;

    if (!prompt || !engineName) {
      return res.status(400).json({ error: 'Missing prompt or engine' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Use dynamic import to avoid loading engine code if not needed
      // const { engineRegistry } = await import('./server/engine/index');
      // But for simplicity in this example, we assume it's available or imported at top level if possible
      // Re-importing here to ensure we get the registry
      const { engineRegistry } = await import('./server/engine/index');
      const engine = engineRegistry.get(String(engineName));

      if (!engine) {
        res.write(`data: ${JSON.stringify({ error: 'Engine not found' })}\n\n`);
        res.end();
        return;
      }

      const stream = engine.run(String(prompt), {
        apiKey: apiKey ? String(apiKey) : undefined,
        apiUrl: apiUrl ? String(apiUrl) : undefined,
        model: model ? String(model) : undefined
      });

      for await (const message of stream) {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
      }

      res.write('event: done\ndata: {}\n\n');
      res.end();

    } catch (error: any) {
      console.error('Debug engine error:', error);
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Failed to start Vite server:", e);
    }
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Seed database asynchronously
    try {
      const service = await getSkillService();
      if (service) {
        const existingSkills = service.getAllSkills();
        if (existingSkills.length === 0) {
          console.log('Seeding database with mock skills...');
          const { MOCK_SKILLS } = await import('./src/types');
          for (const skill of MOCK_SKILLS) {
            try {
              service.createSkill(skill);
              
              // Add some initial comments for each skill
              service.addComment({
                skillId: skill.id,
                userId: 'system',
                userName: 'Alex Chen',
                userAvatar: 'https://picsum.photos/seed/alex/100/100',
                content: 'This skill completely transformed our workflow. The consensus mechanism is surprisingly robust.'
              });
              service.addComment({
                skillId: skill.id,
                userId: 'system',
                userName: 'Sarah Jones',
                userAvatar: 'https://picsum.photos/seed/sarah/100/100',
                content: 'Great work! Would love to see support for custom data sources in the next version.'
              });
              service.addComment({
                skillId: skill.id,
                userId: 'system',
                userName: 'Mike Ross',
                userAvatar: 'https://picsum.photos/seed/mike/100/100',
                content: 'Documentation is top notch. Easy to integrate.'
              });
            } catch (e) {
              console.error(`Failed to seed skill ${skill.name}:`, e);
            }
          }
        }
      }
    } catch (e) {
      console.error("Seeding failed:", e);
    }
  });
}

startServer();
