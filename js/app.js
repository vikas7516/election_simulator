import { AudioMixin } from './audio.js';
import { UIMixin } from './ui.js';
import { fetchMasterData, fetchElectionStory, generateGeminiContentBulk } from './services.js';
import { TIMINGS, UI_CONFIG } from './constants.js';

/**
 * Core engine for the Indian Election Simulator.
 * Manages game state, user interactions, audio playback, and AI content generation.
 */
class ElectionSimulator {
    constructor() {
        this.app = document.getElementById('app');
        this.state = { screen: 'LOADING', election: null, role: null, sceneIndex: 0, story: [] };
        this.data = null;
        this.storyCache = {};
        this.audioCtx = null;
        this.render();
        this.loadData();
    }

    /**
     * Fetches the initial master data (elections and roles) from Firebase.
     * Transitions to the START screen upon success.
     */
    async loadData() {
        try {
            this.data = await fetchMasterData();
            this.setState({ screen: 'START' });
        } catch {
            this.app.innerHTML = DOMPurify.sanitize(`<div class="error-msg">
                Error: Could not load data from Firebase. Check your console.</div>`);
        }
    }

    /**
     * Loads narrative story data for a specific election tier.
     * @param {string} electionKey - The unique key for the election (e.g., 'LOK_SABHA').
     * @returns {Promise<Object>} The story data object.
     */
    async loadElectionData(electionKey) {
        if (this.storyCache[electionKey]) return this.storyCache[electionKey];
        const stories = await fetchElectionStory(electionKey);
        this.storyCache[electionKey] = stories;
        return stories;
    }

    /**
     * Updates the global state and triggers a re-render.
     * @param {Object} s - Partial state object to merge.
     */
    setState(s) { this.state = { ...this.state, ...s }; this.render(); }

    showNotification(msg, type = 'error') {
        const existing = document.getElementById('app-notification');
        if (existing) existing.remove();
        const note = document.createElement('div');
        note.id = 'app-notification';
        note.setAttribute('role', 'alert');
        note.setAttribute('aria-live', 'assertive');
        note.className = `notification-box ${type==='error'?'notification-error':'notification-info'}`;
        note.textContent = msg;
        document.body.appendChild(note);
        setTimeout(() => note.remove(), TIMINGS.NOTIFICATION_DISPLAY_TIME);
    }

    // ── CHOICE HANDLER ───────────────────────────────────────────────────
    /**
     * Evaluates a user's choice and displays the feedback panel.
     * @param {number} idx - The index of the selected choice.
     */
    handleChoice(idx) {
        // Defensive checks to prevent crashes
        if (!this.state.story || !Array.isArray(this.state.story)) return;
        
        const scene = this.state.story[this.state.sceneIndex];
        if (!scene || !Array.isArray(scene.choices) || idx < 0 || idx >= scene.choices.length) return;
        
        const choice = scene.choices[idx];
        const wrap = this.app.querySelector('.vn-container');
        if (!wrap) return;

        const overlay = wrap.querySelector('#choices-overlay');
        if (overlay) overlay.classList.add('d-none');

        if (choice.isCorrect) this.playCorrect();
        else this.playWrong();

        const fp = wrap.querySelector('#feedback-panel');
        if (!fp) {
            return;
        }
        
        this.initAudio();
        fp.className = `feedback-panel ${choice.isCorrect ? 'correct' : 'wrong'}`;
        fp.classList.remove('d-none');
        fp.innerHTML = DOMPurify.sanitize(`
            <div class="feedback-title">${choice.isCorrect ? '✅ CORRECT!' : '❌ WRONG MOVE!'}</div>
            <div class="feedback-text">${choice.feedback}</div>
            ${choice.isCorrect
                ? `<button class="btn-next" id="btn-next">NEXT SCENE ➜</button>`
                : `<button class="btn-next btn-retry-shadow" id="btn-retry">TRY AGAIN ↩</button>`
            }
        `);

        const nextBtn = fp.querySelector('#btn-next');
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextScene());

