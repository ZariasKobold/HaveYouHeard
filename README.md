# HeardTale🎙️

> Never lose a recommendation again.

A personal recommendation tracker for everything worth watching, reading, playing, eating, and buying. Built as a single-page app with Supabase for auth and data sync across all your devices.

## Features

- **6 built-in categories** — Shows & Movies, Books, Video Games, Board Games, Places to Eat, Stuff to Buy
- **Custom categories** — add anything else you can think of
- **Quick Add** — capture a recommendation in seconds (title + category + who told you)
- **Full item details** — status, priority, tags, rating (1–10), notes, dates
- **Auto image fetching** — pulls cover art from TMDB, Open Library, RAWG, and BoardGameGeek
- **Grid & list views** — toggle per category
- **Status filters** — Backlog / In Progress / Completed / Abandoned
- **Random Pick** — can't decide? let the app choose from your backlog
- **Stats dashboard** — completion rates, avg ratings, top recommenders, tag breakdowns
- **CSV export** — your data is always yours
- **Syncs across devices** — powered by Supabase

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database schema

In the Supabase SQL Editor, run the contents of `schema.sql` to create all tables, indexes, RLS policies, and seed the default categories.

### 3. Update your credentials

In `index.html`, replace the two config values near the top of the `<script>` block:

```js
const SUPABASE_URL = 'your-project-url';
const SUPABASE_KEY = 'your-anon-key';
```

Both can be found in your Supabase project under **Settings → API**.

### 4. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push this folder's contents to the `main` branch
3. Go to **Settings → Pages** and set the source to `main` / `root`
4. Your app will be live at `https://yourusername.github.io/your-repo-name`

### Custom Domain (optional)

1. In your repo, go to **Settings → Pages → Custom domain**
2. Enter your domain (e.g. `haveyouheard.yourdomain.com`)
3. In your domain registrar's DNS settings, add a CNAME record pointing to `yourusername.github.io`

## Tech Stack

- Vanilla HTML/CSS/JS — no build step required
- [Supabase](https://supabase.com) — auth + Postgres database
- [TMDB API](https://www.themoviedb.org/documentation/api) — movie/show images
- [Open Library](https://openlibrary.org/developers) — book covers
- [RAWG API](https://rawg.io/apidocs) — game images
- [BoardGameGeek API](https://boardgamegeek.com/wiki/page/BGG_XML_API2) — board game images
- Google Fonts — Playfair Display + DM Sans
