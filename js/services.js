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

export async function fetchMasterData() {
    const docRef = doc(db, "election_data", "master");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("Data fetched securely from Firebase Firestore!");
        return docSnap.data();
    }
    throw new Error("Master data missing in DB");
}

export async function fetchElectionStory(electionKey) {
    const docRef = doc(db, "election_stories", electionKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log(`Story ${electionKey} fetched from Firebase!`);
        return docSnap.data();
    }
    throw new Error(`Story ${electionKey} missing in DB`);
}

export async function generateGeminiContentBulk(storyArray) {
    const scenesText = storyArray.map((s, i) => `Scene ${i}:\n${s.dialog}`).join("\n\n---\n\n");
   
    const prompt = `You are an expert civic educator designing a scenario for an engaging, gamified Indian Election simulation.
Given the following list of scenes from the game:

${scenesText}

Your task is to generate dynamic, challenging, and highly educational choices for EVERY scene provided.
1. Create 4 plausible choices a user could make for each scene. 
   - 1 must be the absolute correct protocol according to the Election Commission of India (ECI) guidelines.
   - 3 should be common mistakes, misconceptions, or plausible-sounding but illegal/incorrect actions.
   - IMPORTANT: Randomize the position of the correct choice! It should NOT always be the first choice.
2. For each choice, provide rich feedback explaining *why* it's right or wrong, citing specific rules, consequences, or mechanics if applicable.
3. Provide a fascinating "Did You Know?" fact about Indian elections related to each specific topic. This will be displayed in the right-side information panel during the scene.
4. Ensure the tone is immersive, slightly dramatic (like a game), but fundamentally educational.

Respond strictly in JSON format matching this exact structure (an array of objects, one for each scene in order):
[
  {
    "sceneIndex": 0,
    "choices": [ { "text": "...", "isCorrect": true/false, "feedback": "..." }, ...4 choices total ],
    "didYouKnow": "..."
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
        
        const data = await response.json();
        const raw = data.candidates[0].content.parts[0].text;
        // Handle both pre-parsed JSON (structured output) and string responses
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
        console.error("Gemini Bulk Generation failed:", e);
        return null;
    }
}