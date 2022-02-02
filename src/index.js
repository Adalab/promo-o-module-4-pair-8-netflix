const express = require("express");
const cors = require("cors");
const moviesData = require("./data/movies.json");

// create and config server
const server = express();
server.use(cors());
server.use(express.json());

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

// api endpoints
server.get("/movies", (req, res) => {
  const genreFilterParam = req.query.genre;
  const sortFilterParam = req.query.sort;
  const filteredMovies = moviesData
    .filter((eachMovie) => {
      if (genreFilterParam === "") {
        return eachMovie;
      } else {
        return eachMovie.gender === genreFilterParam;
      }
    })
    .sort(function (a, b) {
      console.log(sortFilterParam);
      if (sortFilterParam === "asc") {
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
