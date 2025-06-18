<template>
  <div class="movie-list-container">
    <h1>Фильмы и сериалы</h1>
    <div class="filters">
      <div class="filter-group">
        <button class="filter-button" @click="toggleGenreDropdown">
          Жанры ({{ selectedGenres.length }})
        </button>
        <div class="dropdown" v-if="showGenreDropdown">
          <label v-for="genre in genres" :key="genre.id" class="checkbox-label">
            <input type="checkbox" v-model="selectedGenres" :value="genre.id">
            {{ genre.name }}
          </label>
        </div>
      </div>
      <div class="filter-group">
        <button class="filter-button" @click="toggleRatingDropdown">
          Рейтинг ({{ selectedAgeRating || 'Все' }})
        </button>
        <div class="dropdown" v-if="showRatingDropdown">
          <label class="checkbox-label">
            <input type="radio" v-model="selectedAgeRating" value="">
            Все
          </label>
          <label v-for="rating in ageRatings" :key="rating" class="checkbox-label">
            <input type="radio" v-model="selectedAgeRating" :value="rating">
            {{ rating }}
          </label>
        </div>
      </div>
      <div class="filter-group">
        <div class="year-range">
          <input
            type="number"
            v-model.number="yearFrom"
            placeholder="Год. От:"
            class="filter-input"
            min="1900"
            max="2025"
          >
          <input
            type="number"
            v-model.number="yearTo"
            placeholder="Год. До:"
            class="filter-input"
            min="1900"
            max="2025"
          >
        </div>
      </div>
      <div class="filter-group">
        <select v-model="sortBy" class="sort-select">
          <option value="titleAsc">По названию А–Я</option>
          <option value="titleDesc">По названию Я–А</option>
          <option value="yearAsc">По году (старые)</option>
          <option value="yearDesc">По году (новые)</option>
        </select>
      </div>
      <button class="clear-button" @click="clearFilters">Очистить фильтры</button>
    </div>
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="filteredMovies.length === 0" class="no-movies">
      {{ route.query.search ? 'Фильмы не найдены' : 'Нет фильмов, соответствующих фильтрам.' }}
    </div>
    <div v-else class="movie-grid">
      <div v-for="movie in filteredMovies" :key="movie.id" class="movie-card">
        <div class="movie-header">
          <router-link :to="`/movies/${movie.id}`" class="movie-title">
            <h3>{{ movie.title }}</h3>
          </router-link>
          <span class="movie-rating">{{ movie.ageRating }}</span>
        </div>
        <div class="movie-content">
          <router-link :to="`/movies/${movie.id}`" class="movie-poster-link">
            <img :src="formatPoster(movie.poster)" :alt="movie.title" class="movie-poster" />
          </router-link>
          <div class="movie-details">
            <p class="movie-year">{{ formatYear(movie.releaseDate) }}</p>
            <p class="movie-genres">{{ formatGenres(movie.genreIds) }}</p>
            <p class="movie-average-rating">{{ formatAverageRating(movie.averageRating) }}</p>
          </div>
        </div>
        <p class="movie-description">{{ movie.description }}</p>
        <router-link :to="`/movies/${movie.id}`" class="details-button">Подробнее</router-link>
      </div>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button
        :disabled="currentPage === 0"
        @click="changePage(currentPage - 1)"
        class="pagination-button"
      >
        Назад
      </button>
      <span>Страница {{ currentPage + 1 }} из {{ totalPages }}</span>
      <button
        :disabled="currentPage >= totalPages - 1"
        @click="changePage(currentPage + 1)"
        class="pagination-button"
      >
        Вперед
      </button>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';

