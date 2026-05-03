/**
 * Application-wide constants for configuration and magic numbers.
 * Centralizing these values improves maintainability and makes them easy to adjust.
 */

// ── TIMING CONSTANTS (milliseconds) ──────────────────────────────────
export const TIMINGS = {
    NOTIFICATION_DISPLAY_TIME: 4000,
    AI_LOADING_PROGRESS_INTERVAL: 400,
    AI_LOADING_DELAY: 500,
    
    // Audio synthesis timings
    AUDIO_CLICK_DURATION: 0.1,
    AUDIO_HOVER_DURATION: 0.05,
    AUDIO_CORRECT_DURATION: 0.15,
    AUDIO_CORRECT_DELAY_1: 100,
    AUDIO_CORRECT_DELAY_2: 200,
    AUDIO_WRONG_DURATION: 0.2,
    AUDIO_WRONG_DELAY: 150,
    AUDIO_START_DURATION: 0.2,
    AUDIO_START_DELAY: 150,
    AUDIO_FINISH_DURATION: 0.2,
    AUDIO_FINISH_DELAY_1: 150,
    AUDIO_FINISH_DELAY_2: 300,
    AUDIO_FINISH_DELAY_3: 450,
    
    // Typewriter effect timing
    TYPEWRITER_INTERVAL: 30
};

// ── AUDIO CONSTANTS ──────────────────────────────────────────────────
export const AUDIO = {
    // Frequencies (Hz)
    FREQ_CLICK: 800,
    FREQ_HOVER: 1200,
    FREQ_CORRECT_1: 440,  // A4
    FREQ_CORRECT_2: 554,  // C#5
    FREQ_CORRECT_3: 659,  // E5
    FREQ_WRONG_1: 180,
    FREQ_WRONG_2: 150,
    FREQ_START: 440,      // A4
    FREQ_FINISH_1: 523.25,   // C5
    FREQ_FINISH_2: 659.25,   // E5
    FREQ_FINISH_3: 783.99,   // G5
    FREQ_FINISH_4: 1046.50,  // C6
    
    // Oscillator types
    OSC_SINE: 'sine',
    OSC_TRIANGLE: 'triangle',
    OSC_SQUARE: 'square',
    OSC_SAWTOOTH: 'sawtooth',
    
    // Volume (gain) levels
    VOL_CLICK: 0.2,
    VOL_HOVER: 0.05,
    VOL_CORRECT_1: 0.4,
    VOL_CORRECT_2: 0.4,
    VOL_CORRECT_3: 0.5,
    VOL_WRONG_1: 0.4,
    VOL_WRONG_2: 0.5,
    VOL_START_1: 0.4,
    VOL_START_2: 0.5,
    VOL_FINISH_1: 0.3,
    VOL_FINISH_2: 0.3,
    VOL_FINISH_3: 0.3,
    VOL_FINISH_4: 0.5
};

// ── AI LOADING CONSTANTS ──────────────────────────────────────────────
export const AI_LOADING = {
    PROGRESS_INCREMENT_MAX: 15,
    PROGRESS_MAX_BEFORE_COMPLETION: 90,
    PROGRESS_STEP_SIZE: 20
};

// ── ANIMATION AND UI CONSTANTS ──────────────────────────────────────
export const UI_CONFIG = {
    CHOICE_KEYS_MAX: 4,
    CHOICE_KEY_START: 1,
    DETAILED_PROPS: ['prop_cvigil.webp', 'prop_voter_id.webp', 'prop_voter_slip.webp', 'prop_nomination_form.webp']
};
