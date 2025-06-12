cd backend
npm install
npx knex migrate:latest
npx knex seed:run
node src/index.js

cd frontend
npm install
npm run dev