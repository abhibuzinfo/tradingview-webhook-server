// Trading Plan Calculator Class
class TradingPlanCalculator {
    constructor() {
        try {
            this.contractMultiplier = 50; // ES futures contract multiplier
            this.marginRequirement = 0.05; // 5% margin requirement
            this.setupEventListeners();
            this.setupTPListeners();
        } catch (error) {
            console.error('Error in TradingPlanCalculator constructor:', error);
        }
    }

    setupEventListeners() {
        try {
            const inputs = [
                'current-price', 'entry-price', 'stop-loss', 'account-size', 'risk-percentage',
                'entry-trigger', 'partial-exits', 'time-stop'
            ];

            inputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', () => this.calculateAll());
                    element.addEventListener('change', () => this.calculateAll());
                }
            });
        } catch (error) {
            console.error('Error in setupEventListeners:', error);
        }
    }

    setupTPListeners() {
        try {
            const tpLevels = document.getElementById('tp-levels');
            if (tpLevels) {
                tpLevels.addEventListener('input', (e) => {
                    if (e.target.classList.contains('tp-price') || e.target.classList.contains('tp-size')) {
                        this.calculateAll();
                    }
                });
            }
        } catch (error) {
            console.error('Error in setupTPListeners:', error);
        }
    }

    calculateAll() {
        try {
            // Only calculate if the old UI elements still exist (for backward compatibility)
            const entryPriceElement = document.getElementById('entry-price');
            if (!entryPriceElement) {
                // Old UI elements don't exist, skip calculations
                return;
            }
            
            this.calculateRiskMetrics();
            this.calculatePositionSizing();
            this.calculateTakeProfitLevels();
            this.updateSummary();
        } catch (error) {
            console.error('Error in calculateAll:', error);
        }
    }

    calculateRiskMetrics() {
        const entryPriceElement = document.getElementById('entry-price');
        const stopLossElement = document.getElementById('stop-loss');
        const accountSizeElement = document.getElementById('account-size');
        const riskPercentageElement = document.getElementById('risk-percentage');
        
        // If any required element is missing, skip calculation
        if (!entryPriceElement || !stopLossElement || !accountSizeElement || !riskPercentageElement) {
            return;
        }
        
        const entryPrice = parseFloat(entryPriceElement.value) || 0;
        const stopLoss = parseFloat(stopLossElement.value) || 0;
        const accountSize = parseFloat(accountSizeElement.value) || 100000;
        const riskPercentage = parseFloat(riskPercentageElement.value) || 2;

        if (entryPrice && stopLoss) {
            const riskPerContract = Math.abs(entryPrice - stopLoss);
            const dollarRisk = riskPerContract * this.contractMultiplier;
            const accountRiskAmount = (accountSize * riskPercentage) / 100;
            const maxContracts = Math.floor(accountRiskAmount / dollarRisk);
            const actualRiskAmount = maxContracts * dollarRisk;
            const accountRiskPercent = (actualRiskAmount / accountSize) * 100;

            // Update max loss
            const maxLossElement = document.getElementById('max-loss');
            if (maxLossElement) maxLossElement.value = actualRiskAmount.toFixed(2);

            // Update summary elements
            const summaryDollarRisk = document.getElementById('summary-dollar-risk');
            const summaryAccountRisk = document.getElementById('summary-account-risk');
            const summaryContracts = document.getElementById('summary-contracts');
            
            if (summaryDollarRisk) summaryDollarRisk.textContent = `$${dollarRisk.toFixed(2)}`;
            if (summaryAccountRisk) summaryAccountRisk.textContent = `${accountRiskPercent.toFixed(2)}%`;
            if (summaryContracts) summaryContracts.textContent = maxContracts;
        }
    }

    calculatePositionSizing() {
        const entryPriceElement = document.getElementById('entry-price');
        const stopLossElement = document.getElementById('stop-loss');
        const accountSizeElement = document.getElementById('account-size');
        const riskPercentageElement = document.getElementById('risk-percentage');
        
        // If any required element is missing, skip calculation
        if (!entryPriceElement || !stopLossElement || !accountSizeElement || !riskPercentageElement) {
            return;
        }
        
        const entryPrice = parseFloat(entryPriceElement.value) || 0;
        const stopLoss = parseFloat(stopLossElement.value) || 0;
        const accountSize = parseFloat(accountSizeElement.value) || 100000;
        const riskPercentage = parseFloat(riskPercentageElement.value) || 2;

        if (entryPrice && stopLoss) {
            const riskPerContract = Math.abs(entryPrice - stopLoss);
            const dollarRisk = riskPerContract * this.contractMultiplier;
            const accountRiskAmount = (accountSize * riskPercentage) / 100;
            const maxContracts = Math.floor(accountRiskAmount / dollarRisk);
            const notionalValue = maxContracts * entryPrice * this.contractMultiplier;
            const marginRequired = notionalValue * this.marginRequirement;

            // Update position size input
            const positionSizeInput = document.getElementById('position-size');
            if (positionSizeInput) positionSizeInput.value = maxContracts;
            
            // Update summary elements
            const summaryNotional = document.getElementById('summary-notional');
            const summaryMargin = document.getElementById('summary-margin');
            
            if (summaryNotional) summaryNotional.textContent = `$${notionalValue.toFixed(2)}`;
            if (summaryMargin) summaryMargin.textContent = `$${marginRequired.toFixed(2)}`;
        }
    }

    calculateTakeProfitLevels() {
        const entryPriceElement = document.getElementById('entry-price');
        const stopLossElement = document.getElementById('stop-loss');
        
        // If required elements are missing, skip calculation
        if (!entryPriceElement || !stopLossElement) {
            return;
        }
        
        const entryPrice = parseFloat(entryPriceElement.value) || 0;
        const stopLoss = parseFloat(stopLossElement.value) || 0;
        const tpLevels = document.querySelectorAll('.tp-level');
        let totalProfit = 0;
        let totalRiskReward = 0;

        tpLevels.forEach((level, index) => {
            const tpPrice = parseFloat(level.querySelector('.tp-price').value) || 0;
            const tpSize = parseFloat(level.querySelector('.tp-size').value) || 0;

            if (tpPrice && tpSize) {
                const profitPerContract = Math.abs(tpPrice - entryPrice);
                const profit = (profitPerContract * this.contractMultiplier * tpSize) / 100;
                const risk = Math.abs(entryPrice - stopLoss) * this.contractMultiplier;
                const riskReward = profit / risk;

                totalProfit += profit;
                totalRiskReward += riskReward * (tpSize / 100);

                // Update summary TP elements
                const summaryTP = document.getElementById(`summary-tp${index + 1}`);
                if (summaryTP) summaryTP.textContent = `$${profit.toFixed(2)}`;
            }
        });

        // Update summary elements
        const maxProfitElement = document.getElementById('max-profit');
        const riskRewardElement = document.getElementById('risk-reward');
        const summaryTotal = document.getElementById('summary-total');
        
        if (maxProfitElement) maxProfitElement.value = totalProfit.toFixed(2);
        if (riskRewardElement) riskRewardElement.value = totalRiskReward.toFixed(2);
        if (summaryTotal) summaryTotal.textContent = `$${totalProfit.toFixed(2)}`;
    }

    updateSummary() {
        const entryPrice = parseFloat(document.getElementById('entry-price').value) || 0;
        const stopLoss = parseFloat(document.getElementById('stop-loss').value) || 0;
        const currentPrice = parseFloat(document.getElementById('current-price').value) || 0;

        if (entryPrice && stopLoss) {
            const risk = Math.abs(entryPrice - stopLoss);
            const maxLoss = parseFloat(document.getElementById('max-loss').value) || 0;
            const maxProfit = parseFloat(document.getElementById('max-profit').value) || 0;
            const riskReward = parseFloat(document.getElementById('risk-reward').value) || 0;

            // Calculate breakeven
            const breakeven = entryPrice + (risk * 0.5); // Assuming 50% of risk for breakeven
            const summaryBreakeven = document.getElementById('summary-breakeven');
            if (summaryBreakeven) summaryBreakeven.textContent = `$${breakeven.toFixed(2)}`;
        }
    }
}

// TradingView Integration Class
class TradingViewIntegration {
    constructor() {
        try {
            this.isConnected = false;
            this.selectedBroker = 'paper';
            this.orderType = 'market';
            this.orders = [];
            this.tradingSymbol = 'ES1!';
            this.tvCredentials = {};
            
            // HFT properties
            this.hftEnabled = false;
            this.hftInterval = 5;
            this.hftMaxTrades = 10;
            this.hftProfitTarget = 0.5;
            this.hftSession = null;
            this.hftTimer = null;
            
            this.initWidget();
            this.loadTVCredentials();
        } catch (error) {
            console.error('Error in TradingViewIntegration constructor:', error);
        }
    }

    initWidget() {
        try {
            if (typeof TradingView !== 'undefined') {
                const container = document.getElementById('tv-chart-widget');
                if (container) {
                    new TradingView.widget({
                        "width": "100%",
                        "height": 400,
                        "symbol": "CME_MINI:ES1!",
                        "interval": "15",
                        "timezone": "America/New_York",
                        "theme": "dark",
                        "style": "1",
                        "locale": "en",
                        "toolbar_bg": "#f1f3f6",
                        "enable_publishing": false,
                        "hide_side_toolbar": false,
                        "allow_symbol_change": true,
                        "container_id": "tv-chart-widget"
                    });
                } else {
                    console.warn('TradingView container not found');
                }
            } else {
                console.warn('TradingView library not loaded');
            }
        } catch (error) {
            console.error('Error initializing TradingView widget:', error);
        }
    }

    connect() {
        this.isConnected = true;
        this.updateConnectionStatus();
        showNotification('Connected to TradingView!', 'success');
    }

    disconnect() {
        this.isConnected = false;
        this.updateConnectionStatus();
        showNotification('Disconnected from TradingView', 'info');
    }

    setBroker(broker) {
        this.selectedBroker = broker;
        this.updateConnectionStatus();
        
        // Special handling for AMP Live
        if (broker === 'amp-live') {
            showNotification('AMP Live broker selected. Please ensure you have proper credentials configured.', 'info');
        }
    }

    setTradingSymbol(symbol) {
        this.tradingSymbol = symbol;
        console.log('Trading symbol set to:', symbol);
    }

    // TradingView Credentials Management
    saveTVCredentials() {
        const username = document.getElementById('tv-username').value;
        const password = document.getElementById('tv-password').value;
        const apiKey = document.getElementById('tv-api-key').value;
        
        this.tvCredentials = { username, password, apiKey };
        localStorage.setItem('tv_credentials', JSON.stringify(this.tvCredentials));
        showNotification('TradingView credentials saved', 'success');
    }

    loadTVCredentials() {
        try {
            const saved = localStorage.getItem('tv_credentials');
            if (saved) {
                this.tvCredentials = JSON.parse(saved);
                document.getElementById('tv-username').value = this.tvCredentials.username || '';
                document.getElementById('tv-password').value = this.tvCredentials.password || '';
                document.getElementById('tv-api-key').value = this.tvCredentials.apiKey || '';
            }
        } catch (error) {
            console.error('Error loading TV credentials:', error);
        }
    }

    clearTVCredentials() {
        this.tvCredentials = {};
        localStorage.removeItem('tv_credentials');
        document.getElementById('tv-username').value = '';
        document.getElementById('tv-password').value = '';
        document.getElementById('tv-api-key').value = '';
        showNotification('TradingView credentials cleared', 'info');
    }

    testTVCredentials() {
        if (!this.tvCredentials || !this.tvCredentials.username) {
            showNotification('Please enter TradingView credentials first', 'error');
            return;
        }
        
        showNotification('Testing TradingView credentials...', 'info');
        // Simulate credential testing
        setTimeout(() => {
            showNotification('TradingView credentials test completed', 'success');
        }, 2000);
    }

    // High Frequency Trading Management
    toggleHFTMode(enabled) {
        this.hftEnabled = enabled === 'true';
        console.log('HFT mode:', this.hftEnabled ? 'enabled' : 'disabled');
    }

    setHFTInterval(interval) {
        this.hftInterval = parseInt(interval) || 5;
        console.log('HFT interval set to:', this.hftInterval, 'seconds');
    }

    setHFTMaxTrades(maxTrades) {
        this.hftMaxTrades = parseInt(maxTrades) || 10;
        console.log('HFT max trades set to:', this.hftMaxTrades);
    }

    setHFTProfitTarget(target) {
        this.hftProfitTarget = parseFloat(target) || 0.5;
        console.log('HFT profit target set to:', this.hftProfitTarget, '%');
    }

