const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

// create and config server
const server = express();
server.use(cors());
server.use(express.json());
server.set("view engine", "ejs");

// init express aplication
const serverPort = 4000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

const db = new Database("./src/db/database.db", { verbose: console.log });

// api endpoints
server.get("/movies", (req, res) => {
  const genreFilterParam = req.query.genre;
  const sortFilterParam = req.query.sort.toUpperCase();
  let moviesData = [];
  if (genreFilterParam === "") {
    const query = db.prepare(
      `SELECT*FROM movies ORDER BY name ${sortFilterParam}`
    );
    moviesData = query.all();
    console.log(query);
  } else {
    const queryGenre = db.prepare(
      `SELECT*FROM movies WHERE genre =? ORDER BY name ${sortFilterParam}`
    );
    moviesData = queryGenre.all(genreFilterParam);
  }
  res.json({
    success: true,
    movies: moviesData,
  });
});

server.post("/login", (req, res) => {
  const emailLogin = req.body.email;
  const passwordLogin = req.body.password;
  const query = db.prepare(
    "SELECT * FROM users WHERE email = ? AND password = ?"
  );
  const foundUser = query.get(emailLogin, passwordLogin);
  if (foundUser) {
    res.json({
      success: true,
      userId: foundUser.id,
    });
  } else {
    res.json({
      success: false,
      errorMessage: "Usuaria/o no encontrada/o",
    });
  }
});

server.get("/movie/:movieId", (req, res) => {
  const paramsId = req.params.movieId;
  const query = db.prepare("SELECT * FROM movies WHERE id =?");
  const foundMovie = query.get(paramsId);
  if (foundMovie === undefined) {
    const routeData = { route: req.url };
    res.render("page-not-found", routeData);
  } else {
    res.render("movie", foundMovie);
  }
});

server.post("/sign-up", (req, res) => {
  const emailSignUp = req.body.email;
  const passSignUp = req.body.password;
  const query = db.prepare("SELECT * FROM users WHERE email = ?");
  const foundUser = query.get(emailSignUp);
  if (foundUser) {
    res.json({
      success: false,
      errorMessage: "Usuaria/o ya registrada/o",
    });
  } else {
    const query = db.prepare(
      "INSERT INTO users (email, password) VALUES (?, ?)"
    );
    const resultUserInsert = query.run(emailSignUp, passSignUp);
    res.json({
      success: true,
      userId: resultUserInsert.lastInsertRowid,
    });
  }
});

server.patch("/user/profile", (req, res) => {
  const emailUpdate = req.body.email;
  const passUpdate = req.body.password;
  const nameUpdate = req.body.name;
  const id = req.headers["user-id"];
  const query = db.prepare(
    "UPDATE users SET email = ?, password = ?, name = ? WHERE id = ?"
  );
  const resultUpdate = query.run(emailUpdate, passUpdate, nameUpdate, id);
  if (resultUpdate.change !== 0) {
    res.json({
      success: true,
      errorMessage: "Usuaria/o modificada/o",
    });
  } else {
    res.json({
      success: false,
      errorMessage: "Ha ocurrido un error al modificar tus datos.",
    });
  }
});

server.get("/user/profile", (req, res) => {
  const id = req.headers["user-id"];
  const query = db.prepare("SELECT * FROM users WHERE id =?");
  const foundUser = query.get(id);
  if (foundUser === undefined) {
    res.json({
      success: false,
      errorMessage: "Ha ocurrido un error al modificar tus datos.",
    });
  } else {
    res.json(foundUser);
  }
});

server.get("/user/movies", (req, res) => {
  const id = req.headers["user-id"];
  const movieIdsQuery = db.prepare(
    "SELECT movieId FROM rel_movies_users WHERE userId =?"
  );
  const movieIds = movieIdsQuery.all(id);
  console.log(movieIds);
  // obtenemos las interrogaciones separadas por comas
  const moviesIdsQuestions = movieIds.map((id) => "?").join(", "); // que nos devuelve '?, ?'
  // preparamos la segunda query para obtener todos los datos de las películas
  const moviesQuery = db.prepare(
    `SELECT * FROM movies WHERE id IN (${moviesIdsQuestions})`
  );

  // convertimos el array de objetos de id anterior a un array de números
  const moviesIdsNumbers = movieIds.map((movie) => movie.movieId); // que nos devuelve [1.0, 2.0]
  // ejecutamos segunda la query
  const movies = moviesQuery.all(moviesIdsNumbers);

  // respondemos a la petición con
  res.json({
    success: true,
    movies: movies,
  });
});
const staticServerPathWeb = "./src/public-react"; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathWeb));

const staticServerPathImages = "./src/public-movies-images"; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathImages));

const staticServerPathMovieStyles = "./src/public-movie-styles"; // En esta carpeta ponemos los ficheros estáticos
server.use(express.static(staticServerPathMovieStyles));

server.get("*", (req, res) => {
  const routeData = { route: req.url };
  res.render("page-not-found", routeData);
});
