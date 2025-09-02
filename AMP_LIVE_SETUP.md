# 🚀 AMP Live Integration Setup Guide

## **📋 Prerequisites**

### **1. AMP Live Account Setup**
- [ ] Sign up at [AMP Live](https://www.ampletrader.com/)
- [ ] Complete account verification
- [ ] Request API access from support
- [ ] Get paper trading credentials

### **2. Required Credentials**
- [ ] **API Key**: Your unique API identifier
- [ ] **API Secret**: Your API authentication secret
- [ ] **Account ID**: Your AMP Live account number
- [ ] **Paper Trading URL**: Test environment endpoint

## **🔧 Environment Variables Setup**

### **In Render Dashboard:**
1. Go to your webhook service
2. Click **"Environment"** tab
3. Add these variables:

```bash
AMP_LIVE_API_KEY=your_api_key_here
AMP_LIVE_SECRET=your_api_secret_here
AMP_LIVE_ACCOUNT_ID=your_account_id_here
AMP_LIVE_PAPER_URL=https://paper-api.ampletrader.com
NODE_ENV=production
```

### **Local Development (.env file):**
```bash
AMP_LIVE_API_KEY=your_api_key_here
AMP_LIVE_SECRET=your_api_secret_here
AMP_LIVE_ACCOUNT_ID=your_account_id_here
AMP_LIVE_PAPER_URL=https://paper-api.ampletrader.com
NODE_ENV=development
```

## **🧪 Testing Your Integration**

### **Step 1: Test Health Check**
```bash
curl https://your-app-name.onrender.com/health
```

### **Step 2: Test Paper Trading Order**
```bash
curl -X POST https://your-app-name.onrender.com/webhook/tradingview \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES1!",
    "side": "BUY",
    "price": "4500.00",
    "quantity": "1",
    "strategy": "Paper Trading Test",
    "stopLoss": "4490.00",
    "takeProfit": "4510.00"
  }'
```

### **Step 3: Check Order Status**
```bash
curl https://your-app-name.onrender.com/api/orders
```

## **📊 Expected Responses**

### **Successful Order Submission:**
```json
{
  "success": true,
  "message": "Order received and queued for execution",
  "orderId": 1756782853585
}
```

### **Order Status Response:**
```json
{
  "success": true,
  "pending": 0,
  "total": 1,
  "orders": [
    {
      "id": 1756782853585,
      "symbol": "ES1!",
      "side": "BUY",
      "quantity": 1,
      "price": 4500.00,
      "status": "Submitted",
      "broker": "AMP Live",
      "ampLiveOrderId": "amp_12345",
      "message": "Order submitted to AMP Live"
    }
  ]
}
```

## **🔒 Security Best Practices**

### **API Key Management:**
- [ ] Never commit API keys to Git
- [ ] Use environment variables
- [ ] Rotate keys regularly
- [ ] Monitor API usage

### **Risk Management:**
- [ ] Start with paper trading
- [ ] Set position size limits
- [ ] Use stop losses
- [ ] Monitor daily P&L

## **📈 TradingView Alert Setup**

### **Alert Configuration:**
1. **Symbol**: `ES1!` (E-mini S&P 500)
2. **Condition**: Price crosses above/below level
3. **Action**: Webhook URL
4. **URL**: `https://your-app-name.onrender.com/webhook/tradingview`

### **Alert Message Format:**
```json
{
  "symbol": "ES1!",
  "side": "BUY",
  "price": "4500.00",
  "quantity": "1",
  "strategy": "Breakout Strategy",
  "stopLoss": "4490.00",
  "takeProfit": "4510.00"
}
```

## **🚨 Troubleshooting**

### **Common Issues:**

#### **1. "AMP Live credentials not found"**
- Check environment variables in Render
- Verify API key and secret are correct
- Ensure variables are added to the right service

#### **2. "AMP Live API error: 401 Unauthorized"**
- Verify API key and secret
- Check account permissions
- Ensure account is active

#### **3. "AMP Live API error: 400 Bad Request"**
- Check order format
- Verify symbol is valid
- Ensure quantity is within limits

#### **4. Orders falling back to simulation**
- Check AMP Live API status
- Verify network connectivity
- Review server logs in Render

### **Debug Commands:**
```bash
# Check server logs
curl https://your-app-name.onrender.com/health

# Test order submission
curl -X POST https://your-app-name.onrender.com/webhook/tradingview \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ES1!","side":"BUY","price":4500,"quantity":1}'

# View all orders
curl https://your-app-name.onrender.com/api/orders
```

## **📱 Monitoring & Alerts**

### **Render Dashboard:**
- [ ] Monitor service health
- [ ] Check deployment logs
- [ ] View environment variables
- [ ] Monitor resource usage

### **Trading Dashboard:**
- [ ] Track order status
- [ ] Monitor positions
- [ ] Review P&L
- [ ] Check risk metrics

## **🚀 Going Live**

### **Paper Trading Phase:**
- [ ] Test for 2-4 weeks
- [ ] Verify all order types work
- [ ] Test stop losses and take profits
- [ ] Monitor execution quality

### **Live Trading Checklist:**
- [ ] Switch to live API endpoints
- [ ] Update environment variables
- [ ] Reduce position sizes
- [ ] Enable real-time monitoring
- [ ] Set up alerts and notifications

## **💡 Pro Tips**

1. **Start Small**: Begin with 1 contract orders
2. **Monitor Logs**: Check Render logs regularly
3. **Test Thoroughly**: Use paper trading extensively
4. **Backup Plan**: Keep simulation as fallback
5. **Document Everything**: Record all configurations

---

**Happy Trading! 🎯📈**

For support, check:
- [AMP Live Documentation](https://www.ampletrader.com/api-docs)
- [Render Support](https://render.com/docs)
- [GitHub Issues](https://github.com/your-repo/issues)