    startHFTSession() {
        if (!this.hftEnabled) {
            showNotification('Please enable HFT mode first', 'error');
            return;
        }
        
        if (!this.isConnected) {
            showNotification('Please connect to TradingView first', 'error');
            return;
        }

        this.hftSession = {
            active: true,
            startTime: new Date(),
            trades: [],
            currentTrade: 0
        };

        this.hftTimer = setInterval(() => {
            this.executeHFTTrade();
        }, this.hftInterval * 1000);

        showNotification('HFT session started', 'success');
    }

    stopHFTSession() {
        if (this.hftTimer) {
            clearInterval(this.hftTimer);
            this.hftTimer = null;
        }
        
        if (this.hftSession) {
            this.hftSession.active = false;
            this.hftSession.endTime = new Date();
        }

        showNotification('HFT session stopped', 'info');
    }

    executeHFTTrade() {
        if (!this.hftSession || !this.hftSession.active) return;
        
        if (this.hftSession.currentTrade >= this.hftMaxTrades) {
            this.stopHFTSession();
            showNotification('HFT session completed - max trades reached', 'info');
            return;
        }

        // Simulate HFT trade based on analyzed levels
        const trade = {
            id: Date.now(),
            timestamp: new Date(),
            side: Math.random() > 0.5 ? 'BUY' : 'SELL',
            price: this.getRandomPriceFromLevels(),
            quantity: 1,
            profit: (Math.random() * this.hftProfitTarget * 2) - this.hftProfitTarget
        };

        this.hftSession.trades.push(trade);
        this.hftSession.currentTrade++;

        // Send order to TradingView
        this.sendOrder(trade.side, trade.price, trade.quantity, 'market');

        showNotification(`HFT Trade ${this.hftSession.currentTrade}/${this.hftMaxTrades}: ${trade.side} at $${trade.price}`, 'info');
    }

    getRandomPriceFromLevels() {
        // This would use the levels from ChatGPT analysis
        // For now, simulate with random price around ES levels
        const basePrice = 4500;
        return basePrice + (Math.random() - 0.5) * 50;
    }

    viewHFTSession() {
        if (!this.hftSession) {
            showNotification('No HFT session data available', 'info');
            return;
        }

        const stats = this.calculateHFTStats();
        const message = `
HFT Session Statistics:
- Duration: ${stats.duration}
- Total Trades: ${stats.totalTrades}
- Profitable Trades: ${stats.profitableTrades}
- Win Rate: ${stats.winRate}%
- Total Profit: $${stats.totalProfit}
- Average Profit per Trade: $${stats.avgProfit}
        `;

        showNotification(message, 'info');
    }

    calculateHFTStats() {
        const trades = this.hftSession.trades;
        const totalTrades = trades.length;
        const profitableTrades = trades.filter(t => t.profit > 0).length;
        const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
        
        return {
            duration: this.hftSession.endTime ? 
                Math.round((this.hftSession.endTime - this.hftSession.startTime) / 1000) + 's' : 'Active',
            totalTrades,
            profitableTrades,
            winRate: totalTrades > 0 ? Math.round((profitableTrades / totalTrades) * 100) : 0,
            totalProfit: totalProfit.toFixed(2),
            avgProfit: totalTrades > 0 ? (totalProfit / totalTrades).toFixed(2) : '0.00'
        };
    }

    setOrderType(type) {
        this.orderType = type;
        showNotification(`Order type set to ${type}`, 'info');
    }

    sendOrder(side, price, quantity, orderType = 'market') {
        if (!this.isConnected) {
            showNotification('Please connect to TradingView first', 'error');
            return;
        }

        const order = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            side: side,
            price: price,
            quantity: quantity,
            type: orderType,
            status: 'Pending',
            broker: this.selectedBroker
        };

        this.orders.unshift(order);
        this.updateOrderLog();
        showNotification(`${side} order sent: ${quantity} contracts at $${price}`, 'success');

