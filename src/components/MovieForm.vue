<template>
  <div class="movie-form">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="title">Название</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Введите название"
          class="form-input"
          :class="{ 'input-error': errors.title }"
        />
        <p v-if="errors.title" class="error-message">{{ errors.title }}</p>
      </div>
      <div class="form-group">
        <label for="releaseDate">Дата релиза</label>
        <input
          id="releaseDate"
          v-model="form.releaseDate"
          type="date"
          required
          class="form-input"
          :class="{ 'input-error': errors.releaseDate }"
        />
        <p v-if="errors.releaseDate" class="error-message">{{ errors.releaseDate }}</p>
      </div>
      <div class="form-group">
        <label>Жанры</label>
        <div v-if="isLoadingGenres" class="loading">Загрузка жанров...</div>
        <div v-else class="checkbox-group">
          <label v-for="genre in genres" :key="genre.id" class="checkbox-label">
            <input type="checkbox" v-model="form.genreIds" :value="genre.id" />
            {{ genre.name }}
          </label>
        </div>
        <p v-if="errors.genreIds" class="error-message">{{ errors.genreIds }}</p>
      </div>
      <div class="form-group">
        <label for="ageRating">Возрастной рейтинг</label>
        <select
          id="ageRating"
          v-model="form.ageRating"
          required
          class="form-select"
          :class="{ 'input-error': errors.ageRating }"
        >
          <option value="" disabled>Выберите рейтинг</option>
          <option v-for="rating in ageRatings" :key="rating" :value="rating">
            {{ rating }}
          </option>
        </select>
        <p v-if="errors.ageRating" class="error-message">{{ errors.ageRating }}</p>
      </div>
      <div class="form-group">
        <label for="duration">Длительность (минуты)</label>
        <input
          id="duration"
          v-model.number="form.duration"
          type="number"
          min="1"
          max="600"
          required
          placeholder="Введите длительность"
          class="form-input"
          :class="{ 'input-error': errors.duration }"
        />
        <p v-if="errors.duration" class="error-message">{{ errors.duration }}</p>
      </div>
      <div class="form-group">
        <label for="contentType">Тип контента</label>
        <select
          id="contentType"
          v-model="form.contentType"
          required
          class="form-select"
          :class="{ 'input-error': errors.contentType }"
        >
          <option value="MOVIE">Фильм</option>
          <option value="SERIES">Сериал</option>
        </select>
        <p v-if="errors.contentType" class="error-message">{{ errors.contentType }}</p>
      </div>
      <div class="form-group">
        <label for="description">Описание</label>
        <textarea
          id="description"
          v-model="form.description"
          required
          placeholder="Введите описание"
          class="form-textarea"
          :class="{ 'input-error': errors.description }"
        ></textarea>
        <p v-if="errors.description" class="error-message">{{ errors.description }}</p>
      </div>
      <div class="form-group">
        <label for="poster">Постер</label>
        <input
          id="poster"
          type="file"
          accept="image/*"
          @change="handlePosterUpload"
          class="form-input"
        />
        <img
          v-if="form.poster"
          :src="formatPoster(form.poster)"
          alt="Превью постера"
          class="poster-preview"
        />
      </div>
      <div class="form-group">
        <label>Участники команды</label>
        <div v-if="isLoadingCrew" class="loading">Загрузка команды...</div>
        <div v-else>
          <div v-for="(crewEntry, index) in form.crew" :key="index" class="crew-entry">
            <div class="crew-member-select">
              <label :for="'crew-member-' + index">Участник</label>
              <select
                :id="'crew-member-' + index"
                v-model="crewEntry.crewMemberId"
                class="form-select"
                :class="{ 'input-error': errors[`crew[${index}].crewMemberId`] }"
              >
                <option value="" disabled>Выберите участника</option>
                <option
                  v-for="member in availableCrewMembers(index)"
                  :key="member.id"
                  :value="member.id"
                >
                  {{ member.firstName }} {{ member.lastName }}
                </option>
              </select>
              <p
                v-if="errors[`crew[${index}].crewMemberId`]"
                class="error-message"
              >
                {{ errors[`crew[${index}].crewMemberId`] }}
              </p>
            </div>
            <div class="crew-roles-select">
              <label>Роли</label>
              <div class="checkbox-group">
                <label
                  v-for="role in availableRoles"
                  :key="role.value"
                  class="checkbox-label"
                >
                  <input
                    type="checkbox"
                    v-model="crewEntry.roles"
                    :value="role.value"
                  />
                  {{ role.label }}
                </label>
              </div>
              <p
                v-if="errors[`crew[${index}].roles`]"
                class="error-message"
              >
                {{ errors[`crew[${index}].roles`] }}
              </p>
            </div>
            <button
              type="button"
              class="remove-crew-button"
              @click="removeCrewEntry(index)"
            >
              Удалить
            </button>
          </div>
          <button
            type="button"
            class="add-crew-button"
            @click="addCrewEntry"
          >
            Добавить участника
          </button>
        </div>
        <p v-if="errors.crew" class="error-message">{{ errors.crew }}</p>
      </div>
      <div class="form-actions">
        <button type="submit" class="save-button" :disabled="isSubmitting || hasErrors">
          {{ isEditMode ? 'Сохранить' : 'Создать' }}
        </button>
        <button type="button" class="cancel-button" @click="handleCancel">
          Отмена
        </button>
      </div>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api';

