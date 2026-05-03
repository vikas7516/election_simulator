import { AudioMixin } from './audio.js';
import { UIMixin } from './ui.js';
import { fetchMasterData, fetchElectionStory, generateGeminiContentBulk } from './services.js';

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
        setTimeout(() => note.remove(), 4000);
    }

    // ── CHOICE HANDLER ───────────────────────────────────────────────────
    /**
     * Evaluates a user's choice and displays the feedback panel.
     * @param {number} idx - The index of the selected choice.
     */
    handleChoice(idx) {
        this.initAudio();
        const scene = this.state.story[this.state.sceneIndex];
        const choice = scene.choices[idx];
        const wrap = this.app.querySelector('.vn-container');

        wrap.querySelector('#choices-overlay').style.display = 'none';

        if (choice.isCorrect) this.playCorrect();
        else this.playWrong();

        const fp = wrap.querySelector('#feedback-panel');
        fp.className = `feedback-panel ${choice.isCorrect ? 'correct' : 'wrong'}`;
        fp.style.display = 'flex';
        fp.innerHTML = DOMPurify.sanitize(`
            <div class="feedback-title">${choice.isCorrect ? '✅ CORRECT!' : '❌ WRONG MOVE!'}</div>
            <div class="feedback-text">${choice.feedback}</div>
            ${choice.isCorrect
                ? `<button class="btn-next" id="btn-next">NEXT SCENE ➜</button>`
                : `<button class="btn-next" id="btn-retry" style="box-shadow:3px 3px 0 var(--red)">TRY AGAIN ↩</button>`
            }
        `);

        const nextBtn = fp.querySelector('#btn-next');
        if (nextBtn) nextBtn.onclick = () => this.nextScene();

        const retryBtn = fp.querySelector('#btn-retry');
        if (retryBtn) retryBtn.onclick = () => {
            fp.style.display = 'none';
            wrap.querySelector('#choices-overlay').style.display = 'flex';
        };
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
        }, 400);

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
        }, 500);
    }

    // ── EVENT LISTENERS ──────────────────────────────────────────────────
    attachListeners() {
        const startBtn = document.getElementById('btn-start-playing');
        if (startBtn) startBtn.onclick = () => { this.initAudio(); this.playStart(); this.setState({ screen: 'MENU_ELECTION' }); };

        this.app.querySelectorAll('.election-btn').forEach(b => {
            b.onclick = async () => {
                this.initAudio(); this.playStart();
                const elKey = b.dataset.election;
                const elData = this.data.ELECTIONS[elKey];
                const originalText = b.textContent;
                b.textContent = 'Loading...';
                
                try {
                    const stories = await this.loadElectionData(elKey);
                    if (elData.directRole) {
                        await this.startRole(elData.directRole, stories[elData.directRole], elKey);
                    } else {
                        this.setState({ election: elKey, screen: 'MENU_ROLE' });
                    }
                } catch (e) {
                    this.showNotification('Could not load election data. Please try again.', 'error');
                    b.textContent = originalText;
                }
            };
        });

        this.app.querySelectorAll('.role-btn').forEach(b => {
            b.onclick = async () => {
                this.initAudio(); this.playStart();
                const role = b.dataset.role;
                const stories = this.storyCache[this.state.election];
                const story = stories[role];
                await this.startRole(role, story, this.state.election);
            };
        });

        const back = document.getElementById('btn-back');
        if (back) back.onclick = () => { this.playClick(); this.setState({ screen: 'MENU_ELECTION' }); };

        const restart = document.getElementById('btn-restart');
        if (restart) restart.onclick = () => { this.playClick(); this.setState({ screen: 'MENU_ELECTION', election: null, role: null }); };

        const leave = document.getElementById('btn-leave');
        if (leave) leave.onclick = () => {
            this.playClick();
            this.showExitModal();
        };

        // Add hover sounds to all buttons
        this.app.querySelectorAll('button').forEach(b => {
            b.onmouseenter = () => this.playHover();
        });

        // Keyboard navigation — use addEventListener for cleaner code quality
        this._onKeydown = (e) => {
            if (this.state.screen === 'SIMULATION') {
                const overlay = document.getElementById('choices-overlay');
                const fp = document.getElementById('feedback-panel');
                
                if (overlay && overlay.style.display !== 'none') {
                    const num = parseInt(e.key);
                    if (num >= 1 && num <= 4) {
                        const btns = overlay.querySelectorAll('.choice-btn');
                        if (btns[num - 1]) btns[num - 1].click();
                    }
                } else if (fp && fp.style.display !== 'none') {
                    if (e.key === 'Enter') {
                        const nextBtn = fp.querySelector('#btn-next') || fp.querySelector('#btn-retry');
                        if (nextBtn) nextBtn.click();
                    }
                } else {
                    if (e.key === 'Enter') {
                        const contBtn = document.getElementById('btn-dialog-continue');
                        if (contBtn && contBtn.style.display !== 'none') contBtn.click();
                    }
                }
            }
        };
        document.addEventListener('keydown', this._onKeydown);
    }
}

// Wire the modular pieces together
Object.assign(ElectionSimulator.prototype, AudioMixin, UIMixin);

document.addEventListener('DOMContentLoaded', () => new ElectionSimulator());
