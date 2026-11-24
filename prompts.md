# prompts.md

Every prompt used, in order (including ones that didn't work).

1. "based on content of Salon_Queue_Management_Vibe_Coding_Guide.pdf assignment, create a plan for building this project. Initially we will build the core markdown files for AI context which are also specified in the document. Use HITL method to plan the entire flow, then we will start working on the project development."
   - Result: plan approved (Node/Express + polling, repo root = itp_last_lab, shared staff PIN).
2. (Approved plan) Draft docs/01-brief.md.
3. "Approved with the brief of the project, now create further docs."
   - Result: drafted docs/02-screens.md, docs/03-flows-rules.md, AGENTS.md.
4. "OK, go with your recommendations" (Step 1 scaffold: root package.json + Procfile for Heroku, Tailwind v4, in-memory store, Gujarati proofreading at Step 7)
   - Result: scaffolded client/ (Vite+React+Tailwind, 7 placeholder routes, EN/GU toggle) and server/ (Express /api/health). Build + health check pass.
5. "commit this and start step 2. I have checked the backend and the frontend and they are working fine."
   - Result: Step 1 committed (033d1f4); Step 2 built Home + Join Queue with dummy data (client-side only).
6. "I have connected the repository to heroku ... undefined error." / "how should i check whether both the deployed backend and frontend are connected" (questions, no code)
7. "start the step 3"
   - Result: server store/queueRules/API (join, spots, cancel, public, lookup, temporary dev routes) + client Home/Join on API + new Status screen.
8. "ok" (approved Step 4 plan: PIN gate + Reception Dashboard, waited-time on rows, NOSHOW_MINUTES for testing)
   - Result: server staff PIN/call-next/no-show/cancel/walk-in + receptionView; client StaffGate + Reception. Curl-tested rules.
9. "why haventthe salon is selecting barber for me" / "all barber is free ... it is showing queue and showing all barbers as free" (found a design gap: nothing called customers when a barber was free)
   - Decision: auto-call free barbers. Updated docs/03-flows-rules.md (rule 3a, flow, checklist) + docs/02-screens.md first, then server autoCall() in queueRules.js. Curl-tested.
10. "ok" (approved Step 5 plan: Barber View + TV, shared staff PIN, Web Audio chime, per-customer wait on TV)
   - Result: server barberStart/Done/setBreak/barberView/displayView + /api/barber/*, /api/display; removed temporary dev routes; client Barber.jsx + Display.jsx.
11. "Push the step 5 changes and start working on step 6, but before implementing anything, give me the brief of your plan..." then "Ok"
   - Step 5 pushed (b2879d9). Step 6 plan approved: off-duty rule, IST stats, edit/add (no delete) services.
   - Result: docs rules 16-18; server admin rules + /api/admin/*; client Admin.jsx; Status off-duty note; Barber off-duty handling.
12. "commit step 6, push it and give next plan brief." then "Ok" (Step 7: rules/edge cases/polish)
   - Step 6 pushed (3be6e8b). Step 7 approved: automated rules test, Gujarati table for proofreading, browser checks if available.
   - Result: injectable clock + store.reset(); server/test/rules.test.js (40 tests, all pass); CI runs tests; header link tap target and aria-label fixes; docs/gujarati-labels.md generated. No browser tool in this session, so visual checks left for the user.
13. "why vercel is not building from main... /admin url is not working" / "It is working." (diagnosis: Vercel was fine; Heroku CORS_ORIGIN held a one-off deployment URL)
14. "Now improvised the README, add URL of frontend (...e9m9ntnlc...) and backend (...). Write a brief about User flow, techstack, features, installation, how we developed this phase by phase."
   - Result: README rewritten. Used the stable alias https://itp-salon-queue-project.vercel.app instead of the e9m9ntnlc deployment URL (that one redirects to a Vercel login, so it fails "opens without setup").
15. "I want to redesign the user interface of this existing project to make it look modern, professional, visually attractive, and suitable for a high-quality college project submission... Deep Navy (#172554), Indigo (#6366F1), Soft neutral (#F8FAFC), Pure white cards, Inter/Manrope font."
   - Result: Overhauled entire UI with clean modern SaaS aesthetic across all screens (`/`, `/join`, `/status/:id`, `/reception`, `/barber/:id`, `/display`, `/admin`). Rebuilt icons, interactive cards, status rings, and responsive tables without touching backend contracts. Verified via `npm run build` (38 modules transformed, 0 errors).
16. "Review the current implementation of the redesigned application... Identify inconsistent spacing, button/input styles, responsive design issues, and missing visual feedback."
   - Result: Polished responsive layouts, touch target dimensions ($\ge$ 44px), form validation states, and empty state cards. Tested with `node --test` (40/40 passing).
17. "Rewrite the existing README.md file... Retain the exact section structure and headings required by the professor, but rewrite all descriptions and explanations using fresh, natural, student-authentic language without generic AI clichés."
   - Result: Rewrote `README.md` retaining all 11 mandatory sections and tables. Replaced boilerplate text with detailed, student-written explanations of architecture, data flow, auto-call dispatch, and testing mechanics.
18. "enable online queue joining."
   - Result: Diagnosed why online queue joining was closed: Rule 10 enforces an 8:30 PM IST cutoff. Because local testing took place at 10:54 PM IST, `isJoiningOpen()` returned `false`. Fixed by setting `process.env.IGNORE_HOURS = '1'` by default in `server/index.js` for development/testing, allowing 24/7 queue joining while retaining strict cutoff verification in `rules.test.js`.
19. "I now want to deploy this project publicly... Frontend: Vercel, Backend: Render... inspect project structure, CORS settings, proxy configs, environment variables, in-memory store."
   - Result: Configured production deployment pipeline: created `render.yaml` (Render Blueprint), root `vercel.json` (SPA routing rewrites), `server/.env.example`, updated `client/.env.example` with `VITE_API_URL`, updated root `package.json` with monorepo build/start scripts, and implemented multi-origin/wildcard sanitized CORS handling in `server/index.js`.
20. "replace every instance of the name 'Gitanshu Shankla' with 'Akash Lakhani' throughout my entire Salon Queue Management project... Update the README GitHub clone command to use my actual repository: https://github.com/Akashstudy/salon-queue-management.git"
   - Result: Conducted exhaustive recursive codebase search. Updated the GitHub clone command in `README.md` to point directly to `https://github.com/Akashstudy/salon-queue-management.git`. Confirmed zero occurrences of the previous author's name in active codebase files.
