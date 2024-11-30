const express = require('express');
const { resolve } = require('path');

const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3010;

let db;
(async () => {
  db = await open({
    filename: './BD4.4/database.sqlite',
    driver: sqlite3.Database,
  });
})();

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

async function fetchAllMovies() {
  const query = 'SELECT id,title,release_year from movies';
  let response = await db.all(query, []);
  return { movies: response };
}

app.get('/movies', async (req, res) => {
  try {
    const allMovies = await fetchAllMovies();
    if (allMovies.movies.length === 0) {
      res.status(404).json({ error: 'Movies not found' });
    }
    res.status(200).json(allMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function filterMoviesByActor(actor) {
  const query =
    'select id, title, actor, release_year from movies where actor = ?';
  const response = await db.all(query, [actor]);
  return response;
}

app.get('/movies/actor/:actor', async (req, res) => {
  const actor = req.params.actor;
  try {
    const movies = await filterMoviesByActor(actor);
    if (movies.length === 0) {
      res.status(404).json({ error: 'Movies related the actor not found' });
    } else {
      res.status(200).json({ movies: movies });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function filterMoviesByDirector(director) {
  const query =
    'select id, title, director, release_year from movies where director = ?';
  const response = await db.all(query, [director]);
  return response;
}

app.get('/movies/director/:director', async (req, res) => {
  const director = req.params.director;
  try {
    const movies = await filterMoviesByDirector(director);
    if (movies.length === 0) {
      res.status(404).json({ error: 'Movies related the director not found' });
    } else {
      res.status(200).json({ movies: movies });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
