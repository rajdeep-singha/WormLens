import { Router,Request,Response,NextFunction } from "express";
import { LendingService } from '../services/lending.service';
import {
    ApiResponse, 
    AggregatedRates,
    AggregatedLiquidity,
    UserPositions,
    Chain,
    Protocol,
    LendingAnalyticsError,
    ErrorCode,
} from '../types'

const router = Router();
const lendingServices = new LendingService();

//validation middlewares can be added here
const validateChain=(req:Request,res:Response,next:NextFunction)=>{
    const {chain}=req.query;
    if(chain && !Object.values(Chain).includes(chain as Chain)){
        throw new LendingAnalyticsError(
      `Invalid chain: ${chain}`,
      ErrorCode.INVALID_CHAIN,
      400
    );
}
    next();
};

const validateProtocol = (req: Request, res: Response, next: NextFunction) => {
  const { protocol } = req.query;
  if (protocol && !Object.values(Protocol).includes(protocol as Protocol)) {
    throw new LendingAnalyticsError(
      `Invalid protocol: ${protocol}`,
      ErrorCode.INVALID_PROTOCOL,
      400
    );
  }
  next();
};

const validateWalletAddress = (req: Request, res: Response, next: NextFunction) => {
  const { wallet } = req.params;
  if (!wallet || wallet.length < 20) {
    throw new LendingAnalyticsError(
      'Invalid wallet address',
      ErrorCode.INVALID_ADDRESS,
      400
    );
  }
  next();
};

// Rate Endpoints

router.get(
  '/rates',
  validateChain,
  validateProtocol,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chain, protocol, asset } = req.query;

      const rates = await lendingServices.getAggregatedRates({
        chains: chain ? [chain as Chain] : undefined,
        protocols: protocol ? [protocol as Protocol] : undefined,
        asset: asset as string | undefined,
      });


      const response: ApiResponse<AggregatedRates> = {
        success: true,
        data: rates,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// get best rates
router.get(
  '/rates/best',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, asset, amount } = req.query;

      if (!type || !['supply', 'borrow'].includes(type as string)) {
        throw new LendingAnalyticsError(
          'Type must be either "supply" or "borrow"',
          ErrorCode.INVALID_CHAIN,
          400
        );
      }

      if (!asset) {
        throw new LendingAnalyticsError(
          'Asset parameter is required',
          ErrorCode.INVALID_CHAIN,
          400
        );
      }

      const bestRates = await lendingServices.getBestRates(
        type as 'supply' | 'borrow',
        asset as string,
        amount ? parseFloat(amount as string) : undefined
      );

      const response: ApiResponse<typeof bestRates> = {
        success: true,
        data: bestRates,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

//Liquidity Endpoints

router.get(
  '/liquidity',
  validateChain,
  validateProtocol,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chain, protocol, asset } = req.query;

      const liquidity = await lendingServices.getAggregatedLiquidity({
        chains: chain ? [chain as Chain] : undefined,
        protocols: protocol ? [protocol as Protocol] : undefined,
        asset: asset as string | undefined,
      });

      const response: ApiResponse<AggregatedLiquidity> = {
        success: true,
        data: liquidity,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

//  GET /api/v1/liquidity/utilization

router.get(
  '/liquidity/utilization',
  validateChain,
  validateProtocol,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { chain, protocol } = req.query;

      const utilization = await lendingServices.getUtilizationRates({
        chains: chain ? [chain as Chain] : undefined,
        protocols: protocol ? [protocol as Protocol] : undefined,
      });

      const response: ApiResponse<typeof utilization> = {
        success: true,
        data: utilization,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// User Positions Endpoint
router.get(
  '/user/:wallet',
  validateWalletAddress,
  validateChain,
  validateProtocol,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { wallet } = req.params;
      const { chain, protocol } = req.query;

      const positions = await lendingServices.getUserPositions(wallet as string, {
        chains: chain ? [chain as Chain] : undefined,
        protocols: protocol ? [protocol as Protocol] : undefined,
      });

      const response: ApiResponse<UserPositions> = {
        success: true,
        data: positions,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

//GET /api/v1/user/:wallet/health

router.get(
  '/user/:wallet/health',
  validateWalletAddress,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { wallet } = req.params;

      const health = await lendingServices.getUserHealthFactor(wallet as string);

      const response: ApiResponse<typeof health> = {
        success: true,
        data: health,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Analytics Endpoints
router.get(
  '/analytics/overview',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await lendingServices.getMarketOverview();

      const response: ApiResponse<typeof overview> = {
        success: true,
        data: overview,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

//GET /api/v1/analytics/compare
router.get(
  '/analytics/compare',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { asset, chains, protocols } = req.query;

      if (!asset) {
        throw new LendingAnalyticsError(
          'Asset parameter is required',
          ErrorCode.INVALID_CHAIN,
          400
        );
      }

      const comparison = await lendingServices.compareRates(
        asset as string,
        chains ? (chains as string).split(',') as Chain[] : undefined,
        protocols ? (protocols as string).split(',') as Protocol[] : undefined
      );

      const response: ApiResponse<typeof comparison> = {
        success: true,
        data: comparison,
        timestamp: Date.now(),
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);
//GET /api/v1/supported

router.get('/supported', (req: Request, res: Response) => {
  const response: ApiResponse<{
    chains: Chain[];
    protocols: Protocol[];
  }> = {
    success: true,
    data: {
      chains: Object.values(Chain),
      protocols: Object.values(Protocol),
    },
    timestamp: Date.now(),
  };

  res.json(response);
});

export { router as lendingRoutes };