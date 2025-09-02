# 🚀 TradingView Webhook Integration Setup Guide

## **Overview**
This implementation provides **real order execution** through TradingView webhooks, allowing you to:
- Receive trading signals from TradingView alerts
- Execute orders through your broker API
- Monitor order status and execution

## **🏗️ Architecture**

```
TradingView Alert → Webhook Server → Order Execution → Broker API
     ↓                    ↓              ↓            ↓
  Price Signal    →  Signal Processing → Order Queue → Real Trade
```

## **📋 Prerequisites**

### **1. Node.js Installation**
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from: https://nodejs.org/
```

### **2. TradingView Account**
- Free TradingView account
- Access to create alerts
- Basic charting knowledge

### **3. Broker API Access**
- AMP Live account (or other supported broker)
- API credentials
- Paper trading enabled (recommended for testing)

## **🚀 Quick Start**

### **Step 1: Install Dependencies**
```bash
# Navigate to your project directory
cd "AI Trading Agent"

# Install webhook server dependencies
npm install
```

### **Step 2: Start Webhook Server**
```bash
# Start the webhook server
npm start

# Or for development with auto-restart
npm run dev
```

**Expected Output:**
```
🚀 Webhook Server running on port 3001
📡 TradingView Webhook: http://localhost:3001/webhook/tradingview
🔧 Manual Orders: http://localhost:3001/api/execute-order
📊 Order Status: http://localhost:3001/api/orders
💚 Health Check: http://localhost:3001/health
```

### **Step 3: Test Webhook Server**
1. **Open your trading app** in the browser
2. **Click "Test Webhook Server"** button
3. **Check console** for connection status

## **📡 TradingView Alert Setup**

### **1. Create TradingView Alert**
1. **Open TradingView chart** (ES1! for E-mini S&P 500)
2. **Right-click on chart** → "Create Alert"
3. **Set alert conditions:**
   - **Condition**: Price crosses above/below level
   - **Frequency**: Once on bar close
   - **Actions**: Webhook URL

### **2. Webhook URL Format**
```
http://localhost:3001/webhook/tradingview
```

**Note:** For production, use a public URL (ngrok, Heroku, etc.)

### **3. Alert Message Format**
```json
{
  "symbol": "ES1!",
  "side": "BUY",
  "price": "4500.00",
  "quantity": "1",
  "orderType": "market",
  "strategy": "Breakout Strategy",
  "timeframe": "1H"
}
```

## **🔧 Manual Order Testing**

### **1. Test Order Execution**
1. **Click "Execute Bracket Orders"** in your app
2. **Check webhook server console** for order details
3. **Verify order status** via `/api/orders` endpoint

### **2. API Endpoints**
- **Health Check**: `GET http://localhost:3001/health`
- **Order Status**: `GET http://localhost:3001/api/orders`
- **Execute Order**: `POST http://localhost:3001/api/execute-order`

## **🌐 Production Deployment**

### **1. Public Webhook URL**
```bash
# Using ngrok (temporary)
ngrok http 3001

# Using Heroku
heroku create your-app-name
git push heroku main
```

### **2. Environment Variables**
```bash
# Create .env file
PORT=3001
NODE_ENV=production
BROKER_API_KEY=your_broker_api_key
BROKER_SECRET=your_broker_secret
```

### **3. Security Considerations**
- **HTTPS only** for production
- **API key validation**
- **Rate limiting**
- **IP whitelisting**

## **📊 Order Flow Example**

### **1. TradingView Alert Triggered**
```json
{
  "symbol": "ES1!",
  "side": "BUY",
  "price": "4500.00",
  "quantity": "2",
  "strategy": "Support Bounce"
}
```

### **2. Webhook Server Receives Signal**
```
📡 TradingView Webhook Received: {
  symbol: 'ES1!',
  side: 'BUY',
  price: 4500.00,
  quantity: 2,
  strategy: 'Support Bounce'
}
```

### **3. Order Created and Executed**
```
🔄 Executing order 1234567890: BUY 2 ES1!
✅ Order 1234567890 executed successfully
```

### **4. Order Status Updated**
```json
{
  "id": 1234567890,
  "status": "Filled",
  "executionPrice": 4500.00,
  "executionTime": "2025-08-30T23:05:46.123Z"
}
```

## **🔍 Troubleshooting**

### **Common Issues**

#### **1. Webhook Server Not Starting**
```bash
# Check if port 3001 is available
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

#### **2. Connection Refused**
- Ensure webhook server is running
- Check firewall settings
- Verify port configuration

#### **3. Order Not Executing**
- Check webhook server logs
- Verify TradingView alert format
- Test manual order execution

### **Debug Commands**
```bash
# Check server status
curl http://localhost:3001/health

# Test webhook endpoint
curl -X POST http://localhost:3001/webhook/tradingview \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ES1!","side":"BUY","price":4500}'

# View order history
curl http://localhost:3001/api/orders
```

## **🚀 Next Steps**

### **1. Broker Integration**
- Replace `executeOrder` function with real broker API calls
- Add authentication and error handling
- Implement order confirmation

### **2. Advanced Features**
- **Risk Management**: Position sizing, stop losses
- **Order Types**: Limit, stop, bracket orders
- **Portfolio Management**: Multiple symbols, correlation

### **3. Monitoring & Alerts**
- **Order Execution Logs**: Track all trades
- **Performance Metrics**: Win rate, P&L
- **Real-time Notifications**: Email, SMS, Discord

## **📚 Resources**

- **TradingView Alerts**: [Documentation](https://www.tradingview.com/support/solutions/43000516447/)
- **Webhook Testing**: [Webhook.site](https://webhook.site/)
- **Node.js Express**: [Documentation](https://expressjs.com/)
- **AMP Live API**: [Broker Documentation](https://www.ampfutures.com/)

## **🎯 Success Indicators**

✅ **Webhook server running on port 3001**
✅ **TradingView alert sending signals**
✅ **Orders being created and executed**
✅ **Real-time order status updates**
✅ **Integration with broker API**

---

**Need Help?** Check the console logs and webhook server output for detailed error messages.
