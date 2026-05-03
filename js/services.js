// Firebase and Gemini API Service module

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";


// Firebase config — Firebase API keys are safe to expose client-side.
// Security is enforced via Firebase Security Rules and authorized domain restrictions.
const firebaseConfig = {
  apiKey: "AIzaSyDTJUW1NMyRjZGH2l-ZLKOiANGtv_YyeWs",
  authDomain: "gen-lang-client-0708607126.firebaseapp.com",
  projectId: "gen-lang-client-0708607126",
  storageBucket: "gen-lang-client-0708607126.firebasestorage.app",
  messagingSenderId: "393226308231",
  appId: "1:393226308231:web:f1a53bf4f85b5419dc4622",
  measurementId: "G-S4GXBFNFWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const GEMINI_PROXY_URL = "/api/gemini/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Fetches the master election and role data from Firebase Firestore.
 * @returns {Promise<Object>} The master election data mapping.
 * @throws {Error} If the data cannot be found or connection fails.
 */
export async function fetchMasterData() {
    const docRef = doc(db, "election_data", "master");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    throw new Error("Master data missing in DB");
}

/**
 * Fetches the specific narrative story array for a given election.
 * @param {string} electionKey - Distinct identifier for the election (e.g. 'LOK_SABHA').
 * @returns {Promise<Object>} The stories mapped by roles.
 * @throws {Error} If the story document is missing.
 */
export async function fetchElectionStory(electionKey) {
    const docRef = doc(db, "election_stories", electionKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    throw new Error(`Story ${electionKey} missing in DB`);
}

/**
 * Calls the Gemini Flash API to dynamically generate contextually accurate choices and feedback
 * for each scene in the provided story block, using the application's secure reverse proxy.
 * @param {Array<Object>} storyArray - Array of scene objects containing dialog data.
 * @returns {Promise<Array<Object>|null>} AI-generated choices array, or null on failure.
 */
export async function generateGeminiContentBulk(storyArray) {
    const scenesText = storyArray.map((s, i) => `Scene ${i}:\n${s.dialog}`).join("\n\n---\n\n");
   
    const prompt = `You are an expert civic educator designing a scenario for an engaging, gamified Indian Election simulation.
Given the following list of scenes from the game:

${scenesText}

Your task is to generate dynamic, challenging, and highly educational choices for EVERY scene provided.
1. Create exactly 4 plausible choices a user could make for each scene. 
   - 1 must be the absolute correct protocol according to the Election Commission of India (ECI) guidelines.
   - 3 should be common mistakes, misconceptions, or plausible-sounding but illegal/incorrect actions.
   - IMPORTANT: Randomize the position of the correct choice! It should NOT always be at the same index.
2. For each choice, provide rich feedback explaining *why* it's right or wrong, citing specific rules, consequences, or mechanics if applicable.
3. Provide a fascinating "Did You Know?" fact about Indian elections related to each specific topic. This will be displayed in the right-side information panel during the scene.
4. Ensure the tone is immersive, slightly dramatic (like a comic book game), but fundamentally educational.

Respond strictly in valid JSON format matching this exact structure (an array of objects, one for each scene in order):
[
  {
    "sceneIndex": 0,
    "choices": [ { "text": "Choice 1 text", "isCorrect": true, "feedback": "Feedback for correct choice" }, { "text": "Choice 2 text", "isCorrect": false, "feedback": "Feedback for incorrect choice" }, ...4 choices total ],
    "didYouKnow": "Relevant educational fact"
  }
]`;

    try {
        const response = await fetch(GEMINI_PROXY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { 
                    response_mime_type: "application/json",
                    response_schema: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                sceneIndex: { type: "INTEGER" },
                                choices: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            text: { type: "STRING" },
                                            isCorrect: { type: "BOOLEAN" },
                                            feedback: { type: "STRING" }
                                        }
                                    }
                                },
                                didYouKnow: { type: "STRING" }
                            }
                        }
                    }
                }
            })
        });
        
        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate response structure before accessing nested properties
        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            throw new Error('Invalid Gemini API response structure');
        }
        
        const raw = data.candidates[0].content.parts[0].text;
        // Handle both pre-parsed JSON (structured output) and string responses
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        return null;
    }
}