export default {
  name: 'MovieList',
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const movies = ref([]);
    const genres = ref([]);
    const currentPage = ref(0);
    const pageSize = 12;
    const totalPages = ref(1);
    const error = ref('');
    const isLoading = ref(false);

    const selectedGenres = ref([]);
    const selectedAgeRating = ref('');
    const yearFrom = ref(null);
    const yearTo = ref(null);
    const sortBy = ref('titleAsc');
    const showGenreDropdown = ref(false);
    const showRatingDropdown = ref(false);

    const ageRatings = ref(['G', 'PG', 'PG-13', 'R', 'NC-17']);

    const fetchGenres = async () => {
      try {
        const response = await api.getGenres();
        genres.value = response.data;
      } catch (err) {
        console.error('Ошибка загрузки жанров:', err);
      }
    };

    const fetchMovies = async (page) => {
      isLoading.value = true;
      try {
        if (route.query.search) {
          await store.dispatch('searchMovies', {
            query: route.query.search,
            page,
          });
          movies.value = store.state.searchResults || [];
          currentPage.value = store.state.searchPage || page;
          totalPages.value = store.state.searchTotalPages || 1;
        } else {
          const response = await api.getMovies(page, pageSize);
          movies.value = response.data.content || [];
          currentPage.value = response.data.number || page;
          totalPages.value = response.data.totalPages || 1;
        }
        error.value = '';
      } catch (err) {
        error.value = route.query.search
          ? 'Ошибка поиска фильмов. Проверьте запрос или подключение.'
          : 'Ошибка загрузки фильмов. Проверьте подключение.';
        console.error('fetchMovies error:', err);
        movies.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const changePage = (page) => {
      router.push({
        path: '/',
        query: {
          ...route.query,
          page,
        },
      });
    };

    const formatYear = (date) => {
      if (!date) return 'N/A';
      const [year] = date.split('-');
      return year || 'N/A';
    };

    const formatPoster = (poster) => {
      if (!poster) return 'https://via.placeholder.com/150x225?text=No+Image';
      if (poster.startsWith('data:image')) return poster;
      return `data:image/jpeg;base64,${poster}`;
    };

    const formatGenres = (genreIds) => {
      if (!Array.isArray(genreIds) || !genres.value.length) return 'N/A';
      return genreIds
        .map((id) => {
          const genre = genres.value.find((g) => g.id === id);
          return genre ? genre.name : null;
        })
        .filter(Boolean)
        .join(', ') || 'N/A';
    };

    const formatAverageRating = (rating) => {
      if (rating === null || rating === undefined) return 'Нет оценок';
      return `★ ${rating.toFixed(1)}/10`;
    };

    const filteredMovies = computed(() => {
      let filtered = route.query.search ? [...(store.state.searchResults || [])] : [...movies.value];

      if (selectedGenres.value.length > 0) {
        filtered = filtered.filter((movie) =>
          movie.genreIds.some((id) => selectedGenres.value.includes(id))
        );
      }

      if (selectedAgeRating.value) {
        filtered = filtered.filter((movie) => movie.ageRating === selectedAgeRating.value);
      }

      if (yearFrom.value || yearTo.value) {
        filtered = filtered.filter((movie) => {
          const year = parseInt(formatYear(movie.releaseDate)) || 0;
          if (yearFrom.value && year < yearFrom.value) return false;
          if (yearTo.value && year > yearTo.value) return false;
          return true;
        });
      }

      filtered.sort((a, b) => {
        if (sortBy.value === 'titleAsc') {
          return a.title.localeCompare(b.title);
        } else if (sortBy.value === 'titleDesc') {
          return b.title.localeCompare(a.title);
        } else if (sortBy.value === 'yearAsc') {
          const yearA = parseInt(formatYear(a.releaseDate)) || 0;
          const yearB = parseInt(formatYear(b.releaseDate)) || 0;
          return yearA - yearB;
        } else if (sortBy.value === 'yearDesc') {
          const yearA = parseInt(formatYear(a.releaseDate)) || 0;
          const yearB = parseInt(formatYear(b.releaseDate)) || 0;
          return yearB - yearA;
        }
        return 0;
      });

      return filtered;
    });

    const toggleGenreDropdown = () => {
      showGenreDropdown.value = !showGenreDropdown.value;
      showRatingDropdown.value = false;
    };

    const toggleRatingDropdown = () => {
      showRatingDropdown.value = !showRatingDropdown.value;
      showGenreDropdown.value = false;
    };

    const clearFilters = () => {
      selectedGenres.value = [];
      selectedAgeRating.value = '';
      yearFrom.value = null;
      yearTo.value = null;
      sortBy.value = 'titleAsc';
    };

    watch(
      () => route.query,
      () => {
        currentPage.value = parseInt(route.query.page || '0', 10);
        fetchMovies(currentPage.value);
      },
      { deep: true, immediate: true }
    );

    onMounted(() => {
      fetchGenres();
    });

    return {
      movies,
      genres,
      currentPage,
      totalPages,
      fetchMovies,
      error,
      isLoading,
      formatYear,
      formatPoster,
      formatGenres,
      formatAverageRating,
      selectedGenres,
      selectedAgeRating,
      yearFrom,
      yearTo,
      sortBy,
      ageRatings,
      filteredMovies,
      showGenreDropdown,
      showRatingDropdown,
      toggleGenreDropdown,
      toggleRatingDropdown,
      clearFilters,
      route,
      changePage,
    };
  },
};
</script>

<style scoped>
.movie-list-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
  background-color: #f8f8f8;
}

