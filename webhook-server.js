const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// For Node.js versions < 18, uncomment the next line:
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Render uses port 10000 by default
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${PORT}`);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store pending orders
let pendingOrders = [];
let orderHistory = [];

// TradingView Webhook Endpoint
app.post('/webhook/tradingview', (req, res) => {
    try {
        console.log('📡 TradingView Webhook Received:', req.body);
        
        const signal = req.body;
        
        // Validate TradingView signal
        if (!signal.symbol || !signal.side || !signal.price) {
            console.error('❌ Invalid signal format');
            return res.status(400).json({ error: 'Invalid signal format' });
        }
        
        // Create order from signal
        const order = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            symbol: signal.symbol,
            side: signal.side.toUpperCase(),
            price: parseFloat(signal.price),
            quantity: parseInt(signal.quantity) || 1,
            type: signal.orderType || 'market',
            status: 'Pending',
            source: 'TradingView Webhook',
            strategy: signal.strategy || 'Unknown',
            timeframe: signal.timeframe || 'Unknown'
        };
        
        // Add to pending orders
        pendingOrders.push(order);
        
        // Execute order
        executeOrder(order);
        
        console.log('✅ Order created from webhook:', order);
        res.json({ 
            success: true, 
            message: 'Order received and queued for execution',
            orderId: order.id
        });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manual Order Execution Endpoint
app.post('/api/execute-order', (req, res) => {
    try {
        console.log('🚀 Manual Order Execution Request:', req.body);
        
        const orderData = req.body;
        
        // Validate order data
        if (!orderData.symbol || !orderData.side || !orderData.quantity) {
            return res.status(400).json({ error: 'Missing required order fields' });
        }
        
        // Create order
        const order = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            symbol: orderData.symbol,
            side: orderData.side.toUpperCase(),
            price: parseFloat(orderData.price) || 0,
            quantity: parseInt(orderData.quantity),
            type: orderData.type || 'market',
            status: 'Pending',
            source: 'Manual API',
            broker: orderData.broker || 'Unknown'
        };
        
        // Add to pending orders
        pendingOrders.push(order);
        
        // Execute order
        executeOrder(order);
        
        console.log('✅ Manual order created:', order);
        res.json({ 
            success: true, 
            message: 'Order queued for execution',
            orderId: order.id,
            executionPrice: order.price,
            executionTime: order.timestamp
        });
        
    } catch (error) {
        console.error('❌ Manual order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Execute order via AMP Live API
async function executeOrder(order) {
    try {
        console.log(`🔄 Executing order ${order.id}: ${order.side} ${order.quantity} ${order.symbol}`);
        
        // Check if we have AMP Live credentials
        if (!process.env.AMP_LIVE_API_KEY || !process.env.AMP_LIVE_SECRET) {
            console.log('⚠️ AMP Live credentials not found, falling back to simulation');
            return await simulateOrderExecution(order);
        }
        
        // AMP Live API endpoint (paper trading)
        const apiUrl = process.env.AMP_LIVE_PAPER_URL || 'https://paper-api.ampletrader.com';
        
        // Prepare order for AMP Live
        const ampOrder = {
            symbol: order.symbol,
            side: order.side.toUpperCase(),
            quantity: parseInt(order.quantity),
            orderType: order.type.toUpperCase(),
            price: parseFloat(order.price),
            accountId: process.env.AMP_LIVE_ACCOUNT_ID,
            timeInForce: 'DAY'
        };
        
        // Add stop loss and take profit if provided
        if (order.stopLoss) {
            ampOrder.stopLoss = parseFloat(order.stopLoss);
        }
        if (order.takeProfit) {
            ampOrder.takeProfit = parseFloat(order.takeProfit);
        }
        
        console.log(`📤 Sending order to AMP Live:`, ampOrder);
        
        // Execute order via AMP Live API
        const response = await fetch(`${apiUrl}/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AMP_LIVE_API_KEY}`,
                'Content-Type': 'application/json',
                'X-API-Secret': process.env.AMP_LIVE_SECRET
            },
            body: JSON.stringify(ampOrder)
        });
        
        if (!response.ok) {
            throw new Error(`AMP Live API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`✅ AMP Live order executed successfully:`, result);
        
        // Update order status
        order.status = 'Submitted';
        order.executionPrice = order.price;
        order.executionTime = new Date().toISOString();
        order.broker = 'AMP Live';
        order.ampLiveOrderId = result.orderId;
        order.message = 'Order submitted to AMP Live';
        
        // Move to order history
        orderHistory.push(order);
        pendingOrders = pendingOrders.filter(o => o.id !== order.id);
        
        console.log(`✅ Order ${order.id} submitted to AMP Live successfully`);
        
    } catch (error) {
        console.error(`❌ AMP Live order execution failed:`, error);
        
        // Fallback to simulation if AMP Live fails
        console.log('🔄 Falling back to simulated execution');
        await simulateOrderExecution(order);
    }
}

// Fallback simulation function
async function simulateOrderExecution(order) {
    try {
        console.log(`📊 Simulating order execution for ${order.symbol}`);
        
        // Simulate order execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful execution
        order.status = 'Filled';
        order.executionPrice = order.price;
        order.executionTime = new Date().toISOString();
        order.broker = 'Simulated Broker (AMP Live Unavailable)';
        
        // Move to order history
        pendingOrders = pendingOrders.filter(o => o.id !== order.id);
        orderHistory.push(order);
        
        console.log(`✅ Order ${order.id} simulated successfully`);
        
    } catch (error) {
        console.error(`❌ Simulation failed for order ${order.id}:`, error);
        order.status = 'Failed';
        order.error = error.message;
    }
}

// Get order status
app.get('/api/orders', (req, res) => {
    try {
        const allOrders = [...pendingOrders, ...orderHistory];
        res.json({
            success: true,
            pending: pendingOrders.length,
            total: allOrders.length,
            orders: allOrders
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get specific order
app.get('/api/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const allOrders = [...pendingOrders, ...orderHistory];
        const order = allOrders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        pendingOrders: pendingOrders.length,
        totalOrders: orderHistory.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Webhook Server running on port ${PORT}`);
    console.log(`📡 TradingView Webhook: http://localhost:${PORT}/webhook/tradingview`);
    console.log(`🔧 Manual Orders: http://localhost:${PORT}/api/execute-order`);
    console.log(`📊 Order Status: http://localhost:${PORT}/api/orders`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
