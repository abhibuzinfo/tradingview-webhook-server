const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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

// Execute order (simulate broker integration)
async function executeOrder(order) {
    try {
        console.log(`🔄 Executing order ${order.id}: ${order.side} ${order.quantity} ${order.symbol}`);
        
        // Simulate order execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful execution
        order.status = 'Filled';
        order.executionPrice = order.price;
        order.executionTime = new Date().toISOString();
        order.broker = order.broker || 'AMP Live';
        
        // Move to order history
        orderHistory.push(order);
        pendingOrders = pendingOrders.filter(o => o.id !== order.id);
        
        console.log(`✅ Order ${order.id} executed successfully`);
        
        // Here you would integrate with your actual broker API
        // await brokerAPI.placeOrder(order);
        
    } catch (error) {
        console.error(`❌ Order ${order.id} execution failed:`, error);
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
