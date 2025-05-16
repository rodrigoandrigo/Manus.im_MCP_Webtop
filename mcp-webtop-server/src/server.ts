import express, { Express, Request, Response, NextFunction } from 'express';
import { MCP_SERVER_PORT } from './config';
import mainRouter from './routes'; // Descomentado e importado

const app: Express = express();

app.use(express.json());

// Middleware de log básico (pode ser expandido)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rota de health check básica
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'MCP Server is running' });
});

app.use('/api/v1', mainRouter); // Rotas principais conectadas sob /api/v1

// Middleware de tratamento de erros básico
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
});

app.listen(MCP_SERVER_PORT, () => {
  console.log(`MCP Server listening on port ${MCP_SERVER_PORT}`);
  console.log(`Webtop URL configured: ${process.env.WEBTOP_URL || "http://localhost:3000/"}`);
  console.log(`MCP Server available at http://localhost:${MCP_SERVER_PORT}`);
});

export default app;