h1 {
  font-size: 22px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
}

.filter-group {
  position: relative;
}

.filter-button {
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  min-width: 150px;
  text-align: left;
}

.filter-button:hover {
  background-color: #e0e0e0;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1200;
  max-height: 200px;
  overflow-y: auto;
  min-width: 150px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #333;
  margin: 5px 0;
}

.checkbox-label input {
  margin-right: 8px;
}

.year-range {
  display: flex;
  gap: 10px;
}

.filter-input {
  padding: 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100px;
}

.sort-select {
  padding: 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  cursor: pointer;
}

.clear-button {
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-button:hover {
  background-color: #c82333;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.movie-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
  transition: transform 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.movie-title {
  text-decoration: none;
  color: #333;
}

.movie-title h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  transition: color 0.2s ease;
}

.movie-title:hover h3 {
  color: #007bff;
}

.movie-rating {
  font-size: 13px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.movie-content {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.movie-poster-link {
  display: block;
  text-decoration: none;
}

.movie-poster {
  width: 200px;
  height: 300px;
  object-fit: cover;
  transition: filter 0.2s ease;
}

.movie-poster-link:hover .movie-poster {
  filter: brightness(90%);
}

.movie-details {
  flex: 1;
  text-align: left;
}

.movie-year,
.movie-genres {
  font-size: 13px;
  color: #666;
  margin: 0 0 5px;
}

.movie-genres {
  font-style: italic;
}

.movie-average-rating {
  font-size: 13px;
  color: #666;
  margin: 0 0 5px;
}

.movie-average-rating::before {
  content: '★ ';
  color: #f39c12;
}

.movie-description {
  font-size: 13px;
  color: #666;
  margin: 0 0 10px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.no-movies {
  font-size: 14px;
  color: #666;
  margin: 20px 0;
}

.details-button {
  display: inline-block;
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #007bff;
  border-radius: 4px;
  text-decoration: none;
}

.details-button:hover {
  background-color: #0056b3;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination-button {
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 13px;
  color: #333;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 20px 0;
}

@media (max-width: 900px) {
  .movie-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    padding: 0 10px;
  }

  .filter-button,
  .sort-select,
  .filter-input {
    width: 100%;
    max-width: none;
    font-size: 13px;
    padding: 6px 10px;
  }

  .year-range {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .filter-input {
    width: 100%;
  }

  .clear-button {
    grid-column: 1 / -1;
    padding: 6px 10px;
    font-size: 13px;
  }

  .dropdown {
    max-width: 100%;
    min-width: 0;
  }

  .movie-content {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .movie-list-container {
    margin: 20px;
    padding: 15px;
  }

  h1 {
    font-size: 18px;
  }

  .movie-grid {
    grid-template-columns: 1fr;
  }

  .movie-card {
    padding: 10px;
  }

  .movie-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .movie-rating {
    margin-top: 5px;
  }

  .movie-poster {
    width: 100%;
    max-width: 300px;
    height: auto;
    aspect-ratio: 2/3;
  }

  .movie-details {
    text-align: left;
  }

  .movie-title h3 {
    font-size: 15px;
  }

  .movie-year,
  .movie-genres,
  .movie-description {
    font-size: 12px;
  }

  .movie-average-rating {
    font-size: 12px;
  }

  .details-button,
  .pagination-button {
    font-size: 12px;
  }
}
</style>