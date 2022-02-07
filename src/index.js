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
  if (genreFilterParam === '' && sortFilterParam === 'asc') {
    const query = db.prepare('SELECT*FROM movies ORDER by name ASC');
    const moviesData = query.all();
    res.json({
      success: true,
      movies: moviesData,
    });
  } else if (genreFilterParam === '' && sortFilterParam === 'desc') {
    const query = db.prepare('SELECT*FROM movies ORDER by name DESC');
    const moviesData = query.all();
    res.json({
      success: true,
      movies: moviesData,
    });
  } else if (sortFilterParam === 'asc') {
    const queryGenre = db.prepare(
      'SELECT*FROM movies WHERE genre =? ORDER by name ASC'
    );
    const filterData = queryGenre.all(genreFilterParam);
    res.json({
      success: true,
      movies: filterData,
    });
  } else {
    const queryGenre = db.prepare(
      'SELECT*FROM movies WHERE genre =? ORDER by name DESC'
    );
    const filterData = queryGenre.all(genreFilterParam);
    res.json({
      success: true,
      movies: filterData,
    });
  }

  // const filteredMovies = moviesData
  // .filter((eachMovie) => {
  //   if (genreFilterParam === '') {
  //     return eachMovie;
  //   } else {
  //     return eachMovie.gender === genreFilterParam;
  //   }
  // })
  // .sort(function (a, b) {
  //   console.log(sortFilterParam);
  //   if (sortFilterParam === 'asc') {
  //     if (a.title > b.title) {
  //       return 1;
  //     }
  //     if (a.title < b.title) {
  //       return -1;
  //     }
  //   } else {
  //     if (a.title > b.title) {
  //       return -1;
  //     }
  //     if (a.title < b.title) {
  //       return 1;
  //     }
  //   }
  // });
});

server.post('/login', (req, res) => {
  console.log(req.body);
  const emailLogin = req.body.email;
  const passwordLogin = req.body.password;
  const foundUser = users.find(
    (eachUser) =>
      eachUser.password === passwordLogin && eachUser.email === emailLogin
  );
  if (foundUser) {
    res.json({
      success: true,
      userId: foundUser.id,
    });
  } else {
    res.json({
      success: false,
      errorMessage: 'Usuaria/o no encontrada/o',
    });
  }
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
