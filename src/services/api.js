import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthRequest = config.url.includes('/api/auth/sign-up') || config.url.includes('/api/auth/sign-in');
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API request:', config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default {
  login(credentials) {
    return api.post('/api/auth/sign-in', credentials);
  },
  register(data) {
    return api.post('/api/auth/sign-up', data);
  },
  getPagedUsers(page, size) {
    return api.get(`/api/auth?page=${page}&size=${size}`);
  },
  updateUser(id, data) {
    return api.put(`/api/auth/${id}`, data);
  },
  deleteUser(id) {
    return api.delete(`/api/auth/${id}`);
  },

  getMovies(page, size) {
    return api.get(`/api/movie?page=${page}&size=${size}`);
  },
  getMovie(id) {
    return api.get(`/api/movie/${id}`);
  },
  createMovie(data) {
    return api.post('/api/movie', data);
  },
  updateMovie(id, data) {
    return api.put(`/api/movie/${id}`, data);
  },
  getMoviesByPreferences(userId, page, size) {
    return api.get(`/api/movie/by-preferences?id=${userId}&page=${page}&size=${size}`);
  },
  searchMovies(query, page, size) {
    return api.get('/api/movie/search', { params: { query, page, size } });
  },
  deleteMovie(id) {
    return api.delete(`/api/movie/${id}`);
  },

  getGenres() {
    return api.get('/api/genre');
  },
  createGenre(data) {
    return api.post('/api/genre', data);
  },
  getPagedGenres(page, size) {
    return api.get(`/api/genre/paged?page=${page}&size=${size}`);
  },
  getGenre(id) {
    return api.get(`/api/genre/${id}`);
  },
  updateGenre(id, data) {
    return api.put(`/api/genre/${id}`, data);
  },
  deleteGenre(id) {
    return api.delete(`/api/genre/${id}`);
  },

  getCrewMembers() {
    return api.get('/api/crew-member');
  },
  getPagedCrewMembers(page, size) {
    return api.get(`/api/crew-member/paged?page=${page}&size=${size}`);
  },
  getCrewMember(id) {
    return api.get(`/api/crew-member/${id}`);
  },
  createCrewMember(data) {
    return api.post('/api/crew-member', data);
  },
  updateCrewMember(id, data) {
    return api.put(`/api/crew-member/${id}`, data);
  },
  deleteCrewMember(id) {
    return api.delete(`/api/crew-member/${id}`);
  },

  getComments(movieId, page = 0, size = 10) {
    return api.get(`/api/comment/${movieId}`, { params: { page, size } });
  },
  postComment(data) {
    return api.post('/api/comment', data);
  },
  updateComment(commentId, data) {
    return api.put(`/api/comment/${commentId}`, data);
  },
  deleteComment(commentId) {
    return api.delete(`/api/comment/${commentId}`);
  },

  createUserInfo(data) {
    return api.post('/api/user-info', data);
  },
  getUserInfo(userId) {
    return api.get(`/api/user-info/user/${userId}`);
  },
  updateUserInfo(id, data) {
    return api.put(`/api/user-info/${id}`, data);
  },
  deleteUserInfo(userId) {
    return api.delete(`/api/user-info/user/${userId}`);
  },
  getActors() {
    return api.get('/api/user-info/actors');
  },
  getDirectors() {
    return api.get('/api/user-info/directors');
  },

  createMovieCrew(data) {
    return api.post('/api/movie-crew', data);
  },
  getMovieCrew(movieId) {
    return api.get(`/api/movie-crew/movie/${movieId}`);
  },
  updateMovieCrew(id, data) {
    return api.put(`/api/movie-crew/${id}`, data);
  },
  deleteMovieCrew(id) {
    return api.delete(`/api/movie-crew/${id}`);
  },
  deleteMovieCrewByMovie(movieId) {
    return api.delete(`/api/movie-crew/movie/${movieId}`);
  },
};