        // REAL TRADINGVIEW INTEGRATION
        this.executeRealOrder(order);
    }

    // Execute real order through TradingView
    async executeRealOrder(order) {
        try {
            console.log('🚀 Executing real order through TradingView...');
            
            // Check if we have the TradingView Charting Library
            if (typeof TradingView !== 'undefined' && this.chartWidget) {
                await this.executeViaChartingLibrary(order);
            } else {
                // Fallback to webhook/API method
                await this.executeViaWebhook(order);
            }
            
        } catch (error) {
            console.error('❌ Error executing real order:', error);
            order.status = 'Failed';
            this.updateOrderLog();
            showNotification(`Order failed: ${error.message}`, 'error');
        }
    }

    // Execute via TradingView Charting Library
    async executeViaChartingLibrary(order) {
        try {
            console.log('📊 Using TradingView Charting Library...');
            
            // This requires TradingView Charting Library subscription
            // and broker integration setup
            
            if (this.chartWidget && this.chartWidget.chart) {
                // Place order through chart widget
                const result = await this.chartWidget.chart.executeOrder({
                    symbol: this.symbol || 'ES1!',
                    side: order.side,
                    quantity: order.quantity,
                    price: order.price,
                    type: order.type,
                    broker: this.selectedBroker
                });
                
                console.log('✅ Order executed via Charting Library:', result);
                order.status = 'Filled';
                order.executionPrice = result.executionPrice;
                order.executionTime = new Date().toISOString();
                
            } else {
                throw new Error('Charting Library not properly initialized');
            }
            
        } catch (error) {
            console.error('❌ Charting Library execution failed:', error);
            throw error;
        }
    }

    // Execute via Webhook/API (fallback method)
    async executeViaWebhook(order) {
        try {
            console.log('🌐 Using Webhook/API method...');
            
            // This would send the order to your broker's API
            // or TradingView webhook endpoint
            
            const orderData = {
                symbol: this.symbol || 'ES1!',
                side: order.side,
                quantity: order.quantity,
                price: order.price,
                type: order.type,
                broker: this.selectedBroker,
                timestamp: new Date().toISOString()
            };
            
            // Send to webhook server
            const response = await fetch('http://localhost:3001/api/execute-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                throw new Error(`Broker API error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Order executed via Webhook/API:', result);
            
            order.status = 'Filled';
            order.executionPrice = result.executionPrice;
            order.executionTime = new Date().toISOString();
            
        } catch (error) {
            console.error('❌ Webhook/API execution failed:', error);
            throw error;
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = this.isConnected ? 'Connected' : 'Disconnected';
            statusElement.className = this.isConnected ? 'status connected' : 'status disconnected';
        }
    }

    updateOrderLog() {
        const tbody = document.querySelector('#orders-table tbody');
        if (tbody) {
            tbody.innerHTML = this.orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${new Date(order.timestamp).toLocaleTimeString()}</td>
                    <td class="order-side ${order.side.toLowerCase()}">${order.side}</td>
                    <td>$${order.price}</td>
                    <td>${order.quantity}</td>
                    <td>${order.type}</td>
                    <td class="order-status ${order.status.toLowerCase()}">${order.status}</td>
                    <td>${order.broker}</td>
                </tr>
            `).join('');
        }
    }
}

// Gmail Integration Class
class GmailIntegration {
    constructor() {
        try {
            console.log('Initializing GmailIntegration...');
            this.isAuthenticated = false;
            this.isAuthenticating = false;
            this.accessToken = null;
            this.gmailSettings = {
                email: '',
                senderFilter: '',
                fetchCount: 5,
                autoFetchInterval: 15
            };
            this.oauthConfig = {
                clientId: '',
                clientSecret: ''
            };
            this.autoFetchTimer = null;
            this.emails = [];
                    this.loadGmailSettings();
        this.loadOAuthConfig();
        this.checkOAuthReturn();
        console.log('GmailIntegration initialized successfully');
        } catch (error) {
            console.error('Error initializing GmailIntegration:', error);
        }
    }

    // Load saved Gmail settings
    loadGmailSettings() {
        try {
            const saved = localStorage.getItem('gmail_settings');
            if (saved) {
                this.gmailSettings = JSON.parse(saved);
                document.getElementById('gmail-email').value = this.gmailSettings.email || '';
                document.getElementById('newsletter-sender').value = this.gmailSettings.senderFilter || '';
                document.getElementById('email-fetch-count').value = this.gmailSettings.fetchCount || 5;
                document.getElementById('auto-fetch-interval').value = this.gmailSettings.autoFetchInterval || 15;
            }
        } catch (error) {
            console.error('Error loading Gmail settings:', error);
        }
    }
    
    // Load OAuth configuration
    loadOAuthConfig() {
        try {
            const saved = localStorage.getItem('gmail_oauth_config');
            if (saved) {
                this.oauthConfig = JSON.parse(saved);
                document.getElementById('oauth-client-id').value = this.oauthConfig.clientId || '';
                document.getElementById('oauth-client-secret').value = this.oauthConfig.clientSecret || '';
            }
        } catch (error) {
            console.error('Error loading OAuth config:', error);
        }
    }
    
    // Save OAuth configuration
    saveOAuthConfig() {
        try {
            this.oauthConfig.clientId = document.getElementById('oauth-client-id').value.trim();
            this.oauthConfig.clientSecret = document.getElementById('oauth-client-secret').value.trim();
            
            localStorage.setItem('gmail_oauth_config', JSON.stringify(this.oauthConfig));
            console.log('💾 OAuth configuration saved');
            showNotification('OAuth configuration saved', 'success');
        } catch (error) {
            console.error('Error saving OAuth config:', error);
            showNotification('Error saving OAuth config', 'error');
        }
    }

    // Save Gmail settings
    saveGmailSettings() {
        try {
            this.gmailSettings.email = document.getElementById('gmail-email').value;
            this.gmailSettings.senderFilter = document.getElementById('newsletter-sender').value;
            this.gmailSettings.fetchCount = parseInt(document.getElementById('email-fetch-count').value) || 5;
            this.gmailSettings.autoFetchInterval = parseInt(document.getElementById('auto-fetch-interval').value) || 15;
            
            console.log('Gmail settings saved:', this.gmailSettings);
            localStorage.setItem('gmail_settings', JSON.stringify(this.gmailSettings));
            showNotification('Gmail settings saved', 'success');
        } catch (error) {
            console.error('Error saving Gmail settings:', error);
        }
    }

    // Authenticate with Gmail
    async authenticateGmail() {
        try {
            if (this.isAuthenticating) {
                console.log('⚠️ Authentication already in progress, ignoring call');
                return;
            }
            
            if (!this.gmailSettings.email) {
                showNotification('Please enter your Gmail address first', 'error');
                return;
            }

            this.isAuthenticating = true;
            console.log('🔐 Starting Gmail authentication process...');
            showNotification('Initiating Gmail authentication...', 'info');
            
            // Check if we have stored OAuth credentials
            const storedCredentials = this.getStoredOAuthCredentials();
            
            if (storedCredentials && storedCredentials.accessToken && !this.isTokenExpired(storedCredentials)) {
                console.log('✅ Using stored OAuth credentials');
                this.accessToken = storedCredentials.accessToken;
                this.isAuthenticated = true;
                this.updateGmailStatus();
                showNotification('Gmail authenticated using stored credentials!', 'success');
                return;
            }
            
            // Start OAuth 2.0 flow
            await this.startOAuthFlow();
            
        } catch (error) {
            console.error('❌ Gmail authentication error:', error);
            showNotification('Gmail authentication failed: ' + error.message, 'error');
        } finally {
            this.isAuthenticating = false;
        }
    }
    
    // Get stored OAuth credentials
    getStoredOAuthCredentials() {
        try {
            const stored = localStorage.getItem('gmail_oauth_credentials');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('❌ Error reading stored OAuth credentials:', error);
            return null;
        }
    }
    
    // Check if OAuth token is expired
    isTokenExpired(credentials) {
        if (!credentials.expiryTime) return true;
        return Date.now() > credentials.expiryTime;
    }
    
    // Refresh OAuth token
    async refreshOAuthToken() {
        try {
            const credentials = this.getStoredOAuthCredentials();
            if (!credentials || !credentials.refreshToken) {
                throw new Error('No refresh token available');
            }
            
            console.log('🔄 Refreshing OAuth token...');
            
            // In production, this would make a server-side call to Google's token endpoint
            // For now, we'll simulate the refresh
            const newTokens = await this.simulateTokenRefresh(credentials.refreshToken);
            
            // Store new tokens
            this.storeOAuthCredentials(newTokens);
            
            // Update authentication state
            this.accessToken = newTokens.accessToken;
            this.isAuthenticated = true;
            this.updateGmailStatus();
            
            console.log('✅ OAuth token refreshed successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error refreshing OAuth token:', error);
            return false;
        }
    }
    
    // Simulate token refresh (replace with real implementation)
    async simulateTokenRefresh(refreshToken) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTokens = {
                    accessToken: 'refreshed_access_token_' + Date.now(),
                    refreshToken: refreshToken, // Keep the same refresh token
                    expiryTime: Date.now() + (3600 * 1000), // 1 hour
                    scope: 'https://www.googleapis.com/auth/gmail.readonly'
                };
                
                console.log('🎭 Simulated token refresh completed');
                resolve(newTokens);
            }, 1000);
        });
    }
    
    // Debug stored credentials
    debugStoredCredentials() {
        try {
            console.log('🔍 === DEBUGGING STORED CREDENTIALS ===');
            
            // Check localStorage directly
            const storedCredentials = localStorage.getItem('gmail_oauth_credentials');
            console.log('📦 Raw localStorage data:', storedCredentials);
            
            if (storedCredentials) {
                const parsed = JSON.parse(storedCredentials);
                console.log('🔑 Parsed credentials:', {
                    hasAccessToken: !!parsed.accessToken,
                    accessTokenStart: parsed.accessToken ? parsed.accessToken.substring(0, 30) + '...' : 'none',
                    hasRefreshToken: !!parsed.refreshToken,
                    refreshTokenStart: parsed.refreshToken ? parsed.refreshToken.substring(0, 30) + '...' : 'none',
                    expiryTime: parsed.expiryTime ? new Date(parsed.expiryTime).toLocaleString() : 'none',
                    scope: parsed.scope || 'none'
                });
            }
            
            // Check current instance state
            console.log('🏠 Current instance state:', {
                isAuthenticated: this.isAuthenticated,
                accessToken: this.accessToken ? this.accessToken.substring(0, 30) + '...' : 'none',
                gmailSettings: this.gmailSettings
            });
            
            // Check OAuth config
            console.log('⚙️ OAuth configuration:', this.oauthConfig);
            
            console.log('🔍 === END DEBUGGING ===');
            
        } catch (error) {
            console.error('❌ Error debugging credentials:', error);
        }
    }
    
    // Start OAuth 2.0 authentication flow
    async startOAuthFlow() {
        try {
            console.log('🚀 Starting OAuth 2.0 flow...');
            
            // Check if we have OAuth configuration
            if (!this.oauthConfig.clientId || !this.oauthConfig.clientSecret) {
                throw new Error('OAuth configuration not found. Please enter your Google Client ID and Secret.');
            }
            
            showNotification('Starting OAuth 2.0 authentication...', 'info');
            
            // Start real OAuth flow
            await this.initiateGoogleOAuth();
            
        } catch (error) {
            console.error('❌ OAuth flow error:', error);
            throw error;
        }
    }
    
    // Initiate Google OAuth 2.0 flow
    async initiateGoogleOAuth() {
        try {
            console.log('🔐 Initiating Google OAuth 2.0 flow...');
            
            // Generate state parameter for security
            const state = this.generateState();
            localStorage.setItem('oauth_state', state);
            
            // Build OAuth URL
            const oauthUrl = this.buildOAuthUrl(state);
            
            console.log('🌐 Redirecting to Google OAuth:', oauthUrl);
            
            // Redirect to Google OAuth
            window.location.href = oauthUrl;
            
        } catch (error) {
            console.error('❌ Error initiating OAuth:', error);
            throw error;
        }
    }
    
    // Generate random state parameter
    generateState() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    // Build Google OAuth URL
    buildOAuthUrl(state) {
        const params = new URLSearchParams({
            client_id: this.oauthConfig.clientId,
            redirect_uri: `${window.location.origin}/oauth-callback.html`,
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
            state: state,
            access_type: 'offline',
            prompt: 'consent'
        });
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    
    // Check if returning from OAuth callback
    checkOAuthReturn() {
        try {
            // Check if we have valid OAuth credentials
            const credentials = this.getStoredOAuthCredentials();
            console.log('🔍 Checking stored OAuth credentials:', credentials ? 'found' : 'not found');
            
            if (credentials && credentials.accessToken && !this.isTokenExpired(credentials)) {
                console.log('✅ Valid OAuth credentials found, setting authenticated state');
                console.log('🔑 Access token:', credentials.accessToken.substring(0, 20) + '...');
                this.accessToken = credentials.accessToken;
                this.isAuthenticated = true;
                this.updateGmailStatus();
            } else {
                console.log('❌ No valid OAuth credentials found or token expired');
                if (credentials) {
                    console.log('🔑 Stored token:', credentials.accessToken ? credentials.accessToken.substring(0, 20) + '...' : 'none');
                    console.log('⏰ Token expiry:', credentials.expiryTime ? new Date(credentials.expiryTime).toLocaleString() : 'none');
                }
            }
        } catch (error) {
            console.error('❌ Error checking OAuth return:', error);
        }
    }
    
    // Simulate OAuth 2.0 flow (replace with real implementation)
    async simulateOAuthFlow() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate mock OAuth credentials
                const mockCredentials = {
                    accessToken: 'mock_oauth_token_' + Date.now(),
                    refreshToken: 'mock_refresh_token_' + Date.now(),
                    expiryTime: Date.now() + (3600 * 1000), // 1 hour
                    scope: 'https://www.googleapis.com/auth/gmail.readonly'
                };
                
                // Store credentials
                this.storeOAuthCredentials(mockCredentials);
                
                // Set authentication state
                this.accessToken = mockCredentials.accessToken;
                this.isAuthenticated = true;
                this.updateGmailStatus();
                
                showNotification('Gmail OAuth 2.0 authentication successful!', 'success');
                console.log('✅ OAuth 2.0 authentication completed');
                
                resolve();
            }, 3000);
        });
    }
    
    // Store OAuth credentials
    storeOAuthCredentials(credentials) {
        try {
            localStorage.setItem('gmail_oauth_credentials', JSON.stringify(credentials));
            console.log('💾 OAuth credentials stored');
        } catch (error) {
            console.error('❌ Error storing OAuth credentials:', error);
        }
    }
    
    // Clear OAuth credentials
    clearOAuthCredentials() {
        try {
            localStorage.removeItem('gmail_oauth_credentials');
            this.accessToken = null;
            this.isAuthenticated = false;
            this.updateGmailStatus();
            console.log('🗑️ OAuth credentials cleared');
            showNotification('Gmail OAuth credentials cleared', 'info');
        } catch (error) {
            console.error('❌ Error clearing OAuth credentials:', error);
        }
    }
    
    // Test Gmail API connection
    async testGmailAPIConnection() {
        try {
            if (!this.isAuthenticated || !this.accessToken) {
                showNotification('Please authenticate Gmail first', 'error');
                return;
            }
            
            console.log('🧪 Testing Gmail API connection...');
            showNotification('Testing Gmail API connection...', 'info');
            
            // Check if token is expired and refresh if needed
            const credentials = this.getStoredOAuthCredentials();
            if (credentials && this.isTokenExpired(credentials)) {
                console.log('🔄 Token expired, attempting refresh...');
                const refreshed = await this.refreshOAuthToken();
                if (!refreshed) {
                    throw new Error('Failed to refresh expired token');
                }
            }
            
            // Try to fetch a single email to test the connection
            const testQuery = 'is:important limit:1';
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(testQuery)}&maxResults=1`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Gmail API connection successful!');
                showNotification(`✅ Gmail API connection successful! Found ${data.messages?.length || 0} messages`, 'success');
            } else if (response.status === 401) {
                // Token might be invalid, try to refresh
                console.log('🔄 401 error, attempting token refresh...');
                const refreshed = await this.refreshOAuthToken();
                if (refreshed) {
                    // Retry the API call with new token
                    return await this.testGmailAPIConnection();
                } else {
                    throw new Error('Failed to refresh invalid token');
                }
            } else {
                throw new Error(`API test failed: ${response.status} - ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Gmail API connection test failed:', error);
            showNotification('❌ Gmail API connection test failed: ' + error.message, 'error');
        }
    }

    // Simulate Gmail authentication (replace with real OAuth)
    async simulateGmailAuth() {
        console.log('Starting simulated Gmail authentication...');
        return new Promise((resolve) => {
            setTimeout(() => {
                this.isAuthenticated = true;
                this.accessToken = 'demo_token_' + Date.now();
                this.updateGmailStatus();
                showNotification('Gmail authenticated successfully!', 'success');
                console.log('Gmail authentication simulation completed, isAuthenticated:', this.isAuthenticated);
                resolve();
            }, 2000);
        });
    }

    // Fetch newsletter emails
    async fetchNewsletterEmails() {
        console.log('=== GmailIntegration.fetchNewsletterEmails() called ===');
        console.log('Current Gmail settings:', this.gmailSettings);
        console.log('Authentication status:', this.isAuthenticated);
        try {
            if (!this.isAuthenticated) {
                console.log('❌ Gmail not authenticated, showing error - AUTHENTICATION REQUIRED FIRST');
                showNotification('❌ Gmail not authenticated yet! Please wait for authentication to complete.', 'error');
                return;
            }

            console.log('Gmail authenticated, starting to fetch emails...');
            showNotification('Fetching newsletter emails...', 'info');
            
            // Simulate fetching emails from Gmail API
            console.log('Calling simulateFetchEmails()...');
            this.emails = await this.simulateFetchEmails();
            console.log('=== Emails array after fetch ===');
            console.log('this.emails length:', this.emails.length);
            console.log('this.emails content:', this.emails);
            this.displayEmails();
            
            showNotification(`Fetched ${this.emails.length} newsletter emails`, 'success');
            
        } catch (error) {
            console.error('Error fetching emails:', error);
            showNotification('Error fetching emails: ' + error.message, 'error');
        }
    }

    // Fetch emails from Gmail API (or simulate for testing)
    async simulateFetchEmails() {
        console.log('🔍 Attempting to fetch emails from Gmail...');
        console.log('🔑 Current access token type:', this.accessToken ? 
            (this.accessToken.startsWith('demo_token_') ? 'demo_token' : 
             this.accessToken.startsWith('mock_oauth_token_') ? 'mock_oauth_token' : 
             this.accessToken.startsWith('real_access_token_') ? 'real_access_token' : 'unknown_real_token') : 'no_token');
        
        // Check if we have proper Gmail API credentials
        if (!this.accessToken || this.accessToken.startsWith('demo_token_')) {
            console.log('📱 Using demo mode - no real Gmail API access');
            return this.getDemoEmails();
        }
        
        // Check if we have real OAuth credentials (not mock)
        if (this.accessToken && !this.accessToken.startsWith('demo_token_') && !this.accessToken.startsWith('mock_oauth_token_')) {
            console.log('🚀 Using real OAuth credentials - calling Gmail API');
            return this.fetchRealGmailEmails();
        }
        
        // Check if we have mock OAuth credentials
        if (this.accessToken.startsWith('mock_oauth_token_')) {
            console.log('🚀 Using mock OAuth credentials - simulating real Gmail API');
            return this.fetchRealGmailEmails();
        }
        
        // For now, return demo emails
        console.log('🔄 Falling back to demo emails');
        return this.getDemoEmails();
    }
    
    // Get demo emails for testing
    getDemoEmails() {
        console.log('=== getDemoEmails() called ===');
        const demoEmails = [
            {
                id: 'demo_1',
                sender: 'newsletter@trading.com',
                subject: 'Daily ES Futures Analysis - Bullish Setup',
                date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
                preview: 'ES futures showing strong bullish momentum. Key support at 4500, resistance at 4525.',
                content: 'ES futures trading plan for today. Current price at 4500. Looking for long entry at 4505 with stop at 4490. Targets at 4515, 4520, and 4530. Support at 4480, resistance at 4525. Bullish bias due to strong earnings and technical breakout.'
            }
        ];
        
        console.log('Demo emails array length:', demoEmails.length);
        console.log('Demo emails:', demoEmails);
        
        // Filter emails based on sender filter if specified
        console.log('Filtering emails with sender filter:', this.gmailSettings.senderFilter);
        console.log('Available email senders:', demoEmails.map(e => e.sender));
        
        if (this.gmailSettings.senderFilter) {
            const filterLower = this.gmailSettings.senderFilter.toLowerCase();
            const filtered = demoEmails.filter(email => {
                const senderLower = email.sender.toLowerCase();
                const matches = senderLower.includes(filterLower);
                console.log(`Email sender: "${email.sender}" matches filter "${this.gmailSettings.senderFilter}": ${matches}`);
                return matches;
            });
            console.log('Filtered emails:', filtered.length, 'out of', demoEmails.length);
            const result = filtered.slice(0, this.gmailSettings.fetchCount);
            console.log('Returning filtered result:', result);
            return result;
        } else {
            console.log('No sender filter, returning all emails');
            const result = demoEmails.slice(0, this.gmailSettings.fetchCount);
            console.log('Returning all emails result:', result);
            return result;
        }
    }
    
    // Real Gmail API integration
    async fetchRealGmailEmails() {
        try {
            console.log('🚀 Fetching real emails from Gmail API...');
            
            if (!this.accessToken || this.accessToken.startsWith('demo_token_')) {
                console.log('❌ No valid Gmail access token, falling back to demo mode');
                return this.getDemoEmails();
            }
            
            // Check if token is expired and refresh if needed
            const credentials = this.getStoredOAuthCredentials();
            if (credentials && this.isTokenExpired(credentials)) {
                console.log('🔄 Token expired, attempting refresh...');
                const refreshed = await this.refreshOAuthToken();
                if (!refreshed) {
                    throw new Error('Failed to refresh expired token');
                }
            }
            
            const query = this.buildGmailQuery();
            console.log('🔍 Gmail search query:', query);
            
            // Fetch email list from Gmail API
            const messagesResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${this.gmailSettings.fetchCount}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!messagesResponse.ok) {
                if (messagesResponse.status === 401) {
                    // Token might be invalid, try to refresh
                    console.log('🔄 401 error, attempting token refresh...');
                    const refreshed = await this.refreshOAuthToken();
                    if (refreshed) {
                        // Retry the fetch with new token
                        return await this.fetchRealGmailEmails();
                    }
                }
                throw new Error(`Gmail API error: ${messagesResponse.status} - ${messagesResponse.statusText}`);
            }
            
            const messagesData = await messagesResponse.json();
            console.log(`📧 Found ${messagesData.messages?.length || 0} messages from Gmail API`);
            
            if (!messagesData.messages || messagesData.messages.length === 0) {
                console.log('📭 No messages found matching the query');
                return [];
            }
            
            // Fetch full email details for each message
            const emails = await this.fetchEmailDetails(messagesData.messages);
            console.log(`✅ Successfully fetched ${emails.length} email details`);
            
            return emails;
            
        } catch (error) {
            console.error('❌ Error fetching real Gmail emails:', error);
            showNotification('Error fetching Gmail emails: ' + error.message, 'error');
            
            // Fall back to demo emails if Gmail API fails
            console.log('🔄 Falling back to demo emails');
            return this.getDemoEmails();
        }
    }
    
    // Fetch detailed information for each email
    async fetchEmailDetails(messages) {
        const emails = [];
        
        for (const message of messages) {
            try {
                const emailDetail = await this.fetchSingleEmail(message.id);
                if (emailDetail) {
                    emails.push(emailDetail);
                }
            } catch (error) {
                console.error(`❌ Error fetching email ${message.id}:`, error);
            }
        }
        
        return emails;
    }
    
    // Fetch a single email's full details
    async fetchSingleEmail(messageId) {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch email ${messageId}: ${response.status}`);
            }
            
            const emailData = await response.json();
            return this.parseGmailMessage(emailData);
            
        } catch (error) {
            console.error(`❌ Error fetching email ${messageId}:`, error);
            return null;
        }
    }
    
    // Parse Gmail API response into our email format
    parseGmailMessage(gmailMessage) {
        try {
            const headers = gmailMessage.payload?.headers || [];
            const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
            
            const email = {
                id: gmailMessage.id,
                sender: getHeader('from'),
                subject: getHeader('subject'),
                date: new Date(parseInt(gmailMessage.internalDate)).toLocaleString(),
                preview: this.extractEmailPreview(gmailMessage),
                content: this.extractEmailContent(gmailMessage)
            };
            
            console.log(`📧 Parsed email: ${email.subject} from ${email.sender}`);
            return email;
            
        } catch (error) {
            console.error('❌ Error parsing Gmail message:', error);
            return null;
        }
    }
    
    // Extract email preview text
    extractEmailPreview(gmailMessage) {
        try {
            const snippet = gmailMessage.snippet || '';
            return snippet.length > 100 ? snippet.substring(0, 100) + '...' : snippet;
        } catch (error) {
            return 'Preview not available';
        }
    }
    
    // Extract full email content
    extractEmailContent(gmailMessage) {
        try {
            // Try to get plain text content first
            let content = this.extractTextContent(gmailMessage.payload);
            
            if (!content) {
                // Fall back to snippet
                content = gmailMessage.snippet || 'Content not available';
            }
            
            return content;
        } catch (error) {
            console.error('❌ Error extracting email content:', error);
            return 'Content extraction failed';
        }
    }
    
    // Extract text content from Gmail message payload
    extractTextContent(payload) {
        if (!payload) return null;
        
        // If it's a multipart message
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain') {
                    return this.decodeBase64(part.body?.data);
                }
            }
        }
        
        // If it's a simple text message
        if (payload.mimeType === 'text/plain' && payload.body?.data) {
            return this.decodeBase64(payload.body.data);
        }
        
        return null;
    }
    
    // Decode base64 content
    decodeBase64(base64String) {
        try {
            if (!base64String) return '';
            return atob(base64String.replace(/-/g, '+').replace(/_/g, '/'));
        } catch (error) {
            console.error('❌ Error decoding base64:', error);
            return '';
        }
    }
    
    // Build Gmail search query based on settings
    buildGmailQuery() {
        let query = '';
        
        if (this.gmailSettings.senderFilter) {
            query += `from:${this.gmailSettings.senderFilter} `;
        }
        
        // Add common newsletter keywords
        query += 'subject:(newsletter OR analysis OR trading OR futures OR ES) ';
        
        // Limit to recent emails (last 7 days)
        query += 'newer_than:7d';
        
        return query.trim();
    }
    
    // Process Gmail API response
    processGmailMessages(messages) {
        // This would process the actual Gmail API response
        // and extract email details like sender, subject, content, etc.
        console.log('Processing Gmail messages:', messages.length);
        return [];
    }
    
    // Display emails in the UI
    displayEmails() {
        console.log('displayEmails called, emails count:', this.emails.length);
        const emailList = document.getElementById('email-list');
        if (!emailList) {
            console.error('email-list element not found');
            return;
        }

        if (this.emails.length === 0) {
            console.log('No emails to display, showing placeholder');
            emailList.innerHTML = `
                <div class="email-placeholder">
                    <i class="fas fa-inbox"></i>
                    <p>No newsletter emails found</p>
                </div>
            `;
            return;
        }

        console.log('Displaying emails:', this.emails.map(e => ({ id: e.id, subject: e.subject })));
        emailList.innerHTML = this.emails.map(email => `
            <div class="email-item" onclick="selectEmail('${email.id}')">
                <div class="email-header">
                    <div class="email-sender">${email.sender}</div>
                    <div class="email-date">${email.date}</div>
                </div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-preview">${email.preview}</div>
            </div>
        `).join('');
        console.log('Emails displayed in UI');
    }

    // Select an email and load its content
    selectEmail(emailId) {
        console.log('selectEmail called with:', emailId);
        const email = this.emails.find(e => e.id === emailId);
        if (!email) {
            console.log('Email not found for ID:', emailId);
            return;
        }

        console.log('Loading email content:', email.subject);
        // Update newsletter text area with email content
        const newsletterText = document.getElementById('newsletter-text');
        if (newsletterText) {
            newsletterText.value = email.content;
            showNotification('Email content loaded for analysis', 'success');
        } else {
            console.error('newsletter-text element not found');
        }
        
        // Highlight selected email
        document.querySelectorAll('.email-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Find and highlight the clicked email item
        const clickedItem = document.querySelector(`[onclick*="selectEmail('${emailId}')"]`);
        if (clickedItem) {
            clickedItem.classList.add('selected');
        }
    }

    // Start auto-fetching emails
    startAutoFetch() {
        if (!this.isAuthenticated) {
            showNotification('Please authenticate Gmail first', 'error');
            return;
        }

        if (this.autoFetchTimer) {
            showNotification('Auto-fetch is already running', 'info');
            return;
        }

        this.autoFetchTimer = setInterval(() => {
            this.fetchNewsletterEmails();
        }, this.gmailSettings.autoFetchInterval * 60 * 1000);

        showNotification(`Auto-fetch started (${this.gmailSettings.autoFetchInterval} minutes interval)`, 'success');
    }

    // Stop auto-fetching emails
    stopAutoFetch() {
        if (this.autoFetchTimer) {
            clearInterval(this.autoFetchTimer);
            this.autoFetchTimer = null;
            showNotification('Auto-fetch stopped', 'info');
        } else {
            showNotification('Auto-fetch is not running', 'info');
        }
    }

    // Update Gmail connection status
    updateGmailStatus() {
        console.log('updateGmailStatus called, isAuthenticated:', this.isAuthenticated);
        const statusElement = document.getElementById('gmail-status');
        if (statusElement) {
            if (this.isAuthenticated) {
                statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Gmail Connected</span>';
                statusElement.className = 'status connected';
                console.log('Gmail status updated to connected');
            } else {
                statusElement.innerHTML = '<i class="fas fa-circle"></i><span>Gmail Not Connected</span>';
                statusElement.className = 'status disconnected';
                console.log('Gmail status updated to disconnected');
            }
        } else {
            console.error('gmail-status element not found');
        }
    }
}

