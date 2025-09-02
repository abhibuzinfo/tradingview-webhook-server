const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const RithmicAPI = require('./rithmic-api-integration');

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

// Initialize Rithmic API
let rithmicAPI = null;

// Initialize Rithmic API if credentials are available
function initializeRithmicAPI() {
    if (process.env.RITHMIC_USERNAME && process.env.RITHMIC_PASSWORD && process.env.RITHMIC_ACCOUNT_ID) {
        console.log('🔌 Initializing Rithmic API...');
        
        rithmicAPI = new RithmicAPI({
            username: process.env.RITHMIC_USERNAME,
            password: process.env.RITHMIC_PASSWORD,
            accountId: process.env.RITHMIC_ACCOUNT_ID,
            environment: process.env.NODE_ENV === 'production' ? 'live' : 'paper'
        });
        
        // Connect to Rithmic
        rithmicAPI.connect().then(connected => {
            if (connected) {
                console.log('✅ Rithmic API connected successfully');
            } else {
                console.log('⚠️ Rithmic API connection failed, falling back to simulation');
            }
        }).catch(error => {
            console.error('❌ Rithmic API connection error:', error);
        });
        
        // Set up event listeners
        rithmicAPI.on('orderPlaced', (order) => {
            console.log('📊 Order placed via Rithmic:', order);
        });
        
        rithmicAPI.on('orderError', (error) => {
            console.error('❌ Rithmic order error:', error);
        });
        
    } else {
        console.log('⚠️ Rithmic credentials not found, using simulation mode');
    }
}

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

// Execute order via Rithmic API (AMP Live)
async function executeOrder(order) {
    try {
        console.log(`🔄 Executing order ${order.id}: ${order.side} ${order.quantity} ${order.symbol}`);
        
        // Check if Rithmic API is available and connected
        if (rithmicAPI && rithmicAPI.connected) {
            console.log('📤 Executing order via Rithmic API...');
            
            try {
                // Execute order via Rithmic
                const rithmicOrder = await rithmicAPI.placeOrder({
                    symbol: order.symbol,
                    side: order.side,
                    quantity: order.quantity,
                    type: order.type || 'MARKET',
                    price: order.price
                });
                
                // Update order status
                order.status = 'Submitted';
                order.executionPrice = order.price;
                order.executionTime = new Date().toISOString();
                order.broker = 'Rithmic/AMP Live';
                order.rithmicOrderId = rithmicOrder.rithmicOrderId;
                order.message = 'Order submitted via Rithmic API';
                
                // Move to order history
                orderHistory.push(order);
                pendingOrders = pendingOrders.filter(o => o.id !== order.id);
                
                console.log(`✅ Order ${order.id} submitted via Rithmic successfully`);
                return;
                
            } catch (rithmicError) {
                console.error('❌ Rithmic order execution failed:', rithmicError);
                console.log('🔄 Falling back to simulation due to Rithmic error');
            }
        } else {
            console.log('⚠️ Rithmic API not available, using simulation mode');
        }
        
        // Fallback to simulation
        await simulateOrderExecution(order);
        
    } catch (error) {
        console.error(`❌ Order execution failed:`, error);
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
    
    // Initialize Rithmic API after server starts
    initializeRithmicAPI();
});

module.exports = app;
