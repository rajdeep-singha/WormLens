import dotenv from 'dotenv';
dotenv.config();

import express , {Express, Request, Response,NextFunction} from 'express';
import cors from 'cors';
import helmet from 'helmet';

// import { lendingRoutes } from './routes/lending.routes';
import { LendingAnalyticsError, ApiResponse } from './types';
import { lendingRoutes } from './routes/lending.routes';


const app: Express = express();
const PORT = process.env.PORT || 3001;

//Middlewares

//security
app.use(cors());

//CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
// Routes

// Root route
app.get('/', async (req: Request, res: Response) => {
  try {
    // Check which chains are configured
    const { getWormholeClient } = await import('./config/wormholeClient');
    const wormhole = getWormholeClient();
    const configuredChains = wormhole.getSupportedChains();
    const status = wormhole.getStatus();

    res.json({
      success: true,
      message: 'Multichain Lending Analytics API',
      version: '1.0.0',
      configuration: {
        configuredChains: configuredChains,
        apiKeySet: status.apiKeySet,
        environment: status.environment,
      },
      endpoints: {
        health: '/health',
        supported: '/api/v1/supported',
        rates: {
          aggregated: '/api/v1/rates',
          best: '/api/v1/rates/best?type={supply|borrow}&asset={asset}&amount={optional}',
        },
        liquidity: {
          aggregated: '/api/v1/liquidity',
          utilization: '/api/v1/liquidity/utilization',
        },
        user: {
          positions: '/api/v1/user/:wallet',
          health: '/api/v1/user/:wallet/health',
        },
        analytics: {
          overview: '/api/v1/analytics/overview',
          compare: '/api/v1/analytics/compare?asset={asset}&chains={optional}&protocols={optional}',
        },
      },
      queryParams: {
        chain: 'Filter by chain (optional): ethereum, solana',
        protocol: 'Filter by protocol (optional): aave, solend',
        asset: 'Filter by asset (optional): USDC, ETH, SOL, etc.',
      },
      note: configuredChains.length === 0 
        ? '⚠️ No RPC providers configured. Set ETHEREUM_RPC_URL and/or SOLANA_RPC_URL environment variables.'
        : `✓ ${configuredChains.length} chain(s) configured: ${configuredChains.join(', ')}`,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Multichain Lending Analytics API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        supported: '/api/v1/supported',
        rates: {
          aggregated: '/api/v1/rates',
          best: '/api/v1/rates/best?type={supply|borrow}&asset={asset}&amount={optional}',
        },
        liquidity: {
          aggregated: '/api/v1/liquidity',
          utilization: '/api/v1/liquidity/utilization',
        },
        user: {
          positions: '/api/v1/user/:wallet',
          health: '/api/v1/user/:wallet/health',
        },
        analytics: {
          overview: '/api/v1/analytics/overview',
          compare: '/api/v1/analytics/compare?asset={asset}&chains={optional}&protocols={optional}',
        },
      },
      timestamp: Date.now(),
    });
  }
});

//Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1', lendingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.path} not found`,
    },
    timestamp: Date.now(),
  });
});

// Error Handler 
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof LendingAnalyticsError) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      timestamp: Date.now(),
    };
    return res.status(err.statusCode).json(response);
  }


  // Generic error
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
    },
    timestamp: Date.now(),
  };
  
  res.status(500).json(response);
});

// SERVER START 

app.listen(PORT, () => {
  console.log(`
🚀 Multichain Lending Analytics Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server running on port ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Powered by Wormhole Queries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;