        const retryBtn = fp.querySelector('#btn-retry');
        if (retryBtn) retryBtn.addEventListener('click', () => {
            fp.classList.add('d-none');
            wrap.querySelector('#choices-overlay').classList.remove('d-none');
        });
    }

    nextScene() {
        const next = this.state.sceneIndex + 1;
        if (next < this.state.story.length) {
            this.setState({ sceneIndex: next });
        } else {
            this.playFinish();
            this.setState({ screen: 'END' });
        }
    }

    /**
     * Initializes a specific role for a chosen election and fetches AI-generated scenarios.
     * @param {string} role - The role ID (voter, candidate, etc.).
     * @param {Array} story - The base story array.
     * @param {string} electionKey - The election ID.
     */
    async startRole(role, story, electionKey) {
        if (!story || story.length === 0) {
            this.showNotification('This story is coming soon! Check back later.', 'info');
            return;
        }

        // Show a loading screen with progress bar
        this.app.innerHTML = DOMPurify.sanitize(`<div class="screen"><div class="start-content">
            <h1 class="text-center mt-20vh">⚡ GENERATING ROLE WITH AI...</h1>
            <p class="text-center">Crafting scenarios, choices, and civic feedback...</p>
            <div class="ai-progress-track">
                <div id="ai-progress-bar" class="ai-progress-bar"></div>
            </div>
        </div></div>`);
        
        // Simulate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            const bar = document.getElementById('ai-progress-bar');
            if (bar) {
                const step = Math.floor(progress / 20) * 20;
                bar.setAttribute('data-progress', step.toString());
            }
        }, TIMINGS.AI_LOADING_PROGRESS_INTERVAL);

        // Fetch bulk choices
        const generated = await generateGeminiContentBulk(story);
        
        clearInterval(progressInterval);
        const bar = document.getElementById('ai-progress-bar');
        if (bar) bar.setAttribute('data-progress', '100');
        
        // Override local story with AI choices if available
        story.forEach((scene, i) => {
            if (generated && generated[i]) {
                scene.choices = generated[i].choices;
                if (generated[i].didYouKnow) {
                    scene.fact = generated[i].didYouKnow;
                }
            }
        });

        setTimeout(() => {
            this.setState({ election: electionKey, role, story, sceneIndex: 0, screen: 'SIMULATION' });
        }, TIMINGS.AI_LOADING_DELAY);
    }

    // ── EVENT LISTENERS ──────────────────────────────────────────────────
    initKeyboardGlobal() {
        this._onKeydown = (e) => {
            if (this.state.screen !== 'SIMULATION') return;

            const overlay = document.getElementById('choices-overlay');
            const fp = document.getElementById('feedback-panel');
            
            // 1. Handle Choice Selection (1-4)
            if (overlay && !overlay.classList.contains('d-none')) {
                const num = parseInt(e.key);
                if (num >= UI_CONFIG.CHOICE_KEY_START && num <= UI_CONFIG.CHOICE_KEYS_MAX) {
                    const btns = overlay.querySelectorAll('.choice-btn');
                    const chosenBtn = btns[num - UI_CONFIG.CHOICE_KEY_START];
                    if (chosenBtn) chosenBtn.click();
                }
            } 
            // 2. Handle Feedback/Dialog Continuation (Enter)
            else if (e.key === 'Enter') {
                if (fp && !fp.classList.contains('d-none')) {
                    const nextBtn = fp.querySelector('#btn-next') || fp.querySelector('#btn-retry');
                    if (nextBtn) nextBtn.click();
                } else {
                    const contBtn = document.getElementById('btn-dialog-continue');
                    if (contBtn && !contBtn.classList.contains('d-none')) contBtn.click();
                }
            }
        };
        document.addEventListener('keydown', this._onKeydown);
    }

    attachListeners() {
        const startBtn = document.getElementById('btn-start-playing');
        if (startBtn) startBtn.addEventListener('click', () => { 
            this.initAudio(); 
            this.playStart(); 
            this.setState({ screen: 'MENU_ELECTION' }); 
        });

        this.app.querySelectorAll('.election-btn').forEach(b => {
            b.addEventListener('click', async () => {
                if (b.disabled) return;
                this.initAudio(); 
                this.playStart();
                
                const elKey = b.dataset.election;
                const elData = this.data.ELECTIONS[elKey];
                const originalText = b.innerHTML;
                
                b.disabled = true;
                b.innerHTML = `<span class="spinner"></span> Loading...`;
                
                try {
                    const stories = await this.loadElectionData(elKey);
                    if (elData.directRole) {
                        await this.startRole(elData.directRole, stories[elData.directRole], elKey);
                    } else {
                        this.setState({ election: elKey, screen: 'MENU_ROLE' });
                    }
                } catch {
                    this.showNotification('Could not load election data. Please try again.', 'error');
                    b.disabled = false;
                    b.innerHTML = originalText;
                }
            });
        });

        this.app.querySelectorAll('.role-btn').forEach(b => {
            b.addEventListener('click', async () => {
                this.initAudio(); this.playStart();
                const role = b.dataset.role;
                const stories = this.storyCache[this.state.election];
                const story = stories[role];
                await this.startRole(role, story, this.state.election);
            });
        });

        const back = document.getElementById('btn-back');
        if (back) back.addEventListener('click', () => { this.playClick(); this.setState({ screen: 'MENU_ELECTION' }); });

        const restart = document.getElementById('btn-restart');
        if (restart) restart.addEventListener('click', () => { this.playClick(); this.setState({ screen: 'MENU_ELECTION', election: null, role: null }); });

        const leave = document.getElementById('btn-leave');
        if (leave) leave.addEventListener('click', () => {
            this.playClick();
            this.showExitModal();
        });

        // Add hover sounds to all buttons
        this.app.querySelectorAll('button').forEach(b => {
            b.addEventListener('mouseenter', () => this.playHover());
        });
    }
}

// Wire the modular pieces together
Object.assign(ElectionSimulator.prototype, AudioMixin, UIMixin);

document.addEventListener('DOMContentLoaded', () => {
    const sim = new ElectionSimulator();
    sim.initKeyboardGlobal();
});
