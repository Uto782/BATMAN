// Spectating Screen Controller

class SpectatingScreen {
    constructor() {
        this.sessionStartTime = document.getElementById('session-start-time');
        this.sessionDeviceName = document.getElementById('session-device-name');
        this.tapCount = document.getElementById('tap-count');
        this.chanceCount = document.getElementById('chance-count');
        this.pinchCount = document.getElementById('pinch-count');
        this.endSessionBtn = document.getElementById('end-session-btn');

        this.normalBtn = document.getElementById('normal-btn');
        this.chanceBtn = document.getElementById('chance-btn');
        this.pinchBtn = document.getElementById('pinch-btn');

        this.currentSession = null;
        this.currentCounts = {
            tap: 0,
            chance: 0,
            pinch: 0,
            normal: 0
        };

        this.init();
    }

    init() {
        // Set up status button listeners
        this.normalBtn.addEventListener('click', () => this.handleStatusButton('normal', 0));
        this.chanceBtn.addEventListener('click', () => this.handleStatusButton('chance', 1));
        this.pinchBtn.addEventListener('click', () => this.handleStatusButton('pinch', 2));

        // End session button
        this.endSessionBtn.addEventListener('click', () => this.handleEndSession());

        // Listen for tap events from BLE
        bleManager.onTapReceived = () => this.handleTapEvent();
    }

    startSession(session) {
        this.currentSession = session;
        this.currentCounts = {
            tap: 0,
            chance: 0,
            pinch: 0,
            normal: 0
        };

        // Update UI
        this.sessionStartTime.textContent = dataManager.formatTime(session.dateTime);
        this.sessionDeviceName.textContent = session.deviceName || '不明なデバイス';
        this.tapCount.textContent = '0';
        this.chanceCount.textContent = '0';
        this.pinchCount.textContent = '0';

        // Reset button states
        this.resetButtonStates();
    }

    async handleStatusButton(type, patternId) {
        if (!this.currentSession) {
            console.error('No active session');
            return;
        }

        try {
            // Send pattern to device
            await bleManager.sendPattern(patternId);

            // Log event
            dataManager.logEvent(this.currentSession.id, type);

            // Update counts
            this.currentCounts[type]++;

            // Update UI
            if (type === 'chance') {
                this.chanceCount.textContent = this.currentCounts.chance;
            } else if (type === 'pinch') {
                this.pinchCount.textContent = this.currentCounts.pinch;
            }

            // Visual feedback
            this.showButtonFeedback(type);

        } catch (error) {
            console.error('Failed to send pattern:', error);
            this.showError('送信に失敗しました');
        }
    }

    showButtonFeedback(type) {
        // Remove active state from all buttons
        this.normalBtn.classList.remove('active');
        this.chanceBtn.classList.remove('active');
        this.pinchBtn.classList.remove('active');

        // Add active state to clicked button
        let button;
        switch (type) {
            case 'normal':
                button = this.normalBtn;
                break;
            case 'chance':
                button = this.chanceBtn;
                break;
            case 'pinch':
                button = this.pinchBtn;
                break;
        }

        if (button) {
            button.classList.add('active');

            // Remove active state after animation
            setTimeout(() => {
                button.classList.remove('active');
            }, 500);
        }
    }

    handleTapEvent() {
        if (!this.currentSession) {
            console.error('No active session');
            return;
        }

        // Log tap event
        dataManager.logEvent(this.currentSession.id, 'tap');

        // Update count
        this.currentCounts.tap++;
        this.tapCount.textContent = this.currentCounts.tap;

        // Animate counter
        this.animateCounter(this.tapCount);
    }

    animateCounter(element) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }

    handleEndSession() {
        if (!this.currentSession) {
            console.error('No active session');
            return;
        }

        // Confirm end session
        if (!confirm('観戦を終了しますか?')) {
            return;
        }

        // End session in data manager
        dataManager.endSession(this.currentSession.id);

        // Clear current session
        this.currentSession = null;
        this.currentCounts = {
            tap: 0,
            chance: 0,
            pinch: 0,
            normal: 0
        };

        // Navigate to log screen
        app.navigateToScreen('log-screen');

        // Refresh log screen
        logScreen.refreshSessionList();

        this.showSuccess('観戦を終了しました');
    }

    resetButtonStates() {
        this.normalBtn.classList.remove('active');
        this.chanceBtn.classList.remove('active');
        this.pinchBtn.classList.remove('active');
    }

    showError(message) {
        this.showFeedback(message, 'error');
    }

    showSuccess(message) {
        this.showFeedback(message, 'success');
    }

    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.className = `feedback feedback-${type}`;
        feedback.textContent = message;
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
        `;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
let spectatingScreen;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        spectatingScreen = new SpectatingScreen();
    });
} else {
    spectatingScreen = new SpectatingScreen();
}
