<template>
  <div class="movie-detail-container">
    <h1>{{ movie?.title || 'Фильм' }}</h1>
    <div v-if="movie" class="movie-card">
      <div class="movie-content">
        <img :src="formatPoster(movie.poster)" :alt="movie.title" class="movie-poster" />
        <div class="movie-details">
          <p><strong>Год:</strong> {{ formatYear(movie.releaseDate) }}</p>
          <p><strong>Жанры:</strong> {{ formatGenres(movie.genreIds) }}</p>
          <p><strong>Возрастной рейтинг:</strong> {{ movie.ageRating }}</p>
          <p><strong>Длительность:</strong> {{ movie.duration }} мин</p>
          <p><strong>Рейтинг:</strong> {{ formatAverageRating(movie.averageRating) }}</p>
          <p><strong>Описание:</strong> {{ movie.description || 'Нет описания' }}</p>
          <div v-if="movie.crew?.length" class="crew-section">
            <div v-if="directors.length" class="crew-list">
              <strong>Режиссёры:</strong>
              <ul>
                <li v-for="member in directors" :key="member.crewMemberId">
                  <router-link :to="`/crew-member/${member.crewMemberId}`">
                    {{ member.firstName }} {{ member.lastName }}
                  </router-link>
                </li>
              </ul>
            </div>
            <div v-if="actors.length" class="crew-list">
              <strong>Актёры:</strong>
              <ul>
                <li v-for="member in actors" :key="member.crewMemberId">
                  <router-link :to="`/crew-member/${member.crewMemberId}`">
                    {{ member.firstName }} {{ member.lastName }}
                  </router-link>
                </li>
              </ul>
            </div>
            <div v-if="otherCrew.length" class="crew-list">
              <strong>Остальная команда:</strong>
              <ul>
                <li v-for="member in otherCrew" :key="member.crewMemberId">
                  <router-link :to="`/crew-member/${member.crewMemberId}`">
                    {{ member.firstName }} {{ member.lastName }} ({{ formatRoles(member.roles) }})
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
          <p v-else class="no-crew">Команда не указана.</p>
        </div>
      </div>
      <router-link to="/" class="back-button">Назад к списку</router-link>
    </div>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <p v-else class="loading-message">Загрузка...</p>
    <movie-comments v-if="movie" :movieId="movie.id" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import MovieComments from '@/components/MovieComments.vue';

