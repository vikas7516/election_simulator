// Firebase and Gemini API Service module

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase config
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


const GEMINI_PROXY_URL = "/api/gemini/v1beta/models/gemini-1.5-flash:generateContent";

export async function fetchMasterData() {
    try {
        const docRef = doc(db, "election_data", "master");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log("Data fetched securely from Firebase Firestore!");
            return docSnap.data();
        }
        throw new Error("Missing in DB");
    } catch (e) {
        console.warn("Firebase fetch failed, falling back to basic local data.json:", e);
        const r = await fetch('data/data.json');
        return await r.json();
    }
}

export async function fetchElectionStory(electionKey, localFile) {
    try {
        const docRef = doc(db, "election_stories", electionKey);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            console.log(`Story ${electionKey} fetched from Firebase!`);
            return docSnap.data();
        }
        throw new Error("Missing in DB");
    } catch (e) {
        console.warn("Firebase story fetch failed, falling back to local file:", e);
        const r = await fetch(localFile);
        return await r.json();
    }
}

export async function generateGeminiContent(sceneText) {
   
    const prompt = `Given the following scenario from an Indian Election simulation game:
"${sceneText}"

Generate:
1. 4 plausible educational choices a user could make. 1 should be the correct highly-detailed civic protocol, 3 should be common mistakes.
2. For each choice, provide feedback explaining why it's right or wrong.
3. Provide a short "Did You Know?" fact about Indian elections related to this.

Respond strictly in JSON format matching this exact structure:
{
  "choices": [ { "text": "...", "isCorrect": true, "feedback": "..." } ],
  "didYouKnow": "..."
}`;

    try {
        const response = await fetch(GEMINI_PROXY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });
        
        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Gemini Generation failed:", e);
        return null;
    }
}