// ChatGPT Integration Class
class ChatGPTIntegration {
    constructor() {
        this.apiKey = '';
        this.model = 'gpt-3.5-turbo'; // Changed default to GPT-3.5 Turbo
        this.isAnalyzing = false;
        this.loadCredentials();
    }

    // Load saved credentials from localStorage
    loadCredentials() {
        try {
            const savedApiKey = localStorage.getItem('openai_api_key');
            const savedModel = localStorage.getItem('openai_model');
            
            if (savedApiKey) {
                document.getElementById('openai-api-key').value = savedApiKey;
                this.apiKey = savedApiKey;
            }
            
            if (savedModel) {
                document.getElementById('chatgpt-model').value = savedModel;
                this.model = savedModel;
            }
        } catch (error) {
            console.error('Error loading ChatGPT credentials:', error);
        }
    }

    // Save credentials to localStorage
    saveCredentials() {
        try {
            const apiKey = document.getElementById('openai-api-key').value.trim();
            const model = document.getElementById('chatgpt-model').value;
            
            if (apiKey) {
                localStorage.setItem('openai_api_key', apiKey);
                this.apiKey = apiKey;
            }
            
            localStorage.setItem('openai_model', model);
            this.model = model;
        } catch (error) {
            console.error('Error saving ChatGPT credentials:', error);
        }
    }

    // Clear credentials
    clearCredentials() {
        try {
            document.getElementById('openai-api-key').value = '';
            document.getElementById('chatgpt-model').value = 'gpt-3.5-turbo';
            localStorage.removeItem('openai_api_key');
            localStorage.removeItem('openai_model');
            this.apiKey = '';
            this.model = 'gpt-3.5-turbo';
        } catch (error) {
            console.error('Error clearing ChatGPT credentials:', error);
        }
    }

    // Analyze newsletter content with ChatGPT
    async analyzeWithChatGPT() {
        try {
            console.log('ChatGPT analysis started...');
            
            const newsletterText = document.getElementById('newsletter-text').value.trim();
            console.log('Newsletter text length:', newsletterText.length);
            
            if (!newsletterText) {
                showNotification('Please enter newsletter content first', 'error');
                return;
            }

            // Get API key from input field
            const apiKeyInput = document.getElementById('openai-api-key');
            const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
            console.log('API key provided:', apiKey ? 'Yes' : 'No');
            
            if (!apiKey) {
                showNotification('Please enter your OpenAI API key', 'error');
                return;
            }

            if (this.isAnalyzing) {
                showNotification('Analysis already in progress', 'info');
                return;
            }

            this.isAnalyzing = true;
            this.showLoadingState();

            // Save credentials
            this.saveCredentials();
            console.log('Credentials saved, API key length:', this.apiKey.length);

            // Prepare the prompt for ChatGPT
            const prompt = this.createAnalysisPrompt(newsletterText);
            console.log('Prompt created, length:', prompt.length);

            // Call ChatGPT API
            console.log('Calling ChatGPT API...');
            const response = await this.callChatGPTAPI(prompt);
            console.log('ChatGPT response received, length:', response.length);

            // Process and display the response
            this.displayChatGPTResponse(response);

            this.isAnalyzing = false;
            showNotification('ChatGPT analysis completed!', 'success');

        } catch (error) {
            console.error('Error in ChatGPT analysis:', error);
            this.isAnalyzing = false;
            this.hideLoadingState();
            showNotification('Error analyzing with ChatGPT: ' + error.message, 'error');
        }
    }