export default {
  name: 'MovieDetail',
  components: { MovieComments },
  setup() {
    const route = useRoute();
    const movie = ref(null);
    const genres = ref([]);
    const crewMembers = ref([]);
    const error = ref('');

    const formatPoster = (poster) => {
      if (!poster) return 'https://via.placeholder.com/150x225?text=No+Image';
      if (poster.startsWith('data:image')) return poster;
      return `data:image/jpeg;base64,${poster}`;
    };

    const formatYear = (date) => {
      if (!date) return 'N/A';
      return date.split('-')[0] || 'N/A';
    };

    const formatGenres = (genreIds) => {
      if (!Array.isArray(genreIds) || !genres.value.length) return 'N/A';
      return genreIds
        .map((id) => genres.value.find((g) => g.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'N/A';
    };

    const formatAverageRating = (rating) => {
      return rating != null ? `${rating.toFixed(1)}/10` : 'Нет оценок';
    };

    const formatRoles = (roles) => {
      if (!Array.isArray(roles) || !roles.length) return 'N/A';
      const roleTranslations = {
        DIRECTOR: 'Режиссёр',
        ACTOR: 'Актёр',
        VOICE_ACTOR: 'Актёр озвучки',
        PRODUCER: 'Продюсер',
        WRITER: 'Сценарист',
        CINEMATOGRAPHER: 'Оператор',
        COMPOSER: 'Композитор',
        EDITOR: 'Монтажёр',
        PRODUCTION_DESIGNER: 'Художник-постановщик',
        COSTUME_DESIGNER: 'Художник по костюмам',
        MAKEUP_ARTIST: 'Гримёр',
        SOUND_DESIGNER: 'Звукорежиссёр',
        STUNT_COORDINATOR: 'Координатор трюков',
        CHOREOGRAPHER: 'Хореограф',
        VISUAL_EFFECTS_SUPERVISOR: 'Супервайзер визуальных эффектов',
        CASTING_DIRECTOR: 'Кастинг-директор',
        EXECUTIVE_PRODUCER: 'Исполнительный продюсер',
        ANIMATOR: 'Аниматор',
        PUPPETEER: 'Кукловод',
        ANIMAL_TRAINER: 'Дрессировщик животных',
      };
      return roles
        .map((role) => roleTranslations[role] || role)
        .filter((role) => role !== 'Режиссёр' && role !== 'Актёр' && role !== 'Актёр озвучки')
        .join(', ') || 'N/A';
    };

    const directors = computed(() => {
      if (!movie.value?.crew?.length || !crewMembers.value.length) return [];
      return crewMembers.value.filter((member) =>
        member.roles.includes('DIRECTOR')
      );
    });

    const actors = computed(() => {
      if (!movie.value?.crew?.length || !crewMembers.value.length) return [];
      return crewMembers.value.filter((member) =>
        member.roles.includes('ACTOR') || member.roles.includes('VOICE_ACTOR')
      );
    });

    const otherCrew = computed(() => {
      if (!movie.value?.crew?.length || !crewMembers.value.length) return [];
      return crewMembers.value.filter((member) =>
        member.roles.some((role) => !['DIRECTOR', 'ACTOR', 'VOICE_ACTOR'].includes(role))
      );
    });

    const fetchGenres = async () => {
      try {
        const response = await api.getGenres();
        genres.value = response.data;
      } catch (err) {
        console.error('Ошибка загрузки жанров:', err);
        error.value = 'Не удалось загрузить жанры.';
      }
    };

    const fetchCrewMembers = async (crew) => {
      try {
        const crewPromises = crew.map(async (crewEntry) => {
          const response = await api.getCrewMember(crewEntry.crewMemberId);
          return {
            crewMemberId: crewEntry.crewMemberId,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            roles: crewEntry.roles,
          };
        });
        crewMembers.value = await Promise.all(crewPromises);
      } catch (err) {
        console.error('Ошибка загрузки участников команды:', err);
        error.value = 'Не удалось загрузить данные о команде.';
      }
    };

    const fetchMovie = async () => {
      try {
        const movieId = route.params.id;
        const response = await api.getMovie(movieId);
        movie.value = response.data;
        if (movie.value.crew?.length) {
          await fetchCrewMembers(movie.value.crew);
        }
        error.value = '';
      } catch (err) {
        error.value = 'Ошибка загрузки фильма. Возможно, фильм не найден.';
        console.error('fetchMovie error:', err);
      }
    };

    onMounted(() => {
      fetchGenres();
      fetchMovie();
    });

    return {
      movie,
      error,
      directors,
      actors,
      otherCrew,
      formatPoster,
      formatYear,
      formatGenres,
      formatAverageRating,
      formatRoles,
    };
  },
};
</script>

<style scoped>
.movie-detail-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
}

h1 {
  font-size: 22px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
}

.movie-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.movie-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.movie-poster {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 4px;
}

.movie-details {
  flex: 1;
  text-align: left;
}

.movie-details p {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px;
}

.movie-details strong {
  color: #000;
}

.crew-section {
  margin-top: 20px;
}

.crew-list {
  margin-bottom: 15px;
}

.crew-list strong {
  display: block;
  font-size: 14px;
  color: #000;
  margin-bottom: 5px;
}

.crew-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.crew-list li {
  font-size: 13px;
  color: #333;
  margin-bottom: 5px;
}

.crew-list a {
  color: #333;
  text-decoration: none;
}

.crew-list a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.no-crew {
  font-size: 13px;
  color: #666;
  margin-top: 10px;
}

.back-button {
  display: inline-block;
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #007bff;
  border-radius: 4px;
  text-decoration: none;
}

.back-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 20px;
}

.loading-message {
  font-size: 13px;
  color: #666;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .movie-detail-container {
    margin: 20px;
    padding: 15px;
  }

  h1 {
    font-size: 18px;
  }

  .movie-card {
    padding: 10px;
  }

  .movie-content {
    flex-direction: column;
    align-items: center;
  }

  .movie-poster {
    width: 100%;
    height: auto;
    aspect-ratio: 2/3;
  }

  .movie-details {
    text-align: center;
  }

  .movie-details p {
    font-size: 13px;
  }

  .crew-list strong {
    font-size: 13px;
  }

  .crew-list li {
    font-size: 12px;
  }

  .back-button {
    font-size: 12px;
  }
}
</style>