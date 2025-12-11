// Main App Controller - Handles screen navigation and app initialization

class App {
    constructor() {
        this.currentScreen = 'home-screen';
        this.screens = ['home-screen', 'spectating-screen', 'log-screen'];
        this.navItems = document.querySelectorAll('.nav-item');

        this.init();
    }

    init() {
        // Set up navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const screenId = item.dataset.screen;
                this.navigateToScreen(screenId);
            });
        });

        // Show initial screen
        this.showScreen(this.currentScreen);

        // Log app initialization
        console.log('Spectator App initialized');
        console.log('Web Bluetooth supported:', bleManager.isSupported());
    }

    navigateToScreen(screenId) {
        if (!this.screens.includes(screenId)) {
            console.error('Invalid screen:', screenId);
            return;
        }

        // Hide all screens
        this.screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // Show target screen
        this.showScreen(screenId);

        // Update navigation
        this.updateNavigation(screenId);

        // Update current screen
        this.currentScreen = screenId;

        // Trigger screen-specific actions
        this.onScreenChange(screenId);
    }

    showScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }
    }

    updateNavigation(screenId) {
        this.navItems.forEach(item => {
            if (item.dataset.screen === screenId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    onScreenChange(screenId) {
        // Perform actions when screen changes
        switch (screenId) {
            case 'log-screen':
                // Refresh log screen when navigating to it
                if (typeof logScreen !== 'undefined') {
                    logScreen.refreshSessionList();
                }
                break;
            case 'home-screen':
                // Update connection status
                if (typeof homeScreen !== 'undefined') {
                    const status = bleManager.getConnectionStatus();
                    homeScreen.updateConnectionStatus(status.isConnected, status.deviceName);
                }
                break;
        }
    }

    getCurrentScreen() {
        return this.currentScreen;
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new App();
    });
} else {
    app = new App();
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