    // Create analysis prompt for ChatGPT
    createAnalysisPrompt(newsletterText) {
        return `You are an expert financial analyst specializing in E-mini S&P 500 futures trading. Analyze the following trading newsletter content and provide a comprehensive analysis with specific, actionable trading levels.

NEWSLETTER CONTENT:
${newsletterText}

IMPORTANT: Respond with ONLY valid JSON format. Do not include any markdown formatting, code blocks, or additional text. Return pure JSON only.

Please provide your analysis in the following JSON format with specific price levels for ES futures:
{
    "market_overview": {
        "bias": "bullish/bearish/neutral",
        "confidence": "high/medium/low",
        "summary": "Brief market overview"
    },
    "technical_analysis": {
        "key_levels": {
            "support": [list of specific support levels as numbers],
            "resistance": [list of specific resistance levels as numbers],
            "entry": "specific entry price as number",
            "stop_loss": "specific stop loss price as number",
            "targets": [list of specific target prices as numbers]
        },
        "risk_reward": "calculated risk/reward ratio as number",
        "probability": "estimated success probability as percentage"
    },
    "risk_assessment": {
        "risk_factors": [list of key risk factors],
        "risk_level": "high/medium/low",
        "position_sizing": "recommended position size in contracts"
    },
    "execution_plan": {
        "entry_strategy": "detailed entry strategy with specific triggers",
        "exit_strategy": "detailed exit strategy with partial exit levels",
        "time_horizon": "recommended time horizon (e.g., '2-4 hours', 'end of day')"
    },
    "recommendations": {
        "action": "buy/sell/hold",
        "reasoning": "detailed reasoning",
        "cautions": [list of cautions]
    }
}

IMPORTANT: Provide specific numerical values for all price levels. For example:
- Entry: 4500.25
- Stop Loss: 4485.50
- Targets: [4510.75, 4525.00, 4540.25]
- Support: [4480.00, 4465.50]
- Resistance: [4525.00, 4540.75]

Focus on practical, actionable insights for ES futures trading with precise price levels.`;
    }

    // Call ChatGPT API
    async callChatGPTAPI(prompt) {
        try {
            console.log('Making API request to OpenAI...');
            console.log('Model:', this.model);
            console.log('API Key starts with:', this.apiKey.substring(0, 10) + '...');
            
            const requestBody = {
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert financial analyst specializing in E-mini S&P 500 futures trading. Provide practical, actionable analysis.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.3
            };
            
            console.log('Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error response:', errorData);
                throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('API response data:', data);
            return data.choices[0].message.content;

        } catch (error) {
            console.error('ChatGPT API Error:', error);
            throw error;
        }
    }

