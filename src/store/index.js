import { createStore } from 'vuex';
import api from '@/services/api';
import debounce from 'lodash/debounce';

const store = createStore({
  state() {
    return {
      token: localStorage.getItem('token') || null,
      user: JSON.parse(localStorage.getItem('user')) || null,
      searchResults: [],
      searchQuery: '',
      searchPage: 0,
      searchTotalPages: 0,
      comments: [],
      adminMovies: [],
      adminCrewMembers: [],
      adminGenres: [],
      adminMoviesPage: 0,
      adminCrewPage: 0,
      adminGenresPage: 0,
      adminMoviesTotalPages: 0,
      adminCrewTotalPages: 0,
      adminGenresTotalPages: 0,
    };
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.searchResults = [];
      state.searchQuery = '';
      state.searchPage = 0;
      state.searchTotalPages = 0;
      state.comments = [];
      state.adminMovies = [];
      state.adminCrewMembers = [];
      state.adminGenres = [];
      state.adminMoviesPage = 0;
      state.adminCrewPage = 0;
      state.adminGenresPage = 0;
      state.adminMoviesTotalPages = 0;
      state.adminCrewTotalPages = 0;
      state.adminGenresTotalPages = 0;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setSearchQuery(state, query) {
      state.searchQuery = query;
    },
    setSearchResults(state, { results, totalPages, page }) {
      state.searchResults = results;
      state.searchPage = page;
      state.searchTotalPages = totalPages;
    },
    clearSearch(state) {
      state.searchResults = [];
      state.searchQuery = '';
      state.searchPage = 0;
      state.searchTotalPages = 0;
    },
    setComments(state, comments) {
      state.comments = comments;
    },
    setAdminMovies(state, { items, page, totalPages }) {
      state.adminMovies = items;
      state.adminMoviesPage = page;
      state.adminMoviesTotalPages = totalPages;
    },
    setAdminCrewMembers(state, { items, page, totalPages }) {
      state.adminCrewMembers = items;
      state.adminCrewPage = page;
      state.adminCrewTotalPages = totalPages;
    },
    setAdminGenres(state, { items, page, totalPages }) {
      state.adminGenres = items;
      state.adminGenresPage = page;
      state.adminGenresTotalPages = totalPages;
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await api.login(credentials);
        commit('setToken', response.data.token);
        commit('setUser', response.data.user);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
    },
    async register({ commit }, data) {
      try {
        const response = await api.register(data);
        commit('setToken', response.data.token);
        commit('setUser', response.data.user);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
    },
    async logout({ commit }) {
      commit('logout');
    },
    searchMovies: debounce(async ({ commit }, { query, page = 0 }) => {
      try {
        const response = await api.searchMovies(query, page, 12);
        commit('setSearchResults', {
          results: response.data.content,
          totalPages: response.data.page?.totalPages,
          page,
        });
        return response.data;
      } catch (error) {
        console.error('searchMovies error:', error);
        throw new Error(error.response?.data?.message || 'Search failed');
      }
    }, 500),
    async fetchComments({ commit }, { movieId, page = 0, size = 10 }) {
      try {
        const response = await api.getComments(movieId, page, size);
        commit('setComments', response.data.content);
        return response.data;
      } catch (error) {
        console.error('fetchComments error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch comments');
      }
    },
    async postComment({ state }, commentData) {
      try {
        if (!state.user?.id) {
          throw new Error('Пользователь не авторизован');
        }
        const payload = {
          ...commentData,
          userId: state.user.id,
        };
        const response = await api.postComment(payload);
        return response.data;
      } catch (error) {
        console.error('postComment error:', error);
        throw new Error(error.response?.data?.message || 'Failed to post comment');
      }
    },
    async fetchAdminMovies({ commit }, { page = 0, size = 12 }) {
      try {
        const response = await api.getMovies(page, size);
        commit('setAdminMovies', {
          items: response.data.content || [],
          page: response.data.page?.number || page,
          totalPages: response.data.page?.totalPages || 1,
        });
        return response.data;
      } catch (error) {
        console.error('fetchAdminMovies error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch movies');
      }
    },
    async fetchAdminCrewMembers({ commit }, { page = 0, size = 20 }) {
      try {
        const response = await api.getPagedCrewMembers(page, size);
        commit('setAdminCrewMembers', {
          items: response.data.content || [],
          page: response.data.page?.number || page,
          totalPages: response.data.page?.totalPages || 1,
        });
        return response.data;
      } catch (error) {
        console.error('fetchAdminCrewMembers error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch crew members');
      }
    },
    async fetchAdminGenres({ commit }, { page = 0, size = 20 }) {
      try {
        const response = await api.getPagedGenres(page, size);
        commit('setAdminGenres', {
          items: response.data.content || [],
          page: response.data.page?.number || page,
          totalPages: response.data.page?.totalPages || 1,
        });
        return response.data;
      } catch (error) {
        console.error('fetchAdminGenres error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch Genres');
      }
    },
    async deleteAdminItem({ commit, state }, { tab, id }) {
      try {
        if (tab === 'movies') {
          await api.deleteMovie(id);
          const page = state.adminMoviesPage;
          const response = await api.getMovies(page, 12);
          commit('setAdminMovies', {
            items: response.data.content || [],
            page: response.data.page?.number || page,
            totalPages: response.data.page?.totalPages || 1,
          });
        } else if (tab === 'crew') {
          await api.deleteCrewMember(id);
          const page = state.adminCrewPage;
          const response = await api.getPagedCrewMembers(page, 20);
          commit('setAdminCrewMembers', {
            items: response.data.content || [],
            page: response.data.page?.number || page,
            totalPages: response.data.page?.totalPages || 1,
          });
        } else if (tab === 'Genres') {
          await api.deleteGenre(id);
          const page = state.adminGenresPage;
          const response = await api.getPagedGenres(page, 20);
          commit('setAdminGenres', {
            items: response.data.content || [],
            page: response.data.page?.number || page,
            totalPages: response.data.page?.totalPages || 1,
          });
        }
      } catch (error) {
        console.error(`deleteAdminItem error (${tab}):`, error);
        throw new Error(error.response?.data?.message || `Failed to delete ${tab}`);
      }
    },
  },
});

export default store;