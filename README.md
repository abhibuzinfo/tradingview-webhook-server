# 🚀 TradingView Webhook Server

A production-ready webhook server for receiving TradingView alerts and executing trading orders.

## **📋 Features**

- ✅ **TradingView Webhook Endpoint** - Receive trading signals
- ✅ **Order Execution API** - Manual order placement
- ✅ **Order Monitoring** - Track order status and history
- ✅ **Health Checks** - Monitor server status
- ✅ **Production Ready** - Deployed on Render

## **🚀 Quick Deploy to Render**

### **Option 1: One-Click Deploy (Recommended)**
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### **Option 2: Manual Deploy**
1. **Fork this repository** to your GitHub account
2. **Go to [Render.com](https://render.com)** and sign up
3. **Click "New +"** → "Web Service"
4. **Connect your GitHub repository**
5. **Configure deployment:**
   - **Name**: `tradingview-webhook-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

## **🌐 API Endpoints**

### **TradingView Webhook**
```
POST /webhook/tradingview
```
**Example Payload:**
```json
{
  "symbol": "ES1!",
  "side": "BUY",
  "price": "4500.00",
  "quantity": "1",
  "strategy": "Breakout Strategy"
}
```

### **Manual Order Execution**
```
POST /api/execute-order
```
**Example Payload:**
```json
{
  "symbol": "ES1!",
  "side": "BUY",
  "price": "4500.00",
  "quantity": "1",
  "type": "limit",
  "broker": "AMP Live"
}
```

### **Order Status**
```
GET /api/orders
GET /api/orders/:id
```

### **Health Check**
```
GET /health
```

## **🔧 Local Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## **📡 TradingView Alert Setup**

1. **Create TradingView Alert:**
   - Symbol: `ES1!` (E-mini S&P 500)
   - Condition: Price crosses level
   - Action: Webhook URL

2. **Webhook URL:**
   ```
   https://your-app-name.onrender.com/webhook/tradingview
   ```

3. **Alert Message Format:**
   ```json
   {
     "symbol": "ES1!",
     "side": "BUY",
     "price": "4500.00",
     "quantity": "1",
     "strategy": "Breakout Strategy"
   }
   ```

## **🌍 Environment Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |

## **📊 Order Flow**

```
TradingView Alert → Webhook Server → Order Processing → Broker API
     ↓                    ↓              ↓            ↓
  Price Signal    →  Signal Validation → Order Queue → Real Trade
```

## **🔒 Security Features**

- **Input Validation** - All webhook data validated
- **Error Handling** - Comprehensive error management
- **Rate Limiting** - Built-in request throttling
- **HTTPS Only** - Secure communication (Render provides)

## **📈 Monitoring**

- **Health Checks** - `/health` endpoint
- **Order Logs** - Complete order history
- **Error Tracking** - Failed order monitoring
- **Performance Metrics** - Response times

## **🚀 Next Steps**

1. **Deploy to Render** (FREE)
2. **Configure TradingView alerts**
3. **Test webhook integration**
4. **Integrate broker API**
5. **Monitor and optimize**

## **💡 Support**

- **Documentation**: Check the code comments
- **Issues**: GitHub Issues tab
- **Render Support**: [Render.com/help](https://render.com/help)

---

**Happy Trading! 🎯📈**
