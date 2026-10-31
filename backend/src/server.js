import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import routes from './routes/api.js';
import { origin, errors } from './middleware/security.js';
export const app = express();
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: { directives: { scriptSrc: ["'self'", "'wasm-unsafe-eval'"] } },
  }),
);
app.use(cors({ origin: process.env.APP_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(express.json({ limit: '64kb' }));
app.use(origin);
app.use('/api', routes);
app.use('/api', (_q, r) =>
  r.status(404).json({ error: { code: 'NOT_FOUND', message: 'API endpoint not found' } }),
);
app.use(express.static(resolve('frontend/dist')));
app.get('/{*path}', (_q, r) => r.sendFile(resolve('frontend/dist/index.html')));
app.use(errors);
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  app.listen(Number(process.env.PORT) || 8080, '0.0.0.0', () =>
    console.log('Chore Arcade listening on port ' + (process.env.PORT || 8080)),
  );
