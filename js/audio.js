/**
 * Audio synthesis module for the simulation.
 * Uses the Web Audio API to generate procedural sounds without external assets.
 * @module AudioMixin
 */
export const AudioMixin = {
    /**
     * Initializes the AudioContext upon user interaction.
     */
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playTone(freq, type, duration, vol=0.3, detune=0) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        osc.detune.setValueAtTime(detune, this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime); // Quick attack
        gain.gain.linearRampToValueAtTime(vol, this.audioCtx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    },

    playClick() { this.playTone(800, 'sine', 0.1, 0.2); },
    playHover() { this.playTone(1200, 'sine', 0.05, 0.05); },
    
    playCorrect() { 
        this.playTone(440, 'sine', 0.15, 0.4); 
        setTimeout(() => this.playTone(554, 'sine', 0.15, 0.4), 100);
        setTimeout(() => this.playTone(659, 'sine', 0.4, 0.5), 200);
    },

    playWrong() { 
        this.playTone(180, 'sawtooth', 0.2, 0.4); 
        setTimeout(() => this.playTone(150, 'sawtooth', 0.4, 0.5), 150);
    },
    
    playStart() {
        this.playTone(440, 'triangle', 0.2, 0.4);
        setTimeout(() => this.playTone(880, 'triangle', 0.5, 0.5), 150);
    },
    
    playFinish() {
        this.playTone(523.25, 'square', 0.2, 0.3);
        setTimeout(() => this.playTone(659.25, 'square', 0.2, 0.3), 150);
        setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.3), 300);
        setTimeout(() => this.playTone(1046.50, 'square', 0.6, 0.5), 450);
    }
};
