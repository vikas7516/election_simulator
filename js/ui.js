export const UIMixin = {
    // ── RENDER VISUAL CARD ──────────────────────────────────────────────
    renderVisual(v) {
        if (!v) return '';
        const accent = v.color ? `accent-${v.color}` : '';

        if (v.type === 'info_card') {
            return `<div class="visual-card ${accent}">
                <h3>${v.title}</h3>
                <ul>${v.items.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>`;
        }
        if (v.type === 'checklist') {
            return `<div class="visual-card ${accent}">
                <h3>${v.title}</h3>
                ${v.items.map(i => `<div class="checklist-item">
                    <span class="${i.check ? 'check-yes' : 'check-no'}">${i.check ? '✅' : '❌'}</span>
                    <span>${i.text}</span>
                </div>`).join('')}
            </div>`;
        }
        if (v.type === 'amount_card') {
            return `<div class="visual-card amount-card ${accent}">
                <h3>${v.label}</h3>
                <span class="amount-big">${v.amount}</span>
                ${v.note ? `<div class="amount-note">${v.note}</div>` : ''}
            </div>`;
        }
        if (v.type === 'stat_card') {
            return `<div class="visual-card stat-card ${accent}">
                <span class="stat-big" style="color:var(--${v.color||'cyan'})">${v.stat}</span>
                <span class="stat-label">${v.label}</span>
                ${v.context ? `<div class="stat-context">${v.context}</div>` : ''}
            </div>`;
        }
        if (v.type === 'stage_card') {
            return `<div class="visual-card ${accent}">
                <span class="stage-badge">${v.stage}</span>
                <h3>${v.title}</h3>
                <div class="stage-body">${v.body}</div>
            </div>`;
        }
        if (v.type === 'process_steps') {
            return `<div class="visual-card ${accent}">
                ${v.title ? `<h3>${v.title}</h3>` : ''}
                <ul class="steps-list">
                    ${v.steps.map((s, i) => `<li><span class="step-num">${i+1}</span><span>${s}</span></li>`).join('')}
                </ul>
            </div>`;
        }
        if (v.type === 'highlight_box') {
            return `<div class="visual-card highlight-box ${accent}">
                <h3>${v.title}</h3>
                <div class="hb-body">${v.body}</div>
            </div>`;
        }
        if (v.type === 'comparison_table') {
            const rows = Math.max(v.left.items.length, v.right.items.length);
            let trs = '';
            for (let i = 0; i < rows; i++) {
                trs += `<tr><td>${v.left.items[i]||''}</td><td>${v.right.items[i]||''}</td></tr>`;
            }
            return `<div class="visual-card ${accent}">
                <h3>${v.title}</h3>
                <table class="comp-table">
                    <tr><th>${v.left.label}</th><th>${v.right.label}</th></tr>
                    ${trs}
                </table>
            </div>`;
        }
        if (v.type === 'stat_card') {
            return `<div class="visual-card stat-card ${accent}">
                <span class="stat-big">${v.stat}</span>
                <span class="stat-label">${v.label}</span>
                ${v.context ? `<div class="stat-context">${v.context}</div>` : ''}
            </div>`;
        }
        if (v.type === 'timeline') {
            return `<div class="visual-card ${accent}">
                ${v.title ? `<h3>${v.title}</h3>` : ''}
                <ul class="timeline-list">
                    ${v.items.map(i => `<li><span class="tl-time">${i.time}</span><span class="tl-text">${i.text}</span></li>`).join('')}
                </ul>
            </div>`;
        }
        return '';
    },

    // ── MAIN RENDER ─────────────────────────────────────────────────────
    render() {
        if (!this.app) return;
        this.app.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'vn-container';

        const s = this.state;
        if (s.screen === 'LOADING') {
            wrap.innerHTML = `<div class="screen"><div class="screen-header">LOADING...</div></div>`;
        } else if (s.screen === 'START') {
            this.renderStartScreen(wrap);
        } else if (s.screen === 'MENU_ELECTION') {
            this.renderMenuElection(wrap);
        } else if (s.screen === 'MENU_ROLE') {
            this.renderMenuRole(wrap);
        } else if (s.screen === 'SIMULATION') {
            this.renderScene(wrap);
        } else if (s.screen === 'END') {
            this.renderEnd(wrap);
        }

        this.app.appendChild(wrap);
        this.attachListeners();
    },
    renderStartScreen(wrap) {
        wrap.innerHTML = `<div class="screen">
            <div style="max-width: 800px; text-align: center; display: flex; flex-direction: column; align-items: center;">
                <h1 style="font-family: 'Bangers', cursive; font-size: 4rem; color: var(--ink); margin-bottom: 20px; letter-spacing: 3px; line-height: 1.1;">INDIAN ELECTION SIMULATOR</h1>
                <p style="font-size: 1.2rem; line-height: 1.6; color: #333; margin-bottom: 20px; font-weight: 500;">
                    Experience the immense scale and depth of Indian Democracy. This interactive comic-style simulation puts you directly into the shoes of the people who make elections happen.
                </p>
                <div style="background: #fff; border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); padding: 30px; margin-bottom: 30px; text-align: left; width: 100%; box-sizing: border-box;">
                    <h3 style="font-family: 'Bangers', cursive; font-size: 1.8rem; margin-bottom: 10px; color: var(--ink);">How to Play</h3>
                    <ul style="font-size: 1.1rem; line-height: 1.6; padding-left: 20px; font-weight: 500;">
                        <li>Choose your preferred election type (Lok Sabha, Vidhan Sabha, etc).</li>
                        <li>Select a role (Voter, Candidate, Official, or Observer).</li>
                        <li>Play through the interactive storyline and make the right choices to progress.</li>
                        <li>Learn the actual rules, procedures, and secrets of the Election Commission of India!</li>
                    </ul>
                </div>
                <button class="menu-btn" id="btn-start-playing" style="width: auto; padding: 15px 40px; font-size: 1.5rem; background: var(--cyan); display: inline-block;">
                    START PLAYING ➜
                </button>
            </div>
        </div>`;
    },
    renderMenuElection(wrap) {
        const btns = Object.keys(this.data.ELECTIONS).map(k => {
            const e = this.data.ELECTIONS[k];
            const isSpecial = e.isSpecial ? 'special-election-btn' : '';
            const specialTag = e.isSpecial ? '<div class="special-tag">⭐ SPECIAL</div>' : '';
            return `<button class="menu-btn election-btn ${isSpecial}" data-election="${k}" style="border-left-color: ${e.color}">
                ${specialTag}
                <span class="btn-title">${e.title}</span>
                <span class="btn-sub">${e.subtitle}</span>
                <span class="btn-sub" style="margin-top:4px">${e.desc}</span>
            </button>`;
        }).join('');
        wrap.innerHTML = `<div class="screen">
            <div class="screen-header">⚡ CHOOSE THE ELECTION TYPE</div>
            <div class="menu-grid">${btns}</div>
        </div>`;
    },
    renderMenuRole(wrap) {
        const stories = this.storyCache[this.state.election];
        const btns = this.data.ROLES.map(r => {
            const story = stories ? stories[r.id] : null;
            const charImg = (story && story.length > 0 && story[0].char) ? story[0].char : null;
            
            const charPreview = charImg 
                ? `<div class="role-char-preview"><img src="assets/${charImg}"></div>`
                : '';

            const stats = r.stats ? `<div class="role-stats">
                <span>🎯 ${r.stats.Focus}</span>
                <span>⚔️ ${r.stats.Difficulty}</span>
            </div>` : '';
            return `<button class="menu-btn role-btn" data-role="${r.id}">
                ${charPreview}
                <div class="role-content">
                    <span class="btn-title">${r.emoji} ${r.title}</span>
                    <span class="btn-sub">${r.desc}</span>
                    ${stats}
                </div>
            </button>`;
        }).join('');
        const el = this.data.ELECTIONS[this.state.election];
        wrap.innerHTML = `<div class="screen">
            <div class="screen-header">${el.title} — SELECT ROLE</div>
            <div class="menu-grid">${btns}</div>
            <button class="btn-back" id="btn-back">← BACK</button>
        </div>`;
    },
    renderScene(wrap) {
        const scene = this.state.story[this.state.sceneIndex];
        const el = this.data.ELECTIONS[this.state.election];

        // Character (left panel)
        const charEl = (scene.char && scene.char !== 'None')
            ? `<img src="assets/${scene.char}" class="char-sprite">`
            : `<div class="char-fallback">👤</div>`;

        // Visual card (right panel top)
        const visualEl = this.renderVisual(scene.visual);

        // Prop image (right panel bottom, optional)
        const propEl = scene.asset
            ? `<img src="assets/${scene.asset}" class="prop-image" id="prop-img">`
            : '';

        // Fact card
        const factEl = scene.fact
            ? `<div class="fact-card"><strong>💡 DID YOU KNOW?</strong>${scene.fact}</div>`
            : '';

        // Hint box (dialog area, optional)
        const hintEl = scene.hint
            ? `<div class="hint-box" style="display:none;" id="hint-box"><strong>📌 Note:</strong> ${scene.hint}</div>`
            : '';

        wrap.innerHTML = `
        <div class="scene-layout scene-fade-in">
            <!-- TOP BAR -->
            <div class="top-bar">
                <span class="election-tag">${el.title}</span>
                <span>${this.state.role.toUpperCase()}</span>
                <span class="scene-counter">SCENE ${this.state.sceneIndex + 1} / ${this.state.story.length}</span>
                <button class="btn-leave" id="btn-leave" title="Exit Simulation">✖ EXIT</button>
            </div>

            <!-- LEFT: CHARACTER -->
            <div class="char-panel">${charEl}</div>

            <!-- RIGHT: VISUAL + PROP + FACT -->
            <div class="right-panel">
                ${visualEl}
                ${propEl}
                ${factEl}
            </div>

            <!-- DIALOG (full width, bottom) -->
            <div class="dialog-area" id="dialog-area">
                <div class="speaker-name">${scene.speaker}</div>
                <div class="dialog-text" id="dialog-text"></div>
                ${hintEl}
                <button class="btn-next" id="btn-dialog-continue" style="display:none; margin-top: 10px; align-self: flex-end;">Continue ➜</button>
            </div>
        </div>

        <!-- CHOICES OVERLAY (hidden initially) -->
        ${scene.choices ? `
        <div class="choices-overlay" id="choices-overlay" style="display:none">
            <div class="choices-label">⚡ WHAT DO YOU DO?</div>
            ${scene.choices.map((c, i) =>
                `<button class="choice-btn" data-index="${i}">${c.text}</button>`
            ).join('')}
        </div>
        ` : ''}

        <!-- FEEDBACK PANEL (hidden initially) -->
        <div class="feedback-panel" id="feedback-panel" style="display:none"></div>
        `;

        // Show prop image if asset exists
        const propImg = wrap.querySelector('#prop-img');
        if (propImg) propImg.style.display = 'block';

        // Typewriter then show continue button
        const continueBtn = wrap.querySelector('#btn-dialog-continue');
        this.typeWriter(scene.dialog, wrap.querySelector('#dialog-text'), () => {
            if (scene.hint) {
                const hEl = wrap.querySelector('#hint-box');
                if (hEl) hEl.style.display = 'block';
            }
            if (continueBtn && scene.choices) {
                continueBtn.style.display = 'inline-block';
                continueBtn.onclick = () => {
                    continueBtn.style.display = 'none';
                    const overlay = wrap.querySelector('#choices-overlay');
                    if (overlay) overlay.style.display = 'flex';
                };
            } else if (continueBtn && !scene.choices) {
                // If it's just an info scene without choices, clicking continue goes to next scene
                continueBtn.style.display = 'inline-block';
                continueBtn.onclick = () => this.nextScene();
            }
        });
    },
    typeWriter(text, el, onDone) {
        if (this.typeWriterIv) clearInterval(this.typeWriterIv);
        el.textContent = '';
        let i = 0;
        this.typeWriterIv = setInterval(() => {
            el.textContent += text.charAt(i++);
            if (i >= text.length) { clearInterval(this.typeWriterIv); if (onDone) onDone(); }
        }, 18);
    },
    renderEnd(wrap) {
        const el = this.data.ELECTIONS[this.state.election];
        wrap.innerHTML = `<div class="screen">
            <div class="end-screen">
                <h1>🏆 MISSION COMPLETE!</h1>
                <p>You experienced <strong>${el.title}</strong> as <strong>${this.state.role}</strong>.</p>
                <p style="font-size:0.9rem;color:#555;margin-bottom:1.5rem">
                    You learned how real Indian democracy works — step by step!
                </p>
                <button class="menu-btn" id="btn-restart" style="width:auto;padding:12px 32px">
                    🔄 PLAY AGAIN
                </button>
            </div>
        </div>`;
    }

};
