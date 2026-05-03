# 🗳️ Indian Election Simulator

An immersive, interactive, comic-style educational web application designed to demystify the immense scale, rules, and procedures of the Indian Democratic system.

Try it Now - https://election-simulator-393226308231.asia-south1.run.app
## 🎯 The Intent
Democracy is often taught through dry textbooks, leaving citizens confused about the actual mechanics of how governments are formed. The intent of this project is to gamify civic education. By putting users directly into the shoes of different democratic stakeholders, they learn the procedures of the Election Commission of India (ECI) through consequence-driven interactive storytelling rather than passive reading.

## 🏷️ Chosen Vertical
**Civic Tech / Gamified EdTech**

## ✨ What We Have
* **Multiple Election Scenarios:** Fully playable modules for Lok Sabha, Vidhan Sabha, Rajya Sabha, President of India, and Prime Minister.
* **4 Distinct Playable Roles:**
  * **The Voter:** Navigate polling booths, verify VVPATs, and exercise civic duty.
  * **The Candidate:** File nominations, campaign, and rally supporters.
  * **The Official:** Manage EVMs, enforce the Model Code of Conduct, and run the booth.
  * **The Observer:** Act as the ECI's watchdog to catch fraud and ensure fair play.
* **Dynamic Visual Engine:** A bespoke, grid-based UI that renders comic-book style panels, statistical cards, comparison tables, and character sprites dynamically from JSON data.
* **Audio Synthesizer:** Zero-dependency Web Audio API integration providing instant, native sound effects for interactions, successes, and failures.
* **Production-Ready Security:** Containerized with Docker and Nginx, utilizing strict Content Security Policies (CSP) to categorically eliminate XSS vulnerabilities.

## 🔄 The Flow
1. **Start Screen:** Users are introduced to the simulator's purpose and given a brief "How to Play" tutorial.
2. **Election Selection:** Users choose which tier of the Indian Government they want to simulate (e.g., Lok Sabha vs. Rajya Sabha).
3. **Role Selection:** Users pick their character archetype, defining their perspective and the challenges they will face.
4. **The Simulation Loop:** 
   * A scenario is presented via typewriter-style dialogue and dynamic visual props.
   * The user is presented with multiple-choice actions.
   * Selecting the correct action (based on real ECI rules) rewards the user with positive feedback and advances the story.
   * Selecting an incorrect action provides educational feedback on *why* it's wrong, allowing them to retry.
5. **Conclusion:** Upon successfully navigating the election, users receive a completion screen summarizing their educational journey.

## 🏗️ Approach and Logic (How We Designed It)
We approached the design with three core philosophies:
1. **Modularity over Frameworks:** Instead of relying on heavy frameworks like React or Angular, we built a vanilla ES6 JavaScript engine. State management (`this.state`), UI rendering (`UIMixin`), and Audio (`AudioMixin`) are entirely decoupled, making the app blazingly fast and easy to maintain.
2. **Data-Driven Storytelling:** The entire narrative logic is separated from the code. The `js/app.js` engine simply fetches and parses external `data_*.json` files. This allows non-programmers to easily write new storylines or add new elections without touching a single line of JavaScript.
3. **Responsive Comic Aesthetic:** We utilized native CSS CSS Grid and variable-driven design (`css/variables.css`) to create a layout that gracefully adapts from ultrawide desktop monitors down to mobile screens, maintaining a distinct, vibrant "graphic novel" aesthetic.

## ⚙️ How the Solution Works
1. **Bootstrapping:** `index.html` loads the core `app.js` module.
2. **State Management:** The `ElectionSimulator` class initializes a centralized state (`screen`, `election`, `role`, `sceneIndex`).
3. **Data Fetching:** The app asynchronously fetches `data/data.json` to build the interactive menus. Upon selecting a role, it fetches the specific narrative file (e.g., `data_vidhansabha.json`).
4. **Rendering:** The `UIMixin` reads the current scene data and injects the corresponding UI components (character sprites, visual data cards, choices) into the DOM securely.
5. **Event Handling:** The engine listens for mouse clicks and keyboard shortcuts (`1-4`, `Enter`), evaluating user choices against the `isCorrect` boolean in the JSON data, triggering the `AudioMixin`, and advancing the `sceneIndex`.

## 🤔 Assumptions Made
* **Modern Browser Usage:** We assume the user is accessing the application on a modern browser that supports ES6 Modules (`<script type="module">`), CSS Grid, and the Web Audio API.
* **Educational Simplification:** While the storylines are heavily based on actual ECI protocols, certain hyper-specific edge cases in election law have been simplified for the sake of narrative flow and accessibility.
* **Containerized Deployment:** The project assumes it will be deployed on a containerized serverless platform (like Google Cloud Run), hence the inclusion of a Dockerfile and Nginx reverse proxy configuration.

---
