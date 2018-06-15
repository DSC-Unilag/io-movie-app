'use strict';

const state = {
  movies: [],
  page: 1
};

if (location.href.search('index.html') > -1 || location.href.search(/src\/$/) > -1) {
  fetchMovies();
} else if (location.href.search(/movie.html#\d+/) > -1) {
  const movie = localStorage.getItem('currentMovie');
  localStorage.removeItem('currentMovie');
  if (movie) {
    renderSingleMovie(JSON.parse(movie));
  }
  const movieId = location.hash.substr(1);
  fetch(`https://movie-ease.herokuapp.com/movies/one/${movieId}?short=yes`)
    .then(res => res.json())
    .then(renderFullSingleMovie);
}

window.addEventListener('online', e => console.log('App is now online', e));
window.addEventListener('offline', e => console.log('App is now offline', e));
document.addEventListener('pointerup', e => {
  const tar = e.target;
  if (tar.matches('#butRefresh')) {
    state.page = 1;
    reload(e);
  } else if (tar.matches('.movie, .movie > *')) {
    console.log('kjsdkjdfjkjjk');
    const movieDetails = state.movies[tar.dataset.id];
    localStorage.setItem('currentMovie', JSON.stringify(movieDetails));
    open(`movie.html#${tar.dataset.movieId}`, '_self');
  } else if (tar.matches('#load-more-button')) {
    state.page++;
    (async () => {
      tar.textContent = 'Loading...';
      await fetchMovies();
      tar.textContent = 'Load More';
    })();
  }
});

const renderMovie = ({ id, poster_path, title, vote_average }, i) =>
  `<div data-id='${i}' data-movie-id='${id}' class='movie'>
    <img height='auto' data-id='${i}' data-movie-id='${id}' src='https://image.tmdb.org/t/p/w500${poster_path}'
      alt='${title}' class='movie-img'></img>
    <div class='movie-container'>
      <div class='movie-title'>${title}</div>
      <div class='movie-rating'>
        <span class='rating'>${getRating(vote_average)}</span>
        </div>
    </div>
  </div>`;

/**
 * Inserts HTML String into an element at a given selector
 * @param {String} sel Selector of HTMELement
 * @param {String} str HTMLString
 * @param {'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'} pos position in dom to insert string
 */
function insertIntoDom(sel, str, pos = 'beforeend') {
  const elem = document.querySelector(sel);
  elem && elem.insertAdjacentHTML(pos, str);
}

const insertMovie = movie => insertIntoDom('.movies-list', movie);

async function fetchMovies() {
  hide('#load-more-button');
  try {
    const res = await fetch('https://movie-ease.herokuapp.com/movies/latest/' + state.page).then(
      res => res.json()
    );
    JSON.parse(res)
      .results.map(movie => {
        state.movies.push(movie);
        return movie;
      })
      .map(renderMovie)
      .forEach(insertMovie);
    show('#load-more-button', 'inline-block');
  } catch (err) {
    console.log(err);
    const error = `
    <div style='text-align: center; padding: 40px 0px;'>
      A network error occurred, Are you online?
    </div>
    `;
    insertIntoDom('.movies-list', error);
  }
  hide('.loader');
}

function renderSingleMovie(movie) {
  const q = document.querySelector.bind(document);
  q('h1.header__title').textContent = movie.title;
  q('.movie-image').style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${
    movie.poster_path
  })`;
  q('.movie-details .movie-title').textContent = movie.original_title;
  q('.movie-details .movie-overview div:nth-last-of-type(2)').textContent = movie.overview;
  // movie.vote_average
}

function renderFullSingleMovie(movieStr) {
  const q = document.querySelector.bind(document);
  const movie = JSON.parse(movieStr);
  q('h1.header__title').textContent = movie.title;
  q('.movie-image').style.backgroundImage = `url(https://image.tmdb.org/t/p/w500${
    movie.poster_path
  })`;
  q('.movie-details .movie-title').textContent = movie.original_title;
  q('.movie-details .movie-subtitle').textContent = movie.tagline;
  q('.movie-details .movie-rating').innerHTML = getRating(movie.vote_average);
  q('.movie-details .movie-genres').innerHTML = movie.genres.reduce(
    (prev, curr) => prev + `<div>${curr.name}</div>`,
    ''
  );
  q('.movie-details .movie-release-date span').textContent = new Date(
    movie.release_date
  ).toDateString();
  q('.movie-details .movie-overview div:nth-last-of-type(2)').textContent = movie.overview;
}

function hide(selector) {
  document.querySelector(selector)
    ? (document.querySelector(selector).style.display = 'none')
    : null;
}

function show(selector, display = 'inital') {
  document.querySelector(selector)
    ? (document.querySelector(selector).style.display = display)
    : null;
}

function reload() {
  state.pageNo = 1;
  document.querySelector('.movies-list').innerHTML = '';
  show('.loader');
  fetchMovies();
}

// Renders the ratings for each movie on the home page
function getRating(rating) {
  let no = Number((rating / 2).toFixed(0));
  return (
    Array(no)
      .fill('')
      .reduce((prev, curr) => prev + '&starf;', '') + ''.padEnd((5 - no) * 6, '&star;')
  );
}

/**
 *
 * SERVICE WORKER REGISTRATION
 *
 */

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', e => {
//     const reg = window.navigator.serviceWorker.register('sw.js').then(() => console.log('service worker registered'));
//   });
// } else {
//   console.log('No service worker here');
// }