export default {
  name: 'MovieForm',
  props: {
    movie: {
      type: Object,
      default: null,
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const genres = ref([]);
    const crew = ref([]);
    const error = ref('');
    const isSubmitting = ref(false);
    const isLoadingGenres = ref(false);
    const isLoadingCrew = ref(false);
    const errors = ref({});
    const isDirty = ref(false);

    const form = ref({
      id: props.movie?.id || null,
      title: props.movie?.title || '',
      releaseDate: props.movie?.releaseDate || '',
      genreIds: Array.isArray(props.movie?.genreIds) ? props.movie.genreIds : [],
      ageRating: props.movie?.ageRating || '',
      duration: props.movie?.duration || null,
      description: props.movie?.description || '',
      poster: props.movie?.poster || '',
      contentType: props.movie?.contentType || 'MOVIE',
      crew: props.movie?.crew?.map(crew => ({
        crewMemberId: crew.crewMemberId,
        roles: crew.roles || [],
      })) || [],
    });

    const ageRatings = ['G', 'PG', 'PG_13', 'R', 'NC_17'];

    const availableRoles = [
      { value: 'DIRECTOR', label: 'Режиссёр' },
      { value: 'ACTOR', label: 'Актёр' },
      { value: 'VOICE_ACTOR', label: 'Актёр озвучки' },
      { value: 'PRODUCER', label: 'Продюсер' },
      { value: 'WRITER', label: 'Сценарист' },
      { value: 'CINEMATOGRAPHER', label: 'Оператор' },
      { value: 'COMPOSER', label: 'Композитор' },
      { value: 'EDITOR', label: 'Монтажёр' },
      { value: 'PRODUCTION_DESIGNER', label: 'Художник-постановщик' },
      { value: 'COSTUME_DESIGNER', label: 'Художник по костюмам' },
      { value: 'MAKEUP_ARTIST', label: 'Гримёр' },
      { value: 'SOUND_DESIGNER', label: 'Звукорежиссёр' },
      { value: 'STUNT_COORDINATOR', label: 'Координатор трюков' },
      { value: 'CHOREOGRAPHER', label: 'Хореограф' },
      { value: 'VISUAL_EFFECTS_SUPERVISOR', label: 'Супервайзер визуальных эффектов' },
      { value: 'CASTING_DIRECTOR', label: 'Кастинг-директор' },
      { value: 'EXECUTIVE_PRODUCER', label: 'Исполнительный продюсер' },
      { value: 'ANIMATOR', label: 'Аниматор' },
      { value: 'PUPPETEER', label: 'Кукловод' },
      { value: 'ANIMAL_TRAINER', label: 'Дрессировщик животных' },
    ];

    const fetchGenres = async () => {
      isLoadingGenres.value = true;
      try {
        const response = await api.getGenres();
        genres.value = response.data;
      } catch (err) {
        error.value = 'Ошибка загрузки жанров.';
        console.error(err);
      } finally {
        isLoadingGenres.value = false;
      }
    };

    const fetchCrew = async () => {
      isLoadingCrew.value = true;
      try {
        const response = await api.getCrewMembers();
        crew.value = response.data;
      } catch (err) {
        error.value = 'Ошибка загрузки команды.';
        console.error(err);
      } finally {
        isLoadingCrew.value = false;
      }
    };

    const availableCrewMembers = (currentIndex) => {
      const selectedIds = form.value.crew
        .map((entry, index) => index !== currentIndex ? entry.crewMemberId : null)
        .filter(id => id !== null);
      return crew.value.filter(member => !selectedIds.includes(member.id));
    };

    const addCrewEntry = () => {
      form.value.crew.push({ crewMemberId: '', roles: [] });
      isDirty.value = true;
    };

    const removeCrewEntry = (index) => {
      form.value.crew.splice(index, 1);
      isDirty.value = true;
    };

    const formatPoster = (poster) => {
      if (!poster) return 'https://via.placeholder.com/100x150?text=No+Image';
      if (poster.startsWith('data:image')) return poster;
      return `data:image/jpeg;base64,${poster}`;
    };

    const handlePosterUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          form.value.poster = e.target.result;
          isDirty.value = true;
        };
        reader.readAsDataURL(file);
      }
    };

    const validateForm = () => {
      errors.value = {};
      if (!form.value.title.trim()) {
        errors.value.title = 'Название обязательно';
      }
      if (!form.value.releaseDate) {
        errors.value.releaseDate = 'Дата релиза обязательна';
      } else {
        const date = new Date(form.value.releaseDate);
        if (isNaN(date.getTime())) {
          errors.value.releaseDate = 'Неверный формат даты';
        }
      }
      if (!form.value.genreIds.length) {
        errors.value.genreIds = 'Выберите хотя бы один жанр';
      }
      if (!form.value.ageRating) {
        errors.value.ageRating = 'Выберите возрастной рейтинг';
      }
      if (!form.value.duration || form.value.duration < 1 || form.value.duration > 600) {
        errors.value.duration = 'Длительность должна быть от 1 до 600 минут';
      }
      if (!form.value.contentType) {
        errors.value.contentType = 'Выберите тип контента';
      }
      if (!form.value.description.trim()) {
        errors.value.description = 'Описание обязательно';
      }
      form.value.crew.forEach((entry, index) => {
        if (!entry.crewMemberId) {
          errors.value[`crew[${index}].crewMemberId`] = 'Выберите участника';
        }
        if (!entry.roles.length) {
          errors.value[`crew[${index}].roles`] = 'Выберите хотя бы одну роль';
        }
      });
      const crewIds = form.value.crew.map(entry => entry.crewMemberId).filter(id => id);
      if (new Set(crewIds).size !== crewIds.length) {
        errors.value.crew = 'Каждый участник может быть выбран только один раз';
      }
      return Object.keys(errors.value).length === 0;
    };

    const hasErrors = computed(() => Object.keys(errors.value).length > 0);

    const submitForm = async () => {
      if (!validateForm()) return;
      isSubmitting.value = true;
      error.value = '';
      try {
        const payload = {
          ...form.value,
          poster: form.value.poster && form.value.poster.startsWith('data:image')
            ? form.value.poster.split(',')[1]
            : form.value.poster || null,
        };
        let response;
        if (props.isEditMode) {
          response = await api.updateMovie(form.value.id, payload);
        } else {
          response = await api.createMovie(payload);
        }
        emit('submit', response.data);
        emit('close');
      } catch (err) {
        error.value = err.response?.data?.message || 'Ошибка при сохранении фильма';
        console.error('submitForm error:', err);
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleCancel = () => {
      if (isDirty.value && !confirm('Есть несохранённые изменения. Закрыть форму?')) {
        return;
      }
      emit('close');
    };

    watch(form, () => {
      isDirty.value = true;
      validateForm();
    }, { deep: true });

    onMounted(() => {
      fetchGenres();
      fetchCrew();
      validateForm();
    });

    return {
      form,
      genres,
      crew,
      ageRatings,
      availableRoles,
      availableCrewMembers,
      addCrewEntry,
      removeCrewEntry,
      error,
      errors,
      isSubmitting,
      isLoadingGenres,
      isLoadingCrew,
      hasErrors,
      handlePosterUpload,
      formatPoster,
      submitForm,
      handleCancel,
    };
  },
};
</script>

