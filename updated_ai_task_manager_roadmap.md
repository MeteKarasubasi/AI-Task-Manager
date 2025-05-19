📜 AI RULES (for Turkish explanation, English instructions)
🌟 General Rules
You must understand and strictly follow the roadmap steps listed below.

You must complete all tasks fully, do not skip any detail.

You must explain every step clearly in Turkish.

Your Turkish explanations must be detailed, technical when needed, and easy to understand.

Avoid summarizing unless explicitly asked. Always give full explanations.

You should think step-by-step for each action and clearly explain your reasoning (in Turkish).

If a technology/tool/API is mentioned, also explain it briefly in Turkish before using it.

For code snippets, you must explain the logic of the code right after giving the code (again, in Turkish).

For errors, analyze the reason and suggest possible solutions (in Turkish).

You must act like an expert full-stack developer with knowledge of AI integrations.

🚀 Project Roadmap for "AI Task Manager" (Turkish Explanation)
📍 1. Project Base Setup
Create a GitHub repository named ai-task-manager.

Create two branches: main (for production), dev (for development).

Define the branch rule: never merge directly to main without Pull Request (PR).

Tech Stack: Git, GitHub.

For Web:

Initialize React project using Create React App or Next.js.

Tech Stack: React.js, Next.js.

For Mobile:

Initialize React Native project using Expo CLI (expo init).

Tech Stack: React Native, Expo.

For Backend:

Create a new project in Firebase Console.

Enable Firestore and Authentication.

Tech Stack: Firebase Firestore, Firebase Authentication.

📍 2. User Authentication
Design Signup and Login forms (Web & Mobile) for email/password authentication.

Add Password Reset flow.

After login, redirect user to the homepage.

Tech Stack: React.js, React Native, Firebase Auth, Expo Router / React Navigation.

Integrate with Firebase Authentication API for login/signup.

Properly catch and display errors (like "password too short").

Tech Stack: Firebase Authentication SDK, Firebase Admin SDK (Node.js).

Implement session management:

Store user sessions with localStorage (Web) and AsyncStorage (Mobile).

Check session at app start (Auto-login).

Tech Stack: localStorage, AsyncStorage, Context API.

📍 3. User Profile System
Create a user model in Firestore:

Fields: name, email, preferredTasks, workingHours, profileImage.

Save user data during signup.

Tech Stack: Firebase Firestore, Firebase Admin SDK.

Build profile pages:

Allow users to view and edit their profile.

Optional: Integrate Firebase Storage for profile image upload.

Tech Stack: React.js, React Native, Firebase Firestore, Firebase Storage.

📍 4. Task Management Module (CRUD)
Design a task collection in Firestore:

Fields: taskTitle, description, category, priority, status, assignedTo, createdAt, dueDate.

Implement CRUD operations:

Create: Add new task.

Read: Fetch and display task list.

Update: Edit task details.

Delete: Remove task.

Tech Stack: Firebase Firestore, React Query or SWR.

Manage task statuses:

Status types: To Do, In Progress, Completed, Blocked.

Enable real-time sync with Firestore.

Tech Stack: Firestore Real-time Updates, onSnapshot API.

📍 5. Kanban Board
Create a Kanban board UI:

Columns: To Do, In Progress, Completed.

Tech Stack: react-beautiful-dnd, @shopify/draggable.

Implement drag and drop feature.

Update task status automatically in Firestore after moving.

Tech Stack: Firestore batch updates.

📍 6. Real-Time Notifications
Set up Firebase Cloud Messaging (FCM).

Request notification permission from users.

Tech Stack: Firebase Cloud Messaging, Expo Push Notifications.

Send notification when:

A task status changes (e.g., moved to In Progress or Completed).

Notification content: Task name, status, timestamp.

Tech Stack: Node.js, Firebase Admin SDK.

📍 7. AI-Based Task Suggestion and Prioritization
Use Gemini API for task suggestion.

Collect user's past task data and send to Gemini.

AI suggests:

New tasks

Prioritized tasks

Tech Stack: Gemini API, Node.js, React Query.

Show 3 AI-generated suggestions to the user.

Allow user to accept and add suggestions as tasks (with "Suggested" tag).

Tech Stack: React.js, React Native.

📍 8. Add Task by Voice
Implement audio recording (start/stop) on Web and Mobile.

Tech Stack: Expo Audio API, Web Speech API.

Integrate with Whisper API:

Send the audio file to Whisper.

Convert to text.

Extract task title and description from the text.

Tech Stack: Whisper API, Axios, Node.js.

Show the extracted text to user before saving as a task.

Tech Stack: React.js, React Native, Firestore.

📍 9. Calendar and Time Tracking
Integrate with Google Calendar API:

Ask user permission.

Automatically sync tasks to the calendar based on due date.

Tech Stack: Google Calendar API, OAuth 2.0, Node.js.

Implement task-based time tracking:

Add start/stop timer on task detail screen.

Save total time when task is completed.

Tech Stack: React Timer Hook, Firestore.

📍 10. CI/CD and Deployment
For Web App:

Set up GitHub Actions:

On push → Run tests → Build → Deploy to Vercel or Netlify.

Tech Stack: GitHub Actions, Vercel, Netlify.

For Mobile App:

Use EAS Build service from Expo:

Create Android (.apk) and iOS (.ipa) builds.

Use EAS Update for over-the-air updates.

Tech Stack: Expo EAS Build, EAS Update.

Maintain separate versioning for Web and Mobile.

Follow Semantic Versioning and Conventional Commits.

Tech Stack: Semantic Versioning (semver), Conventional Commits.

✨ Bonus: UI/UX Guidelines
For Web:

Use Material UI (MUI) or Tailwind CSS.

For Mobile:

Use React Native Paper or NativeWind.

Always add Skeleton Loading and Empty State Screens for better user experience.

🎯 Final Notes
✅ Always follow the exact order unless stated otherwise.
✅ Explain every step clearly in Turkish.
✅ Never leave any point unexplained.

📌 Ultimate Tech Stack (Updated)

🔧 Frontend (Mobile):
- React Native with Expo (Cross-platform mobile development)
- Expo Router for navigation
- AsyncStorage for local persistence

🔧 Frontend (Web):
- Django (backend framework)
- HTML, CSS, JavaScript (frontend templates)
- localStorage for session management

🔧 Backend:
- Firebase Firestore (Cloud NoSQL database)
- Firebase Authentication (user login/signup)
- Firebase Storage (for file uploads, profile images)
- Firebase Admin SDK (Node.js environment via Django management commands or separate functions)

🌐 Sync Architecture:
- Firestore Real-time Listeners (onSnapshot) ensure that all changes in Firestore are reflected instantly across platforms.
- Changes made on Web will reflect in Mobile via Firestore listeners and vice versa.
- Authentication state is synchronized using Firebase Auth.

🧠 AI Integration:
- Gemini API (task suggestion, prioritization)
- Whisper API (voice-to-text)
- Node.js services can be invoked via Django endpoints or serverless functions.

📲 Deployment:
- Web: GitHub Actions + Vercel/Netlify
- Mobile: Expo EAS Build for iOS & Android + OTA updates

