import React from "react";

const MoviesList = (props) => {
  const renderMovieList = () => {
    return <ul className="cards">{renderMovies()}</ul>;
  };
  // const handleMoviesClick = (event) => {
  //   return fetch(`//localhost:4000/movie/${event.currentTarget.id}`, {
  //     method: "GET",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       return data;
  //     });
  // };
  const renderMovies = () => {
    return props.movies.map((movie) => {
      return (
        <li
          id={movie.id}
          key={movie.id}
          className="card"
          // onClick={handleMoviesClick}
        >
          <img
            className="card__img"
            src={movie.image}
            alt={`Carátula de ${movie.name}`}
          />
          <h3 className="card__title">{movie.name}</h3>
          <p className="card__description">Género: {movie.genre}</p>
          <a href={`//localhost:4000/movie/${movie.id}`}> Ver detalle</a>
        </li>
      );
    });
  };

  const renderEmptyList = () => {
    return <p>No hay películas en este listado</p>;
  };

  return props.movies.length ? renderMovieList() : renderEmptyList();
};

export default MoviesList;
