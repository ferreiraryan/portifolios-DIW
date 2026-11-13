import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function portfoliosJsonApiPlugin(): Plugin {
  const jsonPath = path.resolve(__dirname, 'public', 'portfolios.json');

  return {
    name: 'portfolios-json-api',
    configureServer(server) {
      server.middlewares.use('/api/portfolios', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          if (!Array.isArray(body)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Payload deve ser um array JSON' }));
            return;
          }
          await fs.writeFile(jsonPath, `${JSON.stringify(body, null, 2)}\n`, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, savedTo: 'public/portfolios.json' }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: (err as Error).message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), portfoliosJsonApiPlugin()],
});
