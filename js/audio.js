/**
 * Audio synthesis module for the simulation.
 * Uses the Web Audio API to generate procedural sounds without external assets.
 * @module AudioMixin
 */
import { TIMINGS, AUDIO } from './constants.js';

export const AudioMixin = {
    /**
     * Initializes the AudioContext upon user interaction.
     */
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playTone(freq, type, duration, vol = 0.3, detune = 0) {
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

    playClick() { 
        this.playTone(AUDIO.FREQ_CLICK, AUDIO.OSC_SINE, TIMINGS.AUDIO_CLICK_DURATION, AUDIO.VOL_CLICK); 
    },
    
    playHover() { 
        this.playTone(AUDIO.FREQ_HOVER, AUDIO.OSC_SINE, TIMINGS.AUDIO_HOVER_DURATION, AUDIO.VOL_HOVER); 
    },
    
    playCorrect() { 
        this.playTone(AUDIO.FREQ_CORRECT_1, AUDIO.OSC_SINE, TIMINGS.AUDIO_CORRECT_DURATION, AUDIO.VOL_CORRECT_1); 
        setTimeout(() => this.playTone(AUDIO.FREQ_CORRECT_2, AUDIO.OSC_SINE, TIMINGS.AUDIO_CORRECT_DURATION, AUDIO.VOL_CORRECT_2), TIMINGS.AUDIO_CORRECT_DELAY_1);
        setTimeout(() => this.playTone(AUDIO.FREQ_CORRECT_3, AUDIO.OSC_SINE, TIMINGS.AUDIO_CORRECT_DURATION * 2.67, AUDIO.VOL_CORRECT_3), TIMINGS.AUDIO_CORRECT_DELAY_2);
    },

    playWrong() { 
        this.playTone(AUDIO.FREQ_WRONG_1, AUDIO.OSC_SAWTOOTH, TIMINGS.AUDIO_WRONG_DURATION, AUDIO.VOL_WRONG_1); 
        setTimeout(() => this.playTone(AUDIO.FREQ_WRONG_2, AUDIO.OSC_SAWTOOTH, TIMINGS.AUDIO_WRONG_DURATION * 2, AUDIO.VOL_WRONG_2), TIMINGS.AUDIO_WRONG_DELAY);
    },
    
    playStart() {
        this.playTone(AUDIO.FREQ_START, AUDIO.OSC_TRIANGLE, TIMINGS.AUDIO_START_DURATION, AUDIO.VOL_START_1);
        setTimeout(() => this.playTone(AUDIO.FREQ_FINISH_4, AUDIO.OSC_TRIANGLE, TIMINGS.AUDIO_START_DURATION * 2.5, AUDIO.VOL_START_2), TIMINGS.AUDIO_START_DELAY);
    },
    
    playFinish() {
        this.playTone(AUDIO.FREQ_FINISH_1, AUDIO.OSC_SQUARE, TIMINGS.AUDIO_FINISH_DURATION, AUDIO.VOL_FINISH_1);
        setTimeout(() => this.playTone(AUDIO.FREQ_FINISH_2, AUDIO.OSC_SQUARE, TIMINGS.AUDIO_FINISH_DURATION, AUDIO.VOL_FINISH_2), TIMINGS.AUDIO_FINISH_DELAY_1);
        setTimeout(() => this.playTone(AUDIO.FREQ_FINISH_3, AUDIO.OSC_SQUARE, TIMINGS.AUDIO_FINISH_DURATION, AUDIO.VOL_FINISH_3), TIMINGS.AUDIO_FINISH_DELAY_2);
        setTimeout(() => this.playTone(AUDIO.FREQ_FINISH_4, AUDIO.OSC_SQUARE, TIMINGS.AUDIO_FINISH_DURATION * 3, AUDIO.VOL_FINISH_4), TIMINGS.AUDIO_FINISH_DELAY_3);
    }
};
