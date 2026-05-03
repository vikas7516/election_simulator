import { AudioMixin } from './audio.js';
import { UIMixin } from './ui.js';
import { fetchMasterData, fetchElectionStory, generateGeminiContentBulk } from './services.js';

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

    async loadData() {
        try {
            this.data = await fetchMasterData();
            this.setState({ screen: 'START' });
        } catch {
            this.app.innerHTML = DOMPurify.sanitize(`<div style="padding:2rem;color:red;font-family:sans-serif">
                Error: Could not load data from Firebase. Check your console.</div>`);
        }
    }

    async loadElectionData(electionKey) {
        if (this.storyCache[electionKey]) return this.storyCache[electionKey];
        const file = this.data.ELECTIONS[electionKey].file;
        const stories = await fetchElectionStory(electionKey);
        this.storyCache[electionKey] = stories;
        return stories;
    }

    setState(s) { this.state = { ...this.state, ...s }; this.render(); }

    // ── CHOICE HANDLER ───────────────────────────────────────────────────
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

    async startRole(role, story, electionKey) {
        if (!story || story.length === 0) {
            alert('Story coming soon! Check back later.');
            return;
        }

        // Show a loading screen with progress bar
        this.app.innerHTML = DOMPurify.sanitize(`<div class="screen"><div class="start-content">
            <h1 style="text-align:center; margin-top:20vh;">⚡ GENERATING ROLE WITH AI...</h1>
            <p style="text-align:center;">Crafting scenarios, choices, and civic feedback...</p>
            <div style="width: 80%; max-width: 400px; height: 10px; background: #333; border-radius: 5px; margin: 20px auto; overflow: hidden;">
                <div id="ai-progress-bar" style="width: 0%; height: 100%; background: var(--green); transition: width 0.5s ease;"></div>
            </div>
        </div></div>`);
        
        // Simulate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            const bar = document.getElementById('ai-progress-bar');
            if (bar) bar.style.width = \`\${progress}%\`;
        }, 400);

        // Fetch bulk choices
        const generated = await generateGeminiContentBulk(story);
        
        clearInterval(progressInterval);
        const bar = document.getElementById('ai-progress-bar');
        if (bar) bar.style.width = '100%';
        
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
                const originalText = b.innerHTML;
                b.innerHTML = 'Loading...';
                
                try {
                    const stories = await this.loadElectionData(elKey);
                    if (elData.directRole) {
                        await this.startRole(elData.directRole, stories[elData.directRole], elKey);
                    } else {
                        this.setState({ election: elKey, screen: 'MENU_ROLE' });
                    }
                } catch (e) {
                    alert('Could not load election data.');
                    b.innerHTML = originalText;
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

        this.app.querySelectorAll('.choice-btn').forEach(b => {
            b.onclick = () => this.handleChoice(+b.dataset.index);
        });

        // Keyboard navigation
        document.onkeydown = (e) => {
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
                        const nextBtn = fp.querySelector('#btn-next');
                        const retryBtn = fp.querySelector('#btn-retry');
                        if (nextBtn) nextBtn.click();
                        else if (retryBtn) retryBtn.click();
                    }
                } else {
                    if (e.key === 'Enter') {
                        const contBtn = document.getElementById('btn-dialog-continue');
                        if (contBtn && contBtn.style.display !== 'none') contBtn.click();
                    }
                }
            }
        };
    }
}

// Wire the modular pieces together
Object.assign(ElectionSimulator.prototype, AudioMixin, UIMixin);

document.addEventListener('DOMContentLoaded', () => new ElectionSimulator());
