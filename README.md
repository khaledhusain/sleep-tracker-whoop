# Restful Sleep Tracker

## Project related help
### Setting project up for the first time
- Run `git clone https://github.com/Sleep-Tracker-Thematic-Project/sleep-tracker.git`
- Open project with vscode or code editor of choice
- Run `cd ./frontend`
- Run `npm install`
- New terminal or run `cd ..`
- Run `cd ./backend`
- Run `npm install`
- You can now run `npm run dev` on the frontend and backend to start the project

### Running frontend

- `cd ./frontend`
- `npm run dev`

### Running backend
- `cd ./backend`
- `npm run dev`

### Branching
- Run `git branch feature/FEATURENAME`
- Run `git checkout feature/FEATURENAME`

### Merging
- Run `git pull` for current branch
- Run `git checkout main`
- Run `git pull`
- Run `git merge feature/FEATURENAME`
- Check any conflicts and ensure nothing is overwritten that shouldn't be

### Running unit tests
- Run the backend (commands above for running backend)
  - Run `npm run clean-test` in root project directory
- OR Delete the existing `sleeptracker.db` in `/backend/app/utils/sleeptracker.db`
  - Run the backend (commands above for running backend)
  - Run `npm run test` in root project directory
- Tests will output to the console with details

## Team Members
- Ellis Ollier
- Khaled Husain
- Joshua Roberts
- Favour Omoregie
- Abbie Roberts
- Ace Blakeburn