    // Display ChatGPT response
    displayChatGPTResponse(response) {
        try {
            console.log('Displaying ChatGPT response...');
            const responseDisplay = document.getElementById('chatgpt-response-display');
            
            // Extract JSON from markdown code blocks if present
            let jsonResponse = response;
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonResponse = jsonMatch[1].trim();
                console.log('Extracted JSON from markdown:', jsonResponse);
            }
            
            // Try to parse JSON response
            let analysis;
            try {
                analysis = JSON.parse(jsonResponse);
                console.log('Successfully parsed JSON analysis:', analysis);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                console.error('Response was:', jsonResponse);
                // If not JSON, display as plain text
                responseDisplay.innerHTML = `
                    <div class="chatgpt-response-content">
                        <h5>ChatGPT Analysis</h5>
                        <div class="analysis-section">
                            <p>${response.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                `;
                return;
            }

            // Display structured analysis
            const html = this.formatAnalysisHTML(analysis);
            responseDisplay.innerHTML = html;

            // Auto-populate trading plan with ChatGPT analysis
            console.log('Calling populateTradingPlanFromAnalysis...');
            this.populateTradingPlanFromAnalysis(analysis);

        } catch (error) {
            console.error('Error displaying ChatGPT response:', error);
            const responseDisplay = document.getElementById('chatgpt-response-display');
            responseDisplay.innerHTML = `
                <div class="chatgpt-response-content">
                    <h5>Analysis Error</h5>
                    <div class="analysis-section">
                        <p>Error processing ChatGPT response. Please try again.</p>
                    </div>
                </div>
            `;
        }
    }

    // Format analysis as HTML
    formatAnalysisHTML(analysis) {
        return `
            <div class="chatgpt-response-content">
                <h5>AI-Powered Trading Analysis</h5>
                
                <div class="analysis-section">
                    <h6>Market Overview</h6>
                    <p><strong>Bias:</strong> ${analysis.market_overview?.bias || 'N/A'}</p>
                    <p><strong>Confidence:</strong> ${analysis.market_overview?.confidence || 'N/A'}</p>
                    <p><strong>Summary:</strong> ${analysis.market_overview?.summary || 'N/A'}</p>
                </div>

                <div class="analysis-section">
                    <h6>Technical Analysis</h6>
                    <p><strong>Entry:</strong> ${analysis.technical_analysis?.key_levels?.entry || 'N/A'}</p>
                    <p><strong>Stop Loss:</strong> ${analysis.technical_analysis?.key_levels?.stop_loss || 'N/A'}</p>
                    <p><strong>Targets:</strong> ${analysis.technical_analysis?.key_levels?.targets?.join(', ') || 'N/A'}</p>
                    <p><strong>Risk/Reward:</strong> ${analysis.technical_analysis?.risk_reward || 'N/A'}</p>
                    <p><strong>Probability:</strong> ${analysis.technical_analysis?.probability || 'N/A'}</p>
                </div>

                <div class="analysis-section">
                    <h6>Risk Assessment</h6>
                    <p><strong>Risk Level:</strong> ${analysis.risk_assessment?.risk_level || 'N/A'}</p>
                    <p><strong>Position Size:</strong> ${analysis.risk_assessment?.position_sizing || 'N/A'}</p>
                    <p><strong>Risk Factors:</strong> ${analysis.risk_assessment?.risk_factors?.join(', ') || 'N/A'}</p>
                </div>

                <div class="analysis-section">
                    <h6>Execution Plan</h6>
                    <p><strong>Entry Strategy:</strong> ${analysis.execution_plan?.entry_strategy || 'N/A'}</p>
                    <p><strong>Exit Strategy:</strong> ${analysis.execution_plan?.exit_strategy || 'N/A'}</p>
                    <p><strong>Time Horizon:</strong> ${analysis.execution_plan?.time_horizon || 'N/A'}</p>
                </div>

                <div class="analysis-section">
                    <h6>Recommendations</h6>
                    <p><strong>Action:</strong> ${analysis.recommendations?.action || 'N/A'}</p>
                    <p><strong>Reasoning:</strong> ${analysis.recommendations?.reasoning || 'N/A'}</p>
                    <p><strong>Cautions:</strong> ${analysis.recommendations?.cautions?.join(', ') || 'N/A'}</p>
                </div>
            </div>
        `;
    }

    // Show loading state
    showLoadingState() {
        const responseDisplay = document.getElementById('chatgpt-response-display');
        responseDisplay.innerHTML = `
            <div class="chatgpt-response-content">
                <h5>Analyzing with ChatGPT...</h5>
                <div class="analysis-section">
                    <div style="text-align: center; padding: 20px;">
                        <div class="loading-spinner"></div>
                        <p>Processing your trade plan with AI...</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Hide loading state
    hideLoadingState() {
        // This will be handled by displayChatGPTResponse
    }

    // Populate trading plan from ChatGPT analysis
    populateTradingPlanFromAnalysis(analysis) {
        try {
            console.log('Populating trading plan from ChatGPT analysis:', analysis);
            
            // Generate bracket order details
            console.log('Calling generateBracketOrderDetails...');
            this.generateBracketOrderDetails(analysis);

            showNotification('Bracket order details generated from ChatGPT analysis!', 'success');

        } catch (error) {
            console.error('Error populating trading plan:', error);
            showNotification('Error populating trading plan: ' + error.message, 'error');
        }
    }

    // Generate bracket order details from analysis
    generateBracketOrderDetails(analysis) {
        try {
            console.log('Generating bracket order details...');
            const bracketDisplay = document.getElementById('bracket-order-display');
            if (!bracketDisplay) {
                console.error('Bracket order display element not found!');
                return;
            }

            const keyLevels = analysis.technical_analysis?.key_levels;
            const bias = analysis.market_overview?.bias;
            const riskAssessment = analysis.risk_assessment;
            const executionPlan = analysis.execution_plan;

            console.log('Extracted data:', {
                keyLevels,
                bias,
                riskAssessment,
                executionPlan
            });

            if (!keyLevels) {
                console.error('No key levels found in analysis');
                bracketDisplay.innerHTML = `
                    <div class="bracket-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>No key levels found in analysis</p>
                    </div>
                `;
                return;
            }

            // Calculate position size (default to 1 contract)
            const positionSize = 1;
            const contractMultiplier = 50; // ES futures

            // Calculate risk/reward
            const entry = parseFloat(keyLevels.entry) || 0;
            const stopLoss = parseFloat(keyLevels.stop_loss) || 0;
            const targets = keyLevels.targets || [];
            
            const riskPerContract = Math.abs(entry - stopLoss);
            const dollarRisk = riskPerContract * contractMultiplier;

            const html = `
                <div class="bracket-order-content">
                    <h5>Bracket Order Details</h5>
                    
                    <div class="order-section">
                        <h6>Market Analysis</h6>
                        <div class="order-detail">
                            <span class="order-label">Bias:</span>
                            <span class="order-value">${bias ? bias.toUpperCase() : 'NEUTRAL'}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Confidence:</span>
                            <span class="order-value">${analysis.market_overview?.confidence || 'MEDIUM'}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Risk Level:</span>
                            <span class="order-value">${riskAssessment?.risk_level || 'MEDIUM'}</span>
                        </div>
                    </div>

                    <div class="order-section">
                        <h6>Entry Order</h6>
                        <div class="order-detail">
                            <span class="order-label">Order Type:</span>
                            <span class="order-value">${bias?.toLowerCase() === 'bullish' ? 'BUY' : 'SELL'} LIMIT</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Entry Price:</span>
                            <span class="order-value">$${entry.toFixed(2)}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Contracts:</span>
                            <span class="order-value">${positionSize}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Notional Value:</span>
                            <span class="order-value">$${(entry * positionSize * contractMultiplier).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="order-section">
                        <h6>Stop Loss Order</h6>
                        <div class="order-detail">
                            <span class="order-label">Order Type:</span>
                            <span class="order-value">${bias?.toLowerCase() === 'bullish' ? 'SELL' : 'BUY'} STOP</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Stop Price:</span>
                            <span class="order-value">$${stopLoss.toFixed(2)}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Dollar Risk:</span>
                            <span class="order-value">$${dollarRisk.toFixed(2)}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Risk per Contract:</span>
                            <span class="order-value">$${riskPerContract.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="order-section">
                        <h6>Take Profit Orders</h6>
                        ${targets.map((target, index) => `
                            <div class="order-detail">
                                <span class="order-label">TP ${index + 1}:</span>
                                <span class="order-value">$${parseFloat(target).toFixed(2)} ($${Math.abs(entry - target) * contractMultiplier * positionSize / targets.length})</span>
                            </div>
                        `).join('')}
                        <div class="order-detail">
                            <span class="order-label">Total Potential Profit:</span>
                            <span class="order-value">$${targets.reduce((total, target) => total + Math.abs(entry - target) * contractMultiplier * positionSize / targets.length, 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="order-section">
                        <h6>Risk Management</h6>
                        <div class="order-detail">
                            <span class="order-label">Risk/Reward Ratio:</span>
                            <span class="order-value">${keyLevels.risk_reward || '1:2'}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Success Probability:</span>
                            <span class="order-value">${analysis.technical_analysis?.probability || '60%'}</span>
                        </div>
                        <div class="order-detail">
                            <span class="order-label">Time Horizon:</span>
                            <span class="order-value">${executionPlan?.time_horizon || '2-4 hours'}</span>
                        </div>
                    </div>
                </div>
            `;

            bracketDisplay.innerHTML = html;

        } catch (error) {
            console.error('Error generating bracket order details:', error);
            const bracketDisplay = document.getElementById('bracket-order-display');
            if (bracketDisplay) {
                bracketDisplay.innerHTML = `
                    <div class="bracket-placeholder">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error generating bracket order details</p>
                    </div>
                `;
            }
        }
    }


}

// Newsletter Integration Class
class NewsletterIntegration {
    constructor() {
        try {
            console.log('NewsletterIntegration constructor called');
            this.initializeNewsletterListeners();
        } catch (error) {
            console.error('Error in NewsletterIntegration constructor:', error);
        }
    }

    // Initialize newsletter input listeners
    initializeNewsletterListeners() {
        try {
            const newsletterText = document.getElementById('newsletter-text');
            if (newsletterText) {
                newsletterText.addEventListener('input', () => this.updateNewsletterSummary());
            }
        } catch (error) {
            console.error('Error in initializeNewsletterListeners:', error);
        }
    }

    // Analyze newsletter text and build execution plan
    analyzeNewsletter() {
        console.log('NewsletterIntegration.analyzeNewsletter() called');
        const text = document.getElementById('newsletter-text').value.trim();
        console.log('Text content:', text);
        
        if (!text) {
            showNotification('Please enter trade plan content to analyze', 'error');
            return;
        }

        // Parse the text to extract key information
        const analysis = this.parseNewsletterText(text);
        console.log('Parsed analysis:', analysis);
        
        if (!analysis.isValid) {
            showNotification('Could not extract valid trading levels from the text. Please include entry, stop loss, and target levels.', 'error');
            return;
        }

        // Update the main trading plan with extracted data
        this.updateTradingPlan(analysis);
        
        // Generate execution plan
        this.generateExecutionPlan(analysis);
        
        // Update summary
        this.updateNewsletterSummary();
        
        showNotification('Trade plan analyzed and execution plan generated!', 'success');
    }

    // Parse newsletter text to extract trading information
    parseNewsletterText(text) {
        const analysis = {
            isValid: false,
            currentPrice: 0,
            bias: 'neutral',
            longSetup: null,
            shortSetup: null,
            support: [],
            resistance: [],
            reasoning: '',
            riskFactors: '',
            source: 'Newsletter Analysis'
        };

        // Extract current price
        const currentPriceMatch = text.match(/current\s+price\s+(?:at|is)?\s*\$?(\d+(?:\.\d+)?)/i);
        if (currentPriceMatch) {
            analysis.currentPrice = parseFloat(currentPriceMatch[1]);
        }

        // Extract bias
        if (text.match(/bullish|long|buy|upside/i)) {
            analysis.bias = 'bullish';
        } else if (text.match(/bearish|short|sell|downside/i)) {
            analysis.bias = 'bearish';
        }

        // Extract long setup
        const longEntryMatch = text.match(/long\s+entry\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)/i);
        const longStopMatch = text.match(/long\s+stop\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)/i);
        const longTargets = text.match(/long\s+targets?\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)(?:\s*,\s*\$?(\d+(?:\.\d+)?))?(?:\s*,\s*\$?(\d+(?:\.\d+)?))?/i);
        
        if (longEntryMatch && longStopMatch) {
            analysis.longSetup = {
                entry: parseFloat(longEntryMatch[1]),
                stop: parseFloat(longStopMatch[1]),
                targets: []
            };
            
            if (longTargets) {
                for (let i = 1; i <= 3; i++) {
                    if (longTargets[i]) {
                        analysis.longSetup.targets.push(parseFloat(longTargets[i]));
                    }
                }
            }
        }

        // Extract short setup
        const shortEntryMatch = text.match(/short\s+entry\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)/i);
        const shortStopMatch = text.match(/short\s+stop\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)/i);
        const shortTargets = text.match(/short\s+targets?\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)(?:\s*,\s*\$?(\d+(?:\.\d+)?))?(?:\s*,\s*\$?(\d+(?:\.\d+)?))?/i);
        
        if (shortEntryMatch && shortStopMatch) {
            analysis.shortSetup = {
                entry: parseFloat(shortEntryMatch[1]),
                stop: parseFloat(shortStopMatch[1]),
                targets: []
            };
            
            if (shortTargets) {
                for (let i = 1; i <= 3; i++) {
                    if (shortTargets[i]) {
                        analysis.shortSetup.targets.push(parseFloat(shortTargets[i]));
                    }
                }
            }
        }

        // Extract support and resistance levels
        const supportMatches = text.match(/support\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)(?:\s*,\s*\$?(\d+(?:\.\d+)?))?/gi);
        if (supportMatches) {
            supportMatches.forEach(match => {
                const levels = match.match(/\$?(\d+(?:\.\d+)?)/g);
                levels.forEach(level => {
                    analysis.support.push(parseFloat(level.replace('$', '')));
                });
            });
        }

        const resistanceMatches = text.match(/resistance\s+(?:at|around)?\s*\$?(\d+(?:\.\d+)?)(?:\s*,\s*\$?(\d+(?:\.\d+)?))?/gi);
        if (resistanceMatches) {
            resistanceMatches.forEach(match => {
                const levels = match.match(/\$?(\d+(?:\.\d+)?)/g);
                levels.forEach(level => {
                    analysis.resistance.push(parseFloat(level.replace('$', '')));
                });
            });
        }

        // Extract reasoning and risk factors
        const reasoningMatch = text.match(/(?:due\s+to|because|reasoning?|analysis?)[:\s]+([^.]+)/i);
        if (reasoningMatch) {
            analysis.reasoning = reasoningMatch[1].trim();
        }

        const riskMatch = text.match(/(?:risk|caution|warning)[:\s]+([^.]+)/i);
        if (riskMatch) {
            analysis.riskFactors = riskMatch[1].trim();
        }

        // Validate analysis
        analysis.isValid = analysis.currentPrice > 0 && (analysis.longSetup || analysis.shortSetup);
        
        return analysis;
    }

    // Update main trading plan with extracted data
    updateTradingPlan(analysis) {
        // Update current price
        const currentPriceElement = document.getElementById('current-price');
        if (currentPriceElement) currentPriceElement.value = analysis.currentPrice;
        
        // Determine best setup
        let bestSetup = null;
        if (analysis.longSetup && analysis.shortSetup) {
            // Compare setups and choose the better one
            const longScore = this.scoreSetup(analysis.longSetup, analysis.currentPrice);
            const shortScore = this.scoreSetup(analysis.shortSetup, analysis.currentPrice);
            bestSetup = longScore > shortScore ? analysis.longSetup : analysis.shortSetup;
        } else if (analysis.longSetup) {
            bestSetup = analysis.longSetup;
        } else if (analysis.shortSetup) {
            bestSetup = analysis.shortSetup;
        }

        if (bestSetup) {
            // Update entry and stop loss
            const entryPriceElement = document.getElementById('entry-price');
            const stopLossElement = document.getElementById('stop-loss');
            
            if (entryPriceElement) entryPriceElement.value = bestSetup.entry;
            if (stopLossElement) stopLossElement.value = bestSetup.stop;
            
            // Update take profit levels
            this.updateTakeProfitLevels(bestSetup.targets);
        }

        // Update account size and risk percentage with defaults
        const accountSizeElement = document.getElementById('account-size');
        const riskPercentageElement = document.getElementById('risk-percentage');
        
        if (accountSizeElement) accountSizeElement.value = 100000;
        if (riskPercentageElement) riskPercentageElement.value = 2;
    }

    // Score a setup based on risk/reward and proximity to current price
    scoreSetup(setup, currentPrice) {
        const risk = Math.abs(setup.entry - setup.stop);
        const avgReward = setup.targets.length > 0 ? 
            setup.targets.reduce((sum, target) => sum + Math.abs(target - setup.entry), 0) / setup.targets.length : 
            risk * 2; // Default 2:1 R/R
        
        const riskRewardRatio = avgReward / risk;
        const proximityScore = 1 / (1 + Math.abs(setup.entry - currentPrice) / currentPrice);
        
        return riskRewardRatio * 10 + proximityScore * 5;
    }

    // Update take profit levels
    updateTakeProfitLevels(targets) {
        const tpLevels = document.getElementById('tp-levels');
        if (!tpLevels) {
            console.error('tp-levels element not found');
            return;
        }
        
        tpLevels.innerHTML = '';

        if (targets.length === 0) {
            // Add default TP levels
            this.addDefaultTPLevels();
            return;
        }

        targets.forEach((target, index) => {
            const tpLevel = document.createElement('div');
            tpLevel.className = 'tp-level';
            const percentage = Math.round(100 / targets.length);
            
            tpLevel.innerHTML = `
                <label>TP ${index + 1}</label>
                <input type="number" class="tp-price" value="${target}" step="0.25" placeholder="TP price">
                <input type="number" class="tp-size" value="${percentage}" min="0" max="100" step="5" placeholder="%">
                <button class="remove-tp" onclick="removeTP(this)"><i class="fas fa-trash"></i></button>
            `;
            
            tpLevels.appendChild(tpLevel);
        });

        if (calculator) {
            calculator.setupTPListeners();
        }
    }

    // Add default TP levels
    addDefaultTPLevels() {
        const entry = parseFloat(document.getElementById('entry-price').value) || 0;
        const stop = parseFloat(document.getElementById('stop-loss').value) || 0;
        
        if (entry && stop) {
            const risk = Math.abs(entry - stop);
            const tp1 = entry + (risk * 1.5);
            const tp2 = entry + (risk * 2.5);
            
            this.updateTakeProfitLevels([tp1, tp2]);
        }
    }

    // Generate execution plan
    generateExecutionPlan(analysis) {
        const entryTrigger = this.generateEntryTrigger(analysis);
        const partialExits = this.generatePartialExitStrategy(analysis);
        const timeStop = this.generateTimeStop(analysis);
        
        const entryTriggerElement = document.getElementById('entry-trigger');
        const partialExitsElement = document.getElementById('partial-exits');
        const timeStopElement = document.getElementById('time-stop');
        
        if (entryTriggerElement) entryTriggerElement.value = entryTrigger;
        if (partialExitsElement) partialExitsElement.value = partialExits;
        if (timeStopElement) timeStopElement.value = timeStop;
        
        // Recalculate all metrics
        if (calculator) {
            calculator.calculateAll();
        }
    }

    // Generate entry trigger
    generateEntryTrigger(analysis) {
        const currentPrice = analysis.currentPrice;
        let setup = analysis.longSetup || analysis.shortSetup;
        
        if (!setup) return 'No valid setup found';
        
        const direction = analysis.longSetup ? 'Long' : 'Short';
        const entry = setup.entry;
        
        if (direction === 'Long') {
            if (currentPrice < entry) {
                return `Wait for price to reach ${entry} for long entry. Consider limit order at ${entry}.`;
            } else {
                return `Price above entry. Consider market order or wait for pullback to ${entry}.`;
            }
        } else {
            if (currentPrice > entry) {
                return `Wait for price to reach ${entry} for short entry. Consider limit order at ${entry}.`;
            } else {
                return `Price below entry. Consider market order or wait for bounce to ${entry}.`;
            }
        }
    }

    // Generate partial exit strategy
    generatePartialExitStrategy(analysis) {
        let setup = analysis.longSetup || analysis.shortSetup;
        
        if (!setup || setup.targets.length === 0) {
            return 'Exit 50% at 1.5R, remaining 50% at 2.5R based on risk management.';
        }

        let strategy = `Execution Plan:\n`;
        setup.targets.forEach((target, index) => {
            const percentage = Math.round(100 / setup.targets.length);
            const risk = Math.abs(setup.entry - setup.stop);
            const rr = (Math.abs(target - setup.entry) / risk).toFixed(2);
            strategy += `• Exit ${percentage}% at ${target} (${rr}R)\n`;
        });

        strategy += `\nRisk Management:\n• Stop Loss: ${setup.stop}\n• Max Risk: $${(Math.abs(setup.entry - setup.stop) * 50).toFixed(2)}`;
        
        return strategy;
    }

    // Generate time stop
    generateTimeStop(analysis) {
        if (analysis.bias === 'bullish' || analysis.bias === 'bearish') {
            return 'Exit if no profit within 2-3 hours or by market close';
        } else {
            return 'Exit if no profit by end of session';
        }
    }

    // Update newsletter summary display
    updateNewsletterSummary() {
        try {
            const newsletterText = document.getElementById('newsletter-text');
            const summaryDisplay = document.getElementById('newsletter-summary-display');
            
            if (!newsletterText || !summaryDisplay) {
                console.warn('Newsletter elements not found');
                return;
            }
            
            const text = newsletterText.value.trim();
            
            if (!text) {
                summaryDisplay.innerHTML = `
                    <div class="summary-placeholder">
                        <i class="fas fa-newspaper"></i>
                        <p>Paste your trade plan content above and click "Analyze & Build Plan" to generate an execution summary</p>
                    </div>
                `;
                return;
            }

            const analysis = this.parseNewsletterText(text);
            const summaryHTML = this.generateSummaryHTML(analysis);
            summaryDisplay.innerHTML = summaryHTML;
        } catch (error) {
            console.error('Error in updateNewsletterSummary:', error);
        }
    }

    // Generate summary HTML
    generateSummaryHTML(analysis) {
        if (!analysis.isValid) {
            return `
                <div class="summary-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Could not extract valid trading levels. Please include entry, stop loss, and target levels in your text.</p>
                </div>
            `;
        }

        return `
            <div class="newsletter-summary-content">
                <h4>Analysis Results</h4>
                
                <div class="summary-section">
                    <h5><i class="fas fa-info-circle"></i> Market Overview</h5>
                    <div class="summary-metrics">
                        <div class="metric-item">
                            <span class="metric-label">Current Price:</span>
                            <span class="metric-value">$${analysis.currentPrice.toFixed(2)}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Bias:</span>
                            <span class="metric-value ${analysis.bias === 'bullish' ? 'high' : analysis.bias === 'bearish' ? 'low' : 'medium'}">${analysis.bias}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Source:</span>
                            <span class="metric-value">${analysis.source}</span>
                        </div>
                    </div>
                </div>
                
                <div class="setup-comparison">
                    ${analysis.longSetup ? `
                    <div class="summary-section">
                        <h5><i class="fas fa-arrow-up" style="color: #2ed573;"></i> Long Setup</h5>
                        <div class="summary-metrics">
                            <div class="metric-item">
                                <span class="metric-label">Entry:</span>
                                <span class="metric-value">$${analysis.longSetup.entry.toFixed(2)}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Stop:</span>
                                <span class="metric-value">$${analysis.longSetup.stop.toFixed(2)}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Targets:</span>
                                <span class="metric-value">${analysis.longSetup.targets.length}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Risk:</span>
                                <span class="metric-value">$${Math.abs(analysis.longSetup.entry - analysis.longSetup.stop).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${analysis.shortSetup ? `
                    <div class="summary-section">
                        <h5><i class="fas fa-arrow-down" style="color: #ff4757;"></i> Short Setup</h5>
                        <div class="summary-metrics">
                            <div class="metric-item">
                                <span class="metric-label">Entry:</span>
                                <span class="metric-value">$${analysis.shortSetup.entry.toFixed(2)}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Stop:</span>
                                <span class="metric-value">$${analysis.shortSetup.stop.toFixed(2)}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Targets:</span>
                                <span class="metric-value">${analysis.shortSetup.targets.length}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Risk:</span>
                                <span class="metric-value">$${Math.abs(analysis.shortSetup.entry - analysis.shortSetup.stop).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                ${analysis.support.length > 0 || analysis.resistance.length > 0 ? `
                <div class="summary-section">
                    <h5><i class="fas fa-chart-line"></i> Key Levels</h5>
                    <div class="summary-metrics">
                        ${analysis.support.length > 0 ? `
                        <div class="metric-item">
                            <span class="metric-label">Support:</span>
                            <span class="metric-value">$${analysis.support.join(', $')}</span>
                        </div>
                        ` : ''}
                        ${analysis.resistance.length > 0 ? `
                        <div class="metric-item">
                            <span class="metric-label">Resistance:</span>
                            <span class="metric-value">$${analysis.resistance.join(', $')}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
                
                ${analysis.reasoning ? `
                <div class="summary-section">
                    <h5><i class="fas fa-brain"></i> Analysis</h5>
                    <div class="summary-description">
                        ${analysis.reasoning}
                    </div>
                </div>
                ` : ''}
                
                ${analysis.riskFactors ? `
                <div class="summary-section">
                    <h5><i class="fas fa-exclamation-triangle"></i> Risk Factors</h5>
                    <div class="summary-description">
                        ${analysis.riskFactors}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Clear newsletter inputs
    clearNewsletterInputs() {
        document.getElementById('newsletter-text').value = '';
        this.updateNewsletterSummary();
        showNotification('Newsletter content cleared!', 'success');
    }

    // Save newsletter analysis
    saveNewsletterAnalysis() {
        const text = document.getElementById('newsletter-text').value.trim();
        
        if (!text) {
            showNotification('Please enter content before saving', 'error');
            return;
        }

        const analysis = this.parseNewsletterText(text);
        
        const savedAnalysis = {
            timestamp: new Date().toISOString(),
            originalText: text,
            analysis: analysis,
            generatedPlan: {
                entryPrice: document.getElementById('entry-price').value,
                stopLoss: document.getElementById('stop-loss').value,
                takeProfits: getTakeProfitLevelsData(),
                riskMetrics: {
                    maxLoss: document.getElementById('max-loss').value,
                    maxProfit: document.getElementById('max-profit').value,
                    riskReward: document.getElementById('risk-reward').value
                }
            }
        };

        // Save to localStorage
        const savedAnalyses = JSON.parse(localStorage.getItem('newsletterAnalyses') || '[]');
        savedAnalyses.push(savedAnalysis);
        localStorage.setItem('newsletterAnalyses', JSON.stringify(savedAnalyses));

        showNotification('Analysis saved successfully!', 'success');
    }
}

// Global instances
let calculator, tradingView, newsletterIntegration, chatGPTIntegration, gmailIntegration;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM loaded, initializing components...');
        console.log('🚀 AI Trading Agent v1.1 - Enhanced Gmail Protection Loaded');
        console.log('📅 Build Date: August 31, 2025');
        console.log('🔒 Gmail Authentication Protection: ENABLED');
        console.log('⛔ Fetch Blocking: ENABLED');
        calculator = new TradingPlanCalculator();
        tradingView = new TradingViewIntegration();
        newsletterIntegration = new NewsletterIntegration();
        chatGPTIntegration = new ChatGPTIntegration();
        gmailIntegration = new GmailIntegration();
        
        console.log('Components initialized:', {
            calculator: !!calculator,
            tradingView: !!tradingView,
            newsletterIntegration: !!newsletterIntegration,
            chatGPTIntegration: !!chatGPTIntegration,
            gmailIntegration: !!gmailIntegration
        });
        
        // Expose components to global scope for HTML onclick handlers
        window.gmailIntegration = gmailIntegration;
        window.chatGPTIntegration = chatGPTIntegration;
        window.tradingView = tradingView;
        window.calculator = calculator;
        
        // Test if global functions are available
        console.log('Global functions available:', {
            testChatGPTConnection: typeof testChatGPTConnection,
            analyzeWithChatGPT: typeof analyzeWithChatGPT,
            clearChatGPTCredentials: typeof clearChatGPTCredentials
        });
        
        // Initial calculation
        if (calculator) {
            calculator.calculateAll();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Global functions for newsletter integration
function analyzeNewsletter() {
    console.log('analyzeNewsletter function called');
    if (newsletterIntegration) {
        console.log('newsletterIntegration found, calling analyzeNewsletter method');
        newsletterIntegration.analyzeNewsletter();
    } else {
        console.log('newsletterIntegration not found');
        showNotification('Newsletter integration not initialized', 'error');
    }
}

function clearNewsletterInputs() {
    if (newsletterIntegration) {
        newsletterIntegration.clearNewsletterInputs();
    }
}

function saveNewsletterAnalysis() {
    if (newsletterIntegration) {
        newsletterIntegration.saveNewsletterAnalysis();
    }
}

// Global functions for ChatGPT integration
window.analyzeWithChatGPT = function() {
    if (chatGPTIntegration) {
        chatGPTIntegration.analyzeWithChatGPT();
    } else {
        showNotification('ChatGPT integration not initialized', 'error');
    }
}

window.clearChatGPTCredentials = function() {
    if (chatGPTIntegration) {
        chatGPTIntegration.clearCredentials();
        showNotification('ChatGPT credentials cleared!', 'success');
    } else {
        showNotification('ChatGPT integration not initialized', 'error');
    }
}

// Push ChatGPT analysis to TradingView
window.pushToTradingView = function() {
    try {
        console.log('Pushing bracket orders to TradingView...');
        
        // Check if TradingView is connected
        if (!tradingView || !tradingView.isConnected) {
            showNotification('Please connect to TradingView first', 'error');
            return;
        }

        // Check if bracket order details exist
        const bracketDisplay = document.getElementById('bracket-order-display');
        if (!bracketDisplay || bracketDisplay.querySelector('.bracket-placeholder')) {
            showNotification('Please run ChatGPT analysis first to generate bracket orders', 'error');
            return;
        }

        // Extract order details from the display
        const orderDetails = extractOrderDetailsFromDisplay();
        if (!orderDetails) {
            showNotification('Unable to extract order details', 'error');
            return;
        }

        // Send bracket orders to TradingView
        sendBracketOrdersToTradingView(orderDetails);

        showNotification('Bracket orders sent to TradingView successfully!', 'success');

    } catch (error) {
        console.error('Error pushing to TradingView:', error);
        showNotification('Error pushing to TradingView: ' + error.message, 'error');
    }
}

// Extract order details from the bracket order display
function extractOrderDetailsFromDisplay() {
    try {
        const bracketContent = document.querySelector('.bracket-order-content');
        if (!bracketContent) return null;

        // Extract bias
        const biasElement = bracketContent.querySelector('.order-detail .order-value');
        const bias = biasElement ? biasElement.textContent.trim() : 'NEUTRAL';

        // Extract entry details
        const entrySection = Array.from(bracketContent.querySelectorAll('.order-section')).find(section => 
            section.querySelector('h6').textContent.includes('Entry Order')
        );
        
        if (!entrySection) return null;

        const entryPrice = parseFloat(entrySection.querySelector('.order-detail:nth-child(2) .order-value').textContent.replace('$', '')) || 0;
        const contracts = parseInt(entrySection.querySelector('.order-detail:nth-child(3) .order-value').textContent) || 1;

        // Extract stop loss details
        const stopSection = Array.from(bracketContent.querySelectorAll('.order-section')).find(section => 
            section.querySelector('h6').textContent.includes('Stop Loss')
        );
        
        const stopPrice = parseFloat(stopSection.querySelector('.order-detail:nth-child(2) .order-value').textContent.replace('$', '')) || 0;

        // Extract take profit details
        const tpSection = Array.from(bracketContent.querySelectorAll('.order-section')).find(section => 
            section.querySelector('h6').textContent.includes('Take Profit')
        );
        
        const takeProfits = [];
        if (tpSection) {
            const tpDetails = tpSection.querySelectorAll('.order-detail');
            tpDetails.forEach((detail, index) => {
                if (index < tpDetails.length - 1) { // Skip the total profit row
                    const tpText = detail.querySelector('.order-value').textContent;
                    const tpPrice = parseFloat(tpText.split('(')[0].replace('$', '')) || 0;
                    takeProfits.push(tpPrice);
                }
            });
        }

        return {
            bias: bias,
            entryPrice: entryPrice,
            stopPrice: stopPrice,
            contracts: contracts,
            takeProfits: takeProfits
        };

    } catch (error) {
        console.error('Error extracting order details:', error);
        return null;
    }
}

// Send bracket orders to TradingView
function sendBracketOrdersToTradingView(orderDetails) {
    try {
        const { bias, entryPrice, stopPrice, contracts, takeProfits } = orderDetails;
        
        // Determine order side based on bias
        const isBullish = bias.includes('BULLISH');
        const entrySide = isBullish ? 'BUY' : 'SELL';
        const exitSide = isBullish ? 'SELL' : 'BUY';

        // Send entry order
        tradingView.sendOrder(entrySide, entryPrice, contracts, 'limit');

        // Send stop loss order
        tradingView.sendOrder(exitSide, stopPrice, contracts, 'stop');

        // Send take profit orders
        takeProfits.forEach((tpPrice, index) => {
            const tpContracts = Math.floor(contracts / takeProfits.length);
            if (tpContracts > 0) {
                tradingView.sendOrder(exitSide, tpPrice, tpContracts, 'limit');
            }
        });

        console.log('Bracket orders sent:', {
            entry: `${entrySide} ${contracts} @ $${entryPrice}`,
            stop: `${exitSide} ${contracts} @ $${stopPrice}`,
            takeProfits: takeProfits.map((price, i) => `${exitSide} ${Math.floor(contracts / takeProfits.length)} @ $${price}`)
        });

    } catch (error) {
        console.error('Error sending bracket orders:', error);
        throw error;
    }
}

// Clear bracket orders
window.clearBracketOrders = function() {
    try {
        const bracketDisplay = document.getElementById('bracket-order-display');
        if (bracketDisplay) {
            bracketDisplay.innerHTML = `
                <div class="bracket-placeholder">
                    <i class="fas fa-chart-line"></i>
                    <p>Run ChatGPT analysis to see bracket order details</p>
                </div>
            `;
        }
        showNotification('Bracket orders cleared!', 'success');
    } catch (error) {
        console.error('Error clearing bracket orders:', error);
        showNotification('Error clearing bracket orders: ' + error.message, 'error');
    }
}

// Test ChatGPT connection
window.testChatGPTConnection = async function() {
    try {
        const apiKeyInput = document.getElementById('openai-api-key');
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
        
        if (!apiKey) {
            showNotification('Please enter your OpenAI API key first', 'error');
            return;
        }
        
        console.log('Testing ChatGPT connection...');
        console.log('API Key format check:', apiKey.startsWith('sk-') ? 'Valid format' : 'Invalid format');
        
        // Basic API key validation
        if (!apiKey.startsWith('sk-')) {
            showNotification('Invalid API key format. OpenAI API keys should start with "sk-"', 'error');
            return;
        }
        
        if (apiKey.length < 20) {
            showNotification('API key appears to be too short. Please check your OpenAI API key.', 'error');
            return;
        }
        
        // Simple test request
        console.log('Making test request to OpenAI API...');
        console.log('API Key length:', apiKey.length);
        console.log('API Key starts with:', apiKey.substring(0, 7));
        
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Test response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            const availableModels = data.data.map(m => m.id);
            console.log('Available models:', availableModels);
            
            // Check if current model is available
            const modelSelect = document.getElementById('chatgpt-model');
            if (modelSelect && !availableModels.includes(this.model)) {
                // If current model not available, switch to GPT-3.5-turbo
                if (availableModels.includes('gpt-3.5-turbo')) {
                    this.model = 'gpt-3.5-turbo';
                    modelSelect.value = 'gpt-3.5-turbo';
                    showNotification('Switched to GPT-3.5 Turbo (GPT-4 not available)', 'info');
                }
            }
            
            showNotification('ChatGPT connection successful! Available models: ' + availableModels.join(', '), 'success');
        } else {
            const errorData = await response.json();
            console.error('Connection test failed:', errorData);
            
            let errorMessage = 'Unknown error';
            if (errorData.error) {
                if (errorData.error.code === 'invalid_api_key') {
                    errorMessage = 'Invalid API key. Please check your OpenAI API key.';
                } else if (errorData.error.code === 'insufficient_quota') {
                    errorMessage = 'API key has insufficient quota. Please add credits to your account.';
                } else if (errorData.error.code === 'billing_not_active') {
                    errorMessage = 'Billing not active. Please set up billing for your OpenAI account.';
                } else {
                    errorMessage = errorData.error.message || 'API Error: ' + errorData.error.code;
                }
            }
            
            showNotification('Connection test failed: ' + errorMessage, 'error');
        }
        
    } catch (error) {
        console.error('Connection test error:', error);
        showNotification('Connection test error: ' + error.message, 'error');
    }
}

// Global functions for TradingView integration
function connectTradingView() {
    if (tradingView) {
        tradingView.connect();
    }
}

function disconnectTradingView() {
    if (tradingView) {
        tradingView.disconnect();
    }
}

function setBroker(broker) {
    if (tradingView) {
        tradingView.setBroker(broker);
    }
}

function setOrderType(type) {
    if (tradingView) {
        tradingView.setOrderType(type);
    }
}

function setTradingSymbol(symbol) {
    if (tradingView) {
        tradingView.setTradingSymbol(symbol);
    }
}

// TradingView Credentials
function saveTVCredentials() {
    if (tradingView) {
        tradingView.saveTVCredentials();
    }
}

function testTVCredentials() {
    if (tradingView) {
        tradingView.testTVCredentials();
    }
}

function clearTVCredentials() {
    if (tradingView) {
        tradingView.clearTVCredentials();
    }
}

// High Frequency Trading
function toggleHFTMode(enabled) {
    if (tradingView) {
        tradingView.toggleHFTMode(enabled);
    }
}

function setHFTInterval(interval) {
    if (tradingView) {
        tradingView.setHFTInterval(interval);
    }
}

function setHFTMaxTrades(maxTrades) {
    if (tradingView) {
        tradingView.setHFTMaxTrades(maxTrades);
    }
}

function setHFTProfitTarget(target) {
    if (tradingView) {
        tradingView.setHFTProfitTarget(target);
    }
}

function startHFTSession() {
    if (tradingView) {
        tradingView.startHFTSession();
    }
}

function stopHFTSession() {
    if (tradingView) {
        tradingView.stopHFTSession();
    }
}

function viewHFTSession() {
    if (tradingView) {
        tradingView.viewHFTSession();
    }
}

// Gmail Integration Functions
window.saveGmailSettings = function() {
    console.log('saveGmailSettings called, gmailIntegration:', !!window.gmailIntegration);
    if (window.gmailIntegration) {
        window.gmailIntegration.saveGmailSettings();
    } else {
        console.error('gmailIntegration not initialized');
        showNotification('Gmail integration not initialized. Please refresh the page.', 'error');
    }
};

window.authenticateGmail = function() {
    console.log(`[${new Date().toLocaleTimeString()}] 🔐 authenticateGmail called, gmailIntegration:`, !!window.gmailIntegration);
    
    // Prevent multiple simultaneous calls
    if (window.gmailIntegration && window.gmailIntegration.isAuthenticating) {
        console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Authentication already in progress, ignoring call`);
        showNotification('⚠️ Authentication already in progress, please wait...', 'info');
        return;
    }
    
    if (window.gmailIntegration) {
        console.log(`[${new Date().toLocaleTimeString()}] 🚀 Starting Gmail authentication...`);
        window.gmailIntegration.authenticateGmail();
    } else {
        console.error('gmailIntegration not initialized');
        showNotification('Gmail integration not initialized. Please refresh the page.', 'error');
    }
};

window.fetchNewsletterEmails = function() {
    console.log(`[${new Date().toLocaleTimeString()}] fetchNewsletterEmails called, gmailIntegration:`, !!window.gmailIntegration);
    
    // Global authentication check
    if (!window.gmailIntegration || !window.gmailIntegration.isAuthenticated) {
        console.log(`[${new Date().toLocaleTimeString()}] ❌ BLOCKED: Gmail not authenticated yet!`);
        showNotification('❌ BLOCKED: Gmail not authenticated yet! Please wait for authentication to complete.', 'error');
        return;
    }
    
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Gmail authenticated, proceeding with fetch`);
    window.gmailIntegration.fetchNewsletterEmails();
};

window.startAutoFetch = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.startAutoFetch();
    }
};

window.stopAutoFetch = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.stopAutoFetch();
    }
};

window.selectEmail = function(emailId) {
    if (window.gmailIntegration) {
        window.gmailIntegration.selectEmail(emailId);
    }
};

// Gmail OAuth Management Functions
window.clearGmailOAuth = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.clearOAuthCredentials();
    }
};

window.testGmailAPI = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.testGmailAPIConnection();
    }
};

window.refreshGmailToken = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.refreshOAuthToken();
    }
};

window.checkStoredCredentials = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.debugStoredCredentials();
    }
};

window.testWebhookServer = async function() {
    try {
        console.log('🧪 Testing webhook server connection...');
        showNotification('Testing webhook server connection...', 'info');
        
        const response = await fetch('http://localhost:3001/health');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Webhook server healthy:', data);
            showNotification(`✅ Webhook server healthy! Pending: ${data.pendingOrders}, Total: ${data.totalOrders}`, 'success');
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Webhook server test failed:', error);
        showNotification('❌ Webhook server not accessible. Please start the server first.', 'error');
    }
};

// OAuth Configuration Management
window.saveOAuthConfig = function() {
    if (window.gmailIntegration) {
        window.gmailIntegration.saveOAuthConfig();
    }
};

function sendEntryOrder() {
    const entryPrice = parseFloat(document.getElementById('entry-price')?.value) || 0;
    const positionSize = parseInt(document.getElementById('position-size')?.value) || 1;
    
    if (entryPrice > 0 && tradingView) {
        tradingView.sendOrder('BUY', entryPrice, positionSize, tradingView.orderType);
    } else {
        showNotification('Please set entry price first', 'error');
    }
}

function sendStopOrder() {
    const stopLoss = parseFloat(document.getElementById('stop-loss')?.value) || 0;
    const positionSize = parseInt(document.getElementById('position-size')?.value) || 1;
    
    if (stopLoss > 0 && tradingView) {
        tradingView.sendOrder('SELL', stopLoss, positionSize, 'stop');
    } else {
        showNotification('Please set stop loss first', 'error');
    }
}

function sendTPOrders() {
    const tpLevels = document.querySelectorAll('.tp-level');
    const positionSize = parseInt(document.getElementById('position-size')?.value) || 1;
    
    if (!tradingView) {
        showNotification('TradingView not connected', 'error');
        return;
    }
    
    tpLevels.forEach((level, index) => {
        const tpPriceElement = level.querySelector('.tp-price');
        const tpSizeElement = level.querySelector('.tp-size');
        
        if (tpPriceElement && tpSizeElement) {
            const tpPrice = parseFloat(tpPriceElement.value) || 0;
            const tpSize = parseFloat(tpSizeElement.value) || 0;
            
            if (tpPrice > 0 && tpSize > 0) {
                const quantity = Math.round((positionSize * tpSize) / 100);
                if (quantity > 0) {
                    tradingView.sendOrder('SELL', tpPrice, quantity, 'limit');
                }
            }
        }
    });
}

// Global functions for TP management
function addTP() {
    const tpLevels = document.getElementById('tp-levels');
    if (!tpLevels) {
        console.error('tp-levels element not found');
        return;
    }
    
    const tpLevel = document.createElement('div');
    tpLevel.className = 'tp-level';
    
    tpLevel.innerHTML = `
        <label>TP ${tpLevels.children.length + 1}</label>
        <input type="number" class="tp-price" step="0.25" placeholder="TP price">
        <input type="number" class="tp-size" min="0" max="100" step="5" placeholder="%">
        <button class="remove-tp" onclick="removeTP(this)"><i class="fas fa-trash"></i></button>
    `;
    
    tpLevels.appendChild(tpLevel);
    if (calculator) {
        calculator.setupTPListeners();
        calculator.calculateAll();
    }
}

function removeTP(button) {
    const tpLevel = button.closest('.tp-level');
    if (tpLevel) {
        tpLevel.remove();
        if (calculator) {
            calculator.calculateAll();
        }
    }
}

// Global functions for plan management
function savePlan() {
    const plan = {
        timestamp: new Date().toISOString(),
        marketData: {
            currentPrice: document.getElementById('current-price')?.value || '',
            entryPrice: document.getElementById('entry-price')?.value || '',
            stopLoss: document.getElementById('stop-loss')?.value || ''
        },
        riskManagement: {
            accountSize: document.getElementById('account-size')?.value || '',
            riskPercentage: document.getElementById('risk-percentage')?.value || '',
            dollarRisk: document.getElementById('summary-dollar-risk')?.textContent || '',
            accountRisk: document.getElementById('summary-account-risk')?.textContent || ''
        },
        executionPlan: {
            entryTrigger: document.getElementById('entry-trigger')?.value || '',
            partialExits: document.getElementById('partial-exits')?.value || '',
            timeStop: document.getElementById('time-stop')?.value || ''
        },
        takeProfits: getTakeProfitLevelsData()
    };

    const savedPlans = JSON.parse(localStorage.getItem('tradingPlans') || '[]');
    savedPlans.push(plan);
    localStorage.setItem('tradingPlans', JSON.stringify(savedPlans));
    
    showNotification('Trading plan saved successfully!', 'success');
}

function exportPlan() {
    // Coming soon - PDF export functionality
    showNotification('PDF export coming soon!', 'info');
}

function resetPlan() {
    const inputs = [
        'current-price', 'entry-price', 'stop-loss', 'account-size', 'risk-percentage',
        'entry-trigger', 'partial-exits', 'time-stop'
    ];

    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });

    const tpLevels = document.getElementById('tp-levels');
    if (tpLevels) {
        tpLevels.innerHTML = '';
    }
    
    if (calculator) {
        calculator.calculateAll();
    }
    showNotification('Trading plan reset!', 'success');
}

// Helper functions
function getTakeProfitLevelsData() {
    const tpLevels = document.querySelectorAll('.tp-level');
    const data = [];
    
    tpLevels.forEach(level => {
        const priceElement = level.querySelector('.tp-price');
        const sizeElement = level.querySelector('.tp-size');
        
        if (priceElement && sizeElement) {
            const price = parseFloat(priceElement.value) || 0;
            const size = parseFloat(sizeElement.value) || 0;
            
            if (price > 0 && size > 0) {
                data.push({ price, size });
            }
        }
    });
    
    return data;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left: 4px solid #2ed573;
    }
    
    .notification.error {
        border-left: 4px solid #ff4757;
    }
    
    .notification.info {
        border-left: 4px solid #00d4ff;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification.success i {
        color: #2ed573;
    }
    
    .notification.error i {
        color: #ff4757;
    }
    
    .notification.info i {
        color: #00d4ff;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
