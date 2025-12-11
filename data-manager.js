// Data Manager - Handles session and event storage using localStorage

class DataManager {
    constructor() {
        this.SESSIONS_KEY = 'spectator_sessions';
        this.EVENTS_KEY = 'spectator_events';
    }

    // Session Management
    createSession(deviceName = null) {
        const session = {
            id: this.generateId(),
            dateTime: new Date().toISOString(),
            deviceName: deviceName,
            gameTitle: null,
            tapCountTotal: 0,
            chanceCountTotal: 0,
            pinchCountTotal: 0,
            normalCountTotal: 0,
            status: 'active',
            startTime: Date.now()
        };

        const sessions = this.getAllSessions();
        sessions.push(session);
        this.saveSessions(sessions);

        return session;
    }

    updateSession(sessionId, updates) {
        const sessions = this.getAllSessions();
        const index = sessions.findIndex(s => s.id === sessionId);

        if (index !== -1) {
            sessions[index] = { ...sessions[index], ...updates };
            this.saveSessions(sessions);
            return sessions[index];
        }

        return null;
    }

    endSession(sessionId) {
        return this.updateSession(sessionId, {
            status: 'completed',
            endTime: Date.now()
        });
    }

    getSession(sessionId) {
        const sessions = this.getAllSessions();
        return sessions.find(s => s.id === sessionId);
    }

    getAllSessions() {
        const data = localStorage.getItem(this.SESSIONS_KEY);
        return data ? JSON.parse(data) : [];
    }

    saveSessions(sessions) {
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    }

    // Event Logging
    logEvent(sessionId, type, data = {}) {
        const event = {
            id: this.generateId(),
            sessionId: sessionId,
            timestamp: new Date().toISOString(),
            timestampMs: Date.now(),
            type: type,
            data: data
        };

        const events = this.getAllEvents();
        events.push(event);
        this.saveEvents(events);

        // Update session totals
        this.updateSessionTotals(sessionId, type);

        return event;
    }

    updateSessionTotals(sessionId, eventType) {
        const session = this.getSession(sessionId);
        if (!session) return;

        const updates = {};

        switch (eventType) {
            case 'tap':
                updates.tapCountTotal = (session.tapCountTotal || 0) + 1;
                break;
            case 'chance':
                updates.chanceCountTotal = (session.chanceCountTotal || 0) + 1;
                break;
            case 'pinch':
                updates.pinchCountTotal = (session.pinchCountTotal || 0) + 1;
                break;
            case 'normal':
                updates.normalCountTotal = (session.normalCountTotal || 0) + 1;
                break;
        }

        this.updateSession(sessionId, updates);
    }

    getSessionEvents(sessionId) {
        const events = this.getAllEvents();
        return events.filter(e => e.sessionId === sessionId);
    }

    getAllEvents() {
        const data = localStorage.getItem(this.EVENTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    saveEvents(events) {
        localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
    }

    // Utility
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Statistics
    getSessionStatistics(sessionId) {
        const session = this.getSession(sessionId);
        const events = this.getSessionEvents(sessionId);

        if (!session) return null;

        const duration = session.endTime
            ? session.endTime - session.startTime
            : Date.now() - session.startTime;

        return {
            session: session,
            eventCount: events.length,
            duration: duration,
            durationFormatted: this.formatDuration(duration),
            tapCount: session.tapCountTotal || 0,
            chanceCount: session.chanceCountTotal || 0,
            pinchCount: session.pinchCountTotal || 0,
            normalCount: session.normalCountTotal || 0
        };
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem(this.SESSIONS_KEY);
        localStorage.removeItem(this.EVENTS_KEY);
    }
}

// Export for use in other scripts
const dataManager = new DataManager();
