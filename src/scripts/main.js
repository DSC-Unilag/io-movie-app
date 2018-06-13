'use strict';

const refreshButton = document.querySelector('#butRefresh');
const state = {};

state.pageNo = 1;

refreshButton.addEventListener('pointerup', reload);

function reload() {
  state.pageNo = 1;
  document.querySelector('.movies-container').innerHTML = '';
  showLoader();
  fetchMovies();
}

function getRating(rating) {
  let no = Number(rating.toFixed(0));
  return Array(no)
    .fill('')
    .reduce((prev, curr) => prev + '❤', '');
}

const renderMovie = movie =>
  `<div class="movie">
  <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-img"></img>
  <div class="movie-container">
    <div class="movie-title">${movie.title}</div>
    <div class="movie-subtitle">${getRating(movie.vote_average)}</div>
  </div>
</div>`;

/**
 * Inserts HTML String into an element at a given selector
 * @param {String} sel Selector of HTMELement
 * @param {String} str HTMLString
 * @param {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} pos position in dom to insert string
 */
function insertIntoDom(sel, str, pos = 'beforeend') {
  const elem = document.querySelector(sel);
  elem && elem.insertAdjacentHTML(pos, str);
}

const insertMovie = movie => insertIntoDom('.movies-container', movie);

async function fetchMovies() {
  try {
    const res = await fetch('https://movie-ease.herokuapp.com/api/movies/latest/1').then(res => res.json());
    JSON.parse(res)
      .results.map(renderMovie)
      .forEach(insertMovie);
  } catch (err) {
    const error = `
    <div style="text-align: center; padding: 40px 0px;">
      A network error occurred, Are you online?
    </div>
    `;
    insertIntoDom('.movies-container', error);
  }
  hideLoader();
}

fetchMovies();

function hideLoader() {
  document.querySelector('.loader').style.display = 'none';
}

function showLoader() {
  document.querySelector('.loader').style.display = 'initial';
}
