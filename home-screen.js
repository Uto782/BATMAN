// Home Screen Controller

class HomeScreen {
    constructor() {
        this.connectBtn = document.getElementById('connect-btn');
        this.startSessionBtn = document.getElementById('start-session-btn');
        this.connectionStatus = document.getElementById('connection-status');
        this.deviceNameDisplay = document.getElementById('device-name');
        this.connectionIndicator = document.querySelector('.status-dot');

        this.init();
    }

    init() {
        // Set up event listeners
        this.connectBtn.addEventListener('click', () => this.handleConnect());
        this.startSessionBtn.addEventListener('click', () => this.handleStartSession());

        // Listen for BLE connection changes
        bleManager.onConnectionChange = (isConnected, deviceName) => {
            this.updateConnectionStatus(isConnected, deviceName);
        };

        // Update initial status
        const status = bleManager.getConnectionStatus();
        this.updateConnectionStatus(status.isConnected, status.deviceName);
    }

    async handleConnect() {
        try {
            this.connectBtn.disabled = true;
            this.connectBtn.textContent = '接続中...';

            const result = await bleManager.connect();

            if (result.success) {
                this.showFeedback('接続しました！', 'success');
            }

        } catch (error) {
            console.error('Connection error:', error);

            const supportInfo = bleManager.getSupportInfo();
            let errorMessage = '接続に失敗しました';

            if (error.name === 'NotFoundError') {
                errorMessage = 'デバイスが見つかりませんでした';
            } else if (error.name === 'SecurityError') {
                errorMessage = 'HTTPS接続が必要です';
            } else if (error.message.includes('not supported')) {
                // Detailed browser-specific guidance
                if (supportInfo.isIOS) {
                    if (supportInfo.isSafari) {
                        errorMessage = 'iOSのSafariは非対応です\n\n【対応方法】\n1. Bluefy（無料アプリ）をインストール\n2. またはChrome for iOSを使用\n\n※iOS 16以降でも実験的機能の有効化が必要';
                    } else {
                        errorMessage = 'このブラウザは非対応です\n\nBluefy（無料アプリ）の使用を推奨します';
                    }
                } else if (supportInfo.isAndroid) {
                    errorMessage = 'このブラウザは非対応です\n\nChromeブラウザをご利用ください';
                } else {
                    errorMessage = 'このブラウザはBluetooth非対応です\n\nChrome、Edge、またはBluefy（iOS）をご利用ください';
                }
            }

            this.showFeedback(errorMessage, 'error');

        } finally {
            this.connectBtn.disabled = false;
            this.connectBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
                デバイスに接続
            `;
        }
    }

    updateConnectionStatus(isConnected, deviceName) {
        if (isConnected) {
            this.connectionStatus.textContent = '接続中';
            this.deviceNameDisplay.textContent = deviceName || '不明なデバイス';
            this.connectionIndicator.classList.remove('disconnected');
            this.connectionIndicator.classList.add('connected');
            this.startSessionBtn.disabled = false;
        } else {
            this.connectionStatus.textContent = '未接続';
            this.deviceNameDisplay.textContent = '—';
            this.connectionIndicator.classList.remove('connected');
            this.connectionIndicator.classList.add('disconnected');
            this.startSessionBtn.disabled = true;
        }
    }

    handleStartSession() {
        const status = bleManager.getConnectionStatus();

        if (!status.isConnected) {
            this.showFeedback('デバイスに接続してください', 'error');
            return;
        }

        // Create new session
        const session = dataManager.createSession(status.deviceName);

        // Store current session ID globally
        window.currentSessionId = session.id;

        // Navigate to spectating screen
        app.navigateToScreen('spectating-screen');

        // Initialize spectating screen
        spectatingScreen.startSession(session);

        this.showFeedback('観戦を開始しました！', 'success');
    }

    showFeedback(message, type) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = `feedback feedback-${type}`;

        // Handle multi-line messages
        const lines = message.split('\n');
        lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line;
            p.style.margin = index === 0 ? '0' : '0.5rem 0 0 0';
            if (line.startsWith('【') || line.startsWith('※')) {
                p.style.fontSize = '0.875rem';
                p.style.marginTop = '0.75rem';
            }
            if (line.match(/^\d+\./)) {
                p.style.fontSize = '0.875rem';
                p.style.textAlign = 'left';
                p.style.marginLeft = '1rem';
            }
            feedback.appendChild(p);
        });

        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
            line-height: 1.5;
        `;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 5000); // Extended to 5 seconds for longer messages
    }
}

// Initialize when DOM is ready
let homeScreen;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        homeScreen = new HomeScreen();
    });
} else {
    homeScreen = new HomeScreen();
}
