// Log Screen Controller

class LogScreen {
    constructor() {
        this.sessionList = document.getElementById('session-list');
        this.emptyState = document.getElementById('empty-state');
        this.modal = document.getElementById('session-detail-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.closeModalBtn = document.getElementById('close-modal');

        this.init();
    }

    init() {
        // Close modal button
        this.closeModalBtn.addEventListener('click', () => this.closeModal());

        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Refresh session list when screen becomes active
        this.refreshSessionList();
    }

    refreshSessionList() {
        const sessions = dataManager.getAllSessions();

        // Sort by date (newest first)
        sessions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        if (sessions.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            this.renderSessionList(sessions);
        }
    }

    renderSessionList(sessions) {
        this.sessionList.innerHTML = '';

        sessions.forEach(session => {
            const card = this.createSessionCard(session);
            this.sessionList.appendChild(card);
        });
    }

    createSessionCard(session) {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.addEventListener('click', () => this.showSessionDetail(session.id));

        const date = dataManager.formatDate(session.dateTime);
        const time = dataManager.formatTime(session.dateTime);
        const status = session.status === 'active' ? '観戦中' : '終了';

        card.innerHTML = `
            <div class="session-card-header">
                <div>
                    <div class="session-date">${date}</div>
                    <div class="session-time">${time} 開始 • ${status}</div>
                </div>
            </div>
            <div class="session-card-stats">
                <div class="session-stat">
                    <div class="session-stat-value">${session.tapCountTotal || 0}</div>
                    <div class="session-stat-label">叩き回数</div>
                </div>
                <div class="session-stat">
                    <div class="session-stat-value">${session.chanceCountTotal || 0}</div>
                    <div class="session-stat-label">チャンス</div>
                </div>
            </div>
        `;

        return card;
    }

    showSessionDetail(sessionId) {
        const stats = dataManager.getSessionStatistics(sessionId);

        if (!stats) {
            console.error('Session not found');
            return;
        }

        const session = stats.session;
        const events = dataManager.getSessionEvents(sessionId);

        // Build detail HTML
        const detailHTML = `
            <div class="session-detail">
                <div class="detail-section">
                    <h3>基本情報</h3>
                    <div class="detail-row">
                        <span class="detail-label">開始時刻</span>
                        <span class="detail-value">${dataManager.formatDateTime(session.dateTime)}</span>
                    </div>
                    ${session.endTime ? `
                        <div class="detail-row">
                            <span class="detail-label">終了時刻</span>
                            <span class="detail-value">${dataManager.formatDateTime(new Date(session.endTime).toISOString())}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">観戦時間</span>
                            <span class="detail-value">${stats.durationFormatted}</span>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">デバイス</span>
                        <span class="detail-value">${session.deviceName || '不明'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">状態</span>
                        <span class="detail-value">${session.status === 'active' ? '観戦中' : '終了'}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>統計</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-card-value">${stats.tapCount}</div>
                            <div class="stat-card-label">叩き回数</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-value">${stats.chanceCount}</div>
                            <div class="stat-card-label">チャンス</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-value">${stats.pinchCount}</div>
                            <div class="stat-card-label">ピンチ</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-card-value">${stats.normalCount}</div>
                            <div class="stat-card-label">通常</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>イベントタイムライン</h3>
                    <div class="timeline">
                        ${this.renderTimeline(events)}
                    </div>
                </div>
            </div>
        `;

        this.modalTitle.textContent = '観戦詳細';
        this.modalBody.innerHTML = detailHTML;
        this.openModal();
    }

    renderTimeline(events) {
        if (events.length === 0) {
            return '<p style="color: var(--color-text-secondary); text-align: center;">イベントがありません</p>';
        }

        // Sort events by timestamp (newest first)
        events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit to recent 50 events
        const recentEvents = events.slice(0, 50);

        return recentEvents.map(event => {
            const time = dataManager.formatTime(event.timestamp);
            const icon = this.getEventIcon(event.type);
            const label = this.getEventLabel(event.type);

            return `
                <div class="timeline-item">
                    <div class="timeline-icon">${icon}</div>
                    <div class="timeline-content">
                        <div class="timeline-label">${label}</div>
                        <div class="timeline-time">${time}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getEventIcon(type) {
        switch (type) {
            case 'tap':
                return '👏';
            case 'chance':
                return '🔥';
            case 'pinch':
                return '💪';
            case 'normal':
                return '😌';
            default:
                return '•';
        }
    }

    getEventLabel(type) {
        switch (type) {
            case 'tap':
                return '叩きイベント';
            case 'chance':
                return 'チャンス送信';
            case 'pinch':
                return 'ピンチ送信';
            case 'normal':
                return '通常送信';
            default:
                return 'イベント';
        }
    }

    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    showEmptyState() {
        this.emptyState.classList.add('visible');
        this.sessionList.style.display = 'none';
    }

    hideEmptyState() {
        this.emptyState.classList.remove('visible');
        this.sessionList.style.display = 'flex';
    }
}

// Add CSS for session detail modal content
const style = document.createElement('style');
style.textContent = `
    .session-detail {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
    }

    .detail-section h3 {
        font-size: 1rem;
        margin-bottom: var(--spacing-md);
        color: var(--color-text-primary);
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .detail-label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    .detail-value {
        font-size: 0.875rem;
        color: var(--color-text-primary);
        font-weight: 500;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
    }

    .stat-card {
        background: var(--color-surface);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        text-align: center;
    }

    .stat-card-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin-bottom: var(--spacing-xs);
    }

    .stat-card-label {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
    }

    .timeline {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
        max-height: 300px;
        overflow-y: auto;
    }

    .timeline-item {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-sm);
        background: var(--color-surface);
        border-radius: var(--radius-sm);
    }

    .timeline-icon {
        font-size: 1.25rem;
        line-height: 1;
    }

    .timeline-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .timeline-label {
        font-size: 0.875rem;
        color: var(--color-text-primary);
    }

    .timeline-time {
        font-size: 0.75rem;
        color: var(--color-text-tertiary);
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
let logScreen;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        logScreen = new LogScreen();
    });
} else {
    logScreen = new LogScreen();
}
