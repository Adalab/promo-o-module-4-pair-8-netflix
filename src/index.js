const express = require('express');
const cors = require('cors');
//const moviesData = require('./data/movies.json');
const users = require('./data/users.json');
const Database = require('better-sqlite3');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());
server.set('view engine', 'ejs');

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

const db = new Database('./src/db/database.db', { verbose: console.log });

// api endpoints
server.get('/movies', (req, res) => {
  const genreFilterParam = req.query.genre;
  const sortFilterParam = req.query.sort;
  // const sortFilterParam = req.query.sort.toUpperCase();
  console.log(sortFilterParam);
  let moviesData = [];
  // if (genreFilterParam === "") {
  //   const query = db.prepare("SELECT*FROM movies ORDER BY name ?");
  //   moviesData = query.all(sortFilterParam);
  // } else {
  //   const queryGenre = db.prepare(
  //     "SELECT*FROM movies WHERE genre =? ORDER BY name ?"
  //   );
  //   moviesData = queryGenre.all(genreFilterParam, sortFilterParam);
  // }
  // res.json({
  //   success: true,
  //   movies: moviesData,
  // });

  if (genreFilterParam === '') {
    let query;
    if (sortFilterParam === 'asc') {
      query = db.prepare('SELECT*FROM movies ORDER BY name');
    } else {
      query = db.prepare('SELECT*FROM movies ORDER BY name DESC');
    }
    moviesData = query.all();
  } else {
    let query;
    if (sortFilterParam === 'asc') {
      query = db.prepare('SELECT*FROM movies WHERE genre =? ORDER BY name');
    } else {
      query = db.prepare(
        'SELECT*FROM movies WHERE genre =? ORDER BY name DESC'
      );
    }
    moviesData = query.all(genreFilterParam);
  }
  res.json({
    success: true,
    movies: moviesData,
  });
});

server.post('/login', (req, res) => {
  const emailLogin = req.body.email;
  const passwordLogin = req.body.password;
  const query = db.prepare(
    'SELECT * FROM users WHERE email = ? AND password = ?'
  );
  const foundUser = query.get(emailLogin, passwordLogin);
if (foundUser) {
  res.json({
    success: true,
    userId: foundUser.id
  })
} else {
  res.json({
    success: false,
    errorMessage: 'Usuaria/o no encontrada/o',
  })
}

  // const emailLogin = req.body.email;
  // const passwordLogin = req.body.password;
  // const foundUser = users.find(
  //   (eachUser) =>
  //     eachUser.password === passwordLogin && eachUser.email === emailLogin
  // );
  // if (foundUser) {
  //   res.json({
  //     success: true,
  //     userId: foundUser.id,
  //   });
  // } else {
  //   res.json({
  //     success: false,
  //     errorMessage: 'Usuaria/o no encontrada/o',
  //   });
  // }
});

server.get('/movie/:movieId', (req, res) => {
  const paramsId = req.params.movieId;
  const query = db.prepare('SELECT * FROM movies WHERE id =?');
  const foundMovie = query.get(paramsId);
  // const foundMovie = moviesData.find((eachMovie) => eachMovie.id === paramsId);
  if (foundMovie === undefined) {
    const routeData = { route: req.url };
    res.render('page-not-found', routeData);
  } else {
    res.render('movie', foundMovie);
  }
});

const staticServerPathWeb = './src/public-react'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathWeb));

const staticServerPathImages = './src/public-movies-images'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathImages));

const staticServerPathMovieStyles = './src/public-movie-styles'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathMovieStyles));

server.get('*', (req, res) => {
  const routeData = { route: req.url };
  res.render('page-not-found', routeData);
});
