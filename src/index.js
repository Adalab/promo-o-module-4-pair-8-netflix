const express = require('express');
const cors = require('cors');
const moviesData = require('./data/movies.json');
const users = require('./data/users.json');

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

const staticServerPathWeb = './src/public-react'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathWeb));

const staticServerPathImages = './src/public-movies-images'; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathImages));

// api endpoints
server.get('/movies', (req, res) => {
  const genreFilterParam = req.query.genre;
  const sortFilterParam = req.query.sort;
  const filteredMovies = moviesData
    .filter((eachMovie) => {
      if (genreFilterParam === '') {
        return eachMovie;
      } else {
        return eachMovie.gender === genreFilterParam;
      }
    })
    .sort(function (a, b) {
      console.log(sortFilterParam);
      if (sortFilterParam === 'asc') {
        if (a.title > b.title) {
          return 1;
        }
        if (a.title < b.title) {
          return -1;
        }
      } else {
        if (a.title > b.title) {
          return -1;
        }
        if (a.title < b.title) {
          return 1;
        }
      }
    });
  res.json({
    success: true,
    movies: filteredMovies,
  });
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
