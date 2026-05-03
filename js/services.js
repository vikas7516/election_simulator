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


const GEMINI_PROXY_URL = "/api/gemini/v1beta/models/gemini-2.5-flash:generateContent";

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
   
    const prompt = `You are an expert civic educator designing a scenario for an engaging, gamified Indian Election simulation.
Given the following scenario text from the game:
"${sceneText}"

Your task is to generate dynamic, challenging, and highly educational choices for the player.
1. Create 4 plausible choices a user could make in this situation. 
   - 1 must be the absolute correct protocol according to the Election Commission of India (ECI) guidelines.
   - 3 should be common mistakes, misconceptions, or plausible-sounding but illegal/incorrect actions.
2. For each choice, provide rich feedback explaining *why* it's right or wrong, citing specific rules, consequences, or mechanics if applicable.
3. Provide a fascinating "Did You Know?" fact about Indian elections related to this specific topic to display as a hint.
4. Ensure the tone is immersive, slightly dramatic (like a game), but fundamentally educational.

Respond strictly in JSON format matching this exact structure:
{
  "choices": [ { "text": "...", "isCorrect": true/false, "feedback": "..." } ],
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