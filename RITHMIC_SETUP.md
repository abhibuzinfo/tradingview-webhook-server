# 🚀 Rithmic API Integration Setup Guide

## **📋 What is Rithmic API?**

**Rithmic API** is a professional-grade trading API that AMP Live uses for automated trading. It provides:
- ✅ **Real-time market data** feeds
- ✅ **Order execution** capabilities
- ✅ **Position management**
- ✅ **Risk controls**
- ✅ **Professional reliability**

## **💰 Cost Analysis:**

### **Monthly Costs:**
- **API Access**: $100/month
- **Per Contract Fee**: $0.10 per side
- **Example Scenarios**:
  - **1 contract/day**: ~$22/month total
  - **5 contracts/day**: ~$65/month total
  - **10 contracts/day**: ~$100/month total
  - **20+ contracts/day**: API pays for itself

### **Break-Even Analysis:**
- **Break-even**: ~100 contracts/month
- **Profitable at**: 150+ contracts/month
- **High volume**: 300+ contracts/month

## **🔧 Setup Process:**

### **Step 1: Contact AMP Live Support**
1. **Call**: 1-800-560-2730
2. **Email**: support@ampletrader.com
3. **Request**: "Rithmic API access for automated trading"
4. **Mention**: Account #201296

### **Step 2: Required Information**
- **Account Number**: 201296
- **Full Name** (as on account)
- **Email** (registered with account)
- **Phone Number** (for verification)
- **Purpose**: "Automated futures trading with webhook integration"

### **Step 3: Account Verification**
They may require:
- Identity verification
- Additional agreements
- Risk assessment
- API usage training

## **🔑 Environment Variables Setup:**

### **In Render Dashboard:**
1. Go to your webhook service
2. Click **"Environment"** tab
3. Add these variables:

```bash
RITHMIC_USERNAME=your_rithmic_username
RITHMIC_PASSWORD=your_rithmic_password
RITHMIC_ACCOUNT_ID=201296
NODE_ENV=production
```

### **Local Development (.env file):**
```bash
RITHMIC_USERNAME=your_rithmic_username
RITHMIC_PASSWORD=your_rithmic_password
RITHMIC_ACCOUNT_ID=201296
NODE_ENV=development
```

## **🧪 Testing Your Integration:**

### **Step 1: Test Health Check**
```bash
curl https://your-app-name.onrender.com/health
```

### **Step 2: Test Rithmic Order**
```bash
curl -X POST https://your-app-name.onrender.com/webhook/tradingview \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ES1!",
    "side": "BUY",
    "price": "4500.00",
    "quantity": "1",
    "strategy": "Rithmic Test",
    "type": "MARKET"
  }'
```

### **Step 3: Check Order Status**
```bash
curl https://your-app-name.onrender.com/api/orders
```

## **📊 Expected Responses:**

### **With Rithmic API Connected:**
```json
{
  "success": true,
  "message": "Order received and queued for execution",
  "orderId": 1756782853585
}
```

### **Order Status (Rithmic):**
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
      "broker": "Rithmic/AMP Live",
      "rithmicOrderId": "rithmic_12345",
      "message": "Order submitted via Rithmic API"
    }
  ]
}
```

### **Without Rithmic API (Fallback):**
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
      "status": "Filled",
      "broker": "Simulated Broker (Rithmic Unavailable)",
      "message": "Order simulated successfully"
    }
  ]
}
```

## **🔒 Security Best Practices:**

### **API Credentials:**
- [ ] Never commit credentials to Git
- [ ] Use environment variables
- [ ] Rotate passwords regularly
- [ ] Monitor API usage

### **Risk Management:**
- [ ] Start with paper trading
- [ ] Set position size limits
- [ ] Use stop losses
- [ ] Monitor daily P&L

## **📈 TradingView Alert Setup:**

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
  "type": "MARKET"
}
```

## **🚨 Troubleshooting:**

### **Common Issues:**

#### **1. "Rithmic API not available"**
- Check environment variables in Render
- Verify Rithmic credentials
- Ensure Rithmic API is enabled on your account

#### **2. "Rithmic connection failed"**
- Verify username/password
- Check account permissions
- Ensure account is active

#### **3. "Order execution failed"**
- Check Rithmic API status
- Verify order format
- Check account balance/margin

#### **4. Orders falling back to simulation**
- Check Rithmic API connection
- Verify network connectivity
- Review server logs in Render

### **Debug Commands:**
```bash
# Check server logs
curl https://your-app-name.onrender.com/health

# Test order submission
curl -X POST https://your-app-name.onrender.com/webhook/tradingview \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ES1!","side":"BUY","price":4500,"quantity":1,"type":"MARKET"}'

# View all orders
curl https://your-app-name.onrender.com/api/orders
```

## **📱 Monitoring & Alerts:**

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

## **🚀 Going Live:**

### **Paper Trading Phase:**
- [ ] Test for 2-4 weeks
- [ ] Verify all order types work
- [ ] Test stop losses and take profits
- [ ] Monitor execution quality

### **Live Trading Checklist:**
- [ ] Switch to live Rithmic environment
- [ ] Update environment variables
- [ ] Reduce position sizes
- [ ] Enable real-time monitoring
- [ ] Set up alerts and notifications

## **💡 Pro Tips:**

1. **Start Small**: Begin with 1 contract orders
2. **Monitor Logs**: Check Render logs regularly
3. **Test Thoroughly**: Use paper trading extensively
4. **Backup Plan**: Keep simulation as fallback
5. **Document Everything**: Record all configurations

## **📞 Support Contacts:**

- **AMP Live Support**: 1-800-560-2730
- **AMP Live Email**: support@ampletrader.com
- **Render Support**: [Render.com/help](https://render.com/help)
- **GitHub Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Happy Trading! 🎯📈**

**Your automated trading system is now enterprise-ready with Rithmic API integration!**
