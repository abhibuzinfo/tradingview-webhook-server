// AMP Live Configuration for Paper Trading
module.exports = {
  // Paper Trading API Endpoints
  PAPER_API_URL: 'https://paper-api.ampletrader.com',
  LIVE_API_URL: 'https://api.ampletrader.com',
  
  // API Configuration
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
  
  // Order Types
  ORDER_TYPES: {
    MARKET: 'MARKET',
    LIMIT: 'LIMIT',
    STOP: 'STOP',
    STOP_LIMIT: 'STOP_LIMIT'
  },
  
  // Time in Force
  TIME_IN_FORCE: {
    DAY: 'DAY',
    GTC: 'GTC', // Good Till Cancelled
    IOC: 'IOC', // Immediate or Cancel
    FOK: 'FOK'  // Fill or Kill
  },
  
  // Futures Specific
  FUTURES: {
    ES1: {
      symbol: 'ES1!',
      exchange: 'CME',
      contractSize: 50,
      tickSize: 0.25,
      marginRequirement: 0.05 // 5%
    }
  },
  
  // Risk Management
  RISK: {
    MAX_POSITION_SIZE: 10, // Max contracts per order
    MAX_DAILY_LOSS: 1000,  // Max daily loss in USD
    STOP_LOSS_PERCENT: 0.02 // 2% stop loss default
  }
};
