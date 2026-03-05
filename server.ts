import express from 'express';
import { createServer as createViteServer } from 'vite';

// Dynamic imports will be used for DB to prevent startup crashes if bindings fail

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