<style scoped>
.movie-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-textarea {
  height: 100px;
  resize: vertical;
}

.checkbox-group {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #333;
  margin-bottom: 5px;
}

.checkbox-label input {
  margin-right: 8px;
}

.crew-entry {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  align-items: flex-end;
}

.crew-member-select,
.crew-roles-select {
  flex: 1;
  min-width: 200px;
}

.remove-crew-button {
  padding: 8px 12px;
  font-size: 13px;
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-crew-button:hover {
  background-color: #c82333;
}

.add-crew-button {
  padding: 8px 12px;
  font-size: 13px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.add-crew-button:hover {
  background-color: #218838;
}

.poster-preview {
  max-width: 100px;
  max-height: 150px;
  margin-top: 10px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-button,
.cancel-button {
  padding: 8px 12px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button {
  background-color: #28a745;
  color: #fff;
}

.save-button:hover {
  background-color: #218838;
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #dc3545;
  color: #fff;
}

.cancel-button:hover {
  background-color: #c82333;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 5px;
}

.input-error {
  border-color: #dc3545;
}

.loading {
  font-size: 13px;
  color: #666;
}

@media (max-width: 600px) {
  .movie-form {
    padding: 15px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: 12px;
  }

  .checkbox-label {
    font-size: 12px;
  }

  .crew-entry {
    flex-direction: column;
    align-items: stretch;
  }

  .crew-member-select,
  .crew-roles-select {
    min-width: 100%;
  }

  .remove-crew-button,
  .add-crew-button {
    font-size: 12px;
    padding: 6px 10px;
  }

  .save-button,
  .cancel-button {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>