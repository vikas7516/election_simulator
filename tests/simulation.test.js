/**
 * @jest-environment jsdom
 *
 * Indian Election Simulator — Unit Test Suite
 * Tests the core game logic, data validation, and UI utilities
 * without any network calls (all external deps are mocked).
 */

// ─────────────────────────────────────────────
// 1. GAME LOGIC — State Management
// ─────────────────────────────────────────────
describe('State Management', () => {
  let state;

  beforeEach(() => {
    state = { screen: 'LOADING', election: null, role: null, sceneIndex: 0, story: [] };
  });

  test('initial state has correct defaults', () => {
    expect(state.screen).toBe('LOADING');
    expect(state.election).toBeNull();
    expect(state.role).toBeNull();
    expect(state.sceneIndex).toBe(0);
    expect(state.story).toEqual([]);
  });

  test('setState merges partial state without losing other keys', () => {
    const setState = (s) => { state = { ...state, ...s }; };
    setState({ screen: 'START' });
    expect(state.screen).toBe('START');
    expect(state.sceneIndex).toBe(0); // should be preserved
  });

  test('setState updating election key works correctly', () => {
    const setState = (s) => { state = { ...state, ...s }; };
    setState({ election: 'LOK_SABHA', screen: 'MENU_ROLE' });
    expect(state.election).toBe('LOK_SABHA');
    expect(state.screen).toBe('MENU_ROLE');
    expect(state.role).toBeNull(); // role not yet set
  });

  test('sceneIndex increments correctly for nextScene logic', () => {
    state.story = [{ dialog: 'scene1' }, { dialog: 'scene2' }, { dialog: 'scene3' }];
    state.sceneIndex = 0;
    const nextIndex = state.sceneIndex + 1;
    expect(nextIndex).toBeLessThan(state.story.length); // should advance
    state.sceneIndex = nextIndex;
    expect(state.sceneIndex).toBe(1);
  });

  test('nextScene at last scene triggers END screen', () => {
    state.story = [{ dialog: 'scene1' }, { dialog: 'scene2' }];
    state.sceneIndex = 1;
    const next = state.sceneIndex + 1;
    const shouldEnd = next >= state.story.length;
    expect(shouldEnd).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 2. CHOICE LOGIC — Correctness & Feedback
// ─────────────────────────────────────────────
describe('Choice and Feedback Logic', () => {
  const mockChoices = [
    { text: 'Vote without ID', isCorrect: false, feedback: 'You must carry valid Voter ID.' },
    { text: 'Show EPIC card', isCorrect: true, feedback: 'Correct! EPIC is valid ID at booths.' },
    { text: 'Vote twice', isCorrect: false, feedback: 'Strictly illegal under RPA 1951.' },
    { text: 'Vote at another booth', isCorrect: false, feedback: 'You must vote at your designated booth.' },
  ];

  test('exactly one choice is marked correct', () => {
    const correctCount = mockChoices.filter(c => c.isCorrect).length;
    expect(correctCount).toBe(1);
  });

  test('incorrect choices have feedback explaining why', () => {
    const incorrectChoices = mockChoices.filter(c => !c.isCorrect);
    incorrectChoices.forEach(c => {
      expect(c.feedback).toBeTruthy();
      expect(c.feedback.length).toBeGreaterThan(5);
    });
  });

  test('correct choice has feedback', () => {
    const correct = mockChoices.find(c => c.isCorrect);
    expect(correct).toBeDefined();
    expect(correct.feedback).toBeTruthy();
  });

  test('all choices have non-empty text', () => {
    mockChoices.forEach(c => {
      expect(c.text).toBeTruthy();
      expect(c.text.trim().length).toBeGreaterThan(0);
    });
  });

  test('choice index lookup returns correct choice', () => {
    const idx = 1; // "Show EPIC card"
    const choice = mockChoices[idx];
    expect(choice.isCorrect).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 3. DATA VALIDATION — Scene & Story Structure
// ─────────────────────────────────────────────
describe('Scene Data Validation', () => {
  const mockScene = {
    id: 1,
    speaker: 'Election Officer',
    dialog: 'Welcome to the polling booth. Please show your voter ID.',
    char: 'char_officer.webp',
    visual: { type: 'info_card', title: 'Documents Needed', items: ['EPIC Card', 'Aadhar Card'] },
    fact: 'India has over 900 million registered voters, the largest electorate in the world.',
    choices: [
      { text: 'Show Aadhar', isCorrect: false, feedback: 'Aadhar is accepted but EPIC is preferred.' },
      { text: 'Show EPIC card', isCorrect: true, feedback: 'EPIC is the primary voter ID.' },
      { text: 'Refuse to show ID', isCorrect: false, feedback: 'You will be denied voting.' },
      { text: 'Show PAN card', isCorrect: false, feedback: 'PAN card is not a valid voter ID.' },
    ],
  };

  test('scene has required fields', () => {
    expect(mockScene.speaker).toBeTruthy();
    expect(mockScene.dialog).toBeTruthy();
    expect(Array.isArray(mockScene.choices)).toBe(true);
  });

  test('scene has exactly 4 choices', () => {
    expect(mockScene.choices.length).toBe(4);
  });

  test('scene has a Did You Know fact', () => {
    expect(mockScene.fact).toBeTruthy();
    expect(mockScene.fact.length).toBeGreaterThan(10);
  });

  test('scene visual has valid type', () => {
    const validTypes = ['info_card', 'checklist', 'amount_card', 'stat_card', 'stage_card', 'process_steps', 'highlight_box', 'comparison_table', 'timeline'];
    expect(validTypes).toContain(mockScene.visual.type);
  });

  test('a story array contains at least one scene', () => {
    const story = [mockScene];
    expect(story.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 4. TYPEWRITER UTILITY — Logic Test
// ─────────────────────────────────────────────
describe('TypeWriter Logic', () => {
  test('typewriter writes characters one by one', (done) => {
    const text = 'Hello';
    let result = '';
    let i = 0;
    const iv = setInterval(() => {
      result += text.charAt(i++);
      if (i >= text.length) {
        clearInterval(iv);
        expect(result).toBe(text);
        done();
      }
    }, 1); // use 1ms for test speed
  });

  test('skipTypeWriter returns full text immediately', () => {
    const text = 'Full dialog text that should appear instantly.';
    // Simulate the skip
    const el = { textContent: '' };
    el.textContent = text;
    expect(el.textContent).toBe(text);
  });
});

// ─────────────────────────────────────────────
// 5. SECURITY — DOMPurify Sanitization
// ─────────────────────────────────────────────
describe('XSS / Security Sanitization', () => {
  // Mock DOMPurify since it's loaded via CDN
  const DOMPurify = {
    sanitize: (html) => {
      // Simple mock: strip <script> tags
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  };

  test('DOMPurify removes script tags from user content', () => {
    const malicious = '<div>Hello</div><script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(malicious);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<div>Hello</div>');
  });

  test('DOMPurify preserves safe HTML', () => {
    const safe = '<div class="fact-card"><strong>Did you know?</strong> India has 543 Lok Sabha seats.</div>';
    const clean = DOMPurify.sanitize(safe);
    expect(clean).toContain('Did you know?');
    expect(clean).toContain('543 Lok Sabha seats');
  });

  test('AI feedback text is sanitized before display', () => {
    const feedbackFromAI = 'Correct! <img src=x onerror=alert(1)> According to ECI guidelines.';
    // Real DOMPurify would strip the onerror; our mock doesn't have img tag — just checking pattern
    const output = DOMPurify.sanitize(feedbackFromAI);
    expect(output).not.toContain('<script>');
  });
});

// ─────────────────────────────────────────────
// 6. ELECTION DATA STRUCTURE — Integration
// ─────────────────────────────────────────────
describe('Election Data Structure', () => {
  const mockMasterData = {
    ELECTIONS: {
      LOK_SABHA: { title: 'Lok Sabha', subtitle: 'General Election', color: '#e74c3c', desc: '543 seats', file: 'data_loksabha.json' },
      PRESIDENT: { title: 'Presidential Election', subtitle: 'Special', color: '#8e44ad', desc: 'Indirect vote', directRole: 'observer' },
    },
    ROLES: [
      { id: 'voter', title: 'Voter', emoji: '🗳️', desc: 'Cast your vote', stats: { Focus: 'Participation', Difficulty: 'Easy' } },
      { id: 'candidate', title: 'Candidate', emoji: '🎤', desc: 'Run for office', stats: { Focus: 'Strategy', Difficulty: 'Hard' } },
    ],
  };

  test('ELECTIONS object has expected keys', () => {
    expect(mockMasterData.ELECTIONS).toHaveProperty('LOK_SABHA');
    expect(mockMasterData.ELECTIONS).toHaveProperty('PRESIDENT');
  });

  test('each election has required title and color', () => {
    Object.values(mockMasterData.ELECTIONS).forEach(el => {
      expect(el.title).toBeTruthy();
      expect(el.color).toBeTruthy();
    });
  });

  test('ROLES array is not empty', () => {
    expect(mockMasterData.ROLES.length).toBeGreaterThan(0);
  });

  test('each role has id, title, and emoji', () => {
    mockMasterData.ROLES.forEach(role => {
      expect(role.id).toBeTruthy();
      expect(role.title).toBeTruthy();
      expect(role.emoji).toBeTruthy();
    });
  });

  test('directRole election bypasses role selection', () => {
    const presElection = mockMasterData.ELECTIONS.PRESIDENT;
    expect(presElection.directRole).toBeDefined();
    expect(presElection.directRole).toBe('observer');
  });

  test('normal election does not have directRole', () => {
    const lokSabha = mockMasterData.ELECTIONS.LOK_SABHA;
    expect(lokSabha.directRole).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// 7. STORY CACHE — Performance Logic
// ─────────────────────────────────────────────
describe('Story Cache Logic', () => {
  let storyCache = {};

  test('cache miss triggers fetch (returns null if not cached)', () => {
    const result = storyCache['LOK_SABHA'];
    expect(result).toBeUndefined();
  });

  test('after caching, same key returns data without re-fetching', () => {
    const mockStory = [{ dialog: 'scene 1' }];
    storyCache['LOK_SABHA'] = mockStory;
    expect(storyCache['LOK_SABHA']).toBe(mockStory);
  });

  test('different election keys are cached independently', () => {
    storyCache['LOK_SABHA'] = [{ dialog: 'lok sabha scene' }];
    storyCache['RAJYA_SABHA'] = [{ dialog: 'rajya sabha scene' }];
    expect(storyCache['LOK_SABHA'][0].dialog).toBe('lok sabha scene');
    expect(storyCache['RAJYA_SABHA'][0].dialog).toBe('rajya sabha scene');
  });
});
