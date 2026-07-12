# Harvest — Nutrition Assistant (Connected Package)

This package contains the **backend** (Node/Express/MongoDB API) and the **frontend**
(`frontend.html`) already wired to talk to it. Nothing runs automatically — you need to
start the backend, then open the frontend against it.

## 1. Start the backend

```
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — a local MongoDB instance or a MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — leave unset for local testing (defaults to allow all origins)

Make sure MongoDB is running, then:

```
npm run dev
```

You should see `Server running in development mode on port 5000`.
Verify it's alive: open `http://localhost:5000/api/health` in a browser — it should
return `{"success":true,"message":"Nutrition Assistant API is running"}`.

## 2. Open the frontend

Open `frontend.html` directly in a browser (double-click it, or drag it into a tab).

On load, the login screen checks the connection automatically and shows either:
- **"Connected to Harvest API"** — you're good to go
- **"Can't reach the API — is the backend running?"** — the backend isn't up yet, or
  is running on a different host/port than `http://localhost:5000`

If you deploy the backend somewhere other than `localhost:5000`, update the `API_BASE`
constant near the top of the `<script>` tag in `frontend.html`.

## 3. Use it

- Register a new account from the login screen (choose "Individual" or "Registered
  dietitian"). A `Client` profile is created automatically for individual users.
- Log in and you'll land on **Today's Plate**, with calorie/protein targets pulled
  from your `Client` record.
- **Log a Meal** adds food to today's `MealPlan` and saves it to the backend
  (watch the "synced"/"saving…" badge in the sidebar).
- Recipes, Learn, and Talk to a Pro tabs are static demo content — not backed by the
  API yet.

## What's already fixed for this to work

The backend's meal-plan update endpoint originally blocked the `user` role from
editing their own plan (only dietitians/admins could). That's been patched so a
client can update their own meal plan — required for the "Log a Meal" feature to
persist changes. Deleting an entire plan is still restricted to dietitians/admins.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Can't reach the API" on the login screen | Backend isn't running, or wrong port/host in `API_BASE` |
| Login/register fails with a network error | Backend down, or `MONGO_URI` misconfigured (check the backend terminal for connection errors) |
| Login succeeds but dashboard stays empty | Check the browser console — likely a failed `/api/clients` or `/api/mealplans` call; confirm the account registered with role `user` (dietitians/admins don't get an auto-created client) |
| "sync failed" badge after adding food | Backend went down mid-session, or the JWT expired — try logging out and back in |
