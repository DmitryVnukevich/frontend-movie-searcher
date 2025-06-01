<template>
  <div class="profile-container">
    <h1>Профиль пользователя</h1>
    <div v-if="user" class="profile-card">
      <!-- Основные данные -->
      <h2>Основные данные</h2>
      <div v-if="!isEditingProfile" class="profile-info">
        <p><strong>Имя пользователя:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <button @click="startEditingProfile" class="edit-button">Редактировать профиль</button>
      </div>
      <form v-else @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            v-model="profileForm.username"
            placeholder="Введите имя пользователя"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="profileForm.email"
            placeholder="Введите email"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Новый пароль (опционально)</label>
          <input
            type="password"
            id="password"
            v-model="profileForm.password"
            placeholder="Введите новый пароль"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="profileForm.confirmPassword"
            placeholder="Повторите пароль"
          />
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-button">Сохранить</button>
          <button type="button" @click="cancelEditingProfile" class="cancel-button">Отмена</button>
        </div>
      </form>
      <p v-if="profileError" class="error-message">{{ profileError }}</p>

      <h2>Предпочтения</h2>
      <div v-if="userInfo" class="preferences-section">
        <form @submit.prevent="updatePreferences" class="preferences-form">
          <div class="form-group">
            <label for="genres">Предпочитаемые жанры</label>
            <Multiselect
              v-model="preferencesForm.preferredGenreIds"
              :options="genres"
              :multiple="true"
              :close-on-select="false"
              :searchable="true"
              :open-direction="'bottom'"
              label="name"
              track-by="id"
              placeholder="Выберите жанры"
            >
              <template v-slot:tag="{ option, remove }">
                <span class="custom-tag">
                  {{ option.name }}
                  <span @click="remove(option)">×</span>
                </span>
              </template>
            </Multiselect>
          </div>
          <div class="form-group">
            <label for="actors">Любимые актёры</label>
            <Multiselect
              v-model="preferencesForm.favoriteActorIds"
              :options="actors"
              :multiple="true"
              :close-on-select="false"
              :searchable="true"
              :open-direction="'bottom'"
              track-by="id"
              placeholder="Выберите актёров"
            >
              <template v-slot:singleLabel="{ option }">
                {{ option.firstName }} {{ option.lastName }}
              </template>
              <template v-slot:option="{ option }">
                {{ option.firstName }} {{ option.lastName }}
              </template>
              <template v-slot:tag="{ option, remove }">
                <span class="custom-tag">
                  {{ option.firstName }} {{ option.lastName }}
                  <span @click="remove(option)">×</span>
                </span>
              </template>
            </Multiselect>
          </div>
          <div class="form-group">
            <label for="directors">Любимые режиссёры</label>
            <Multiselect
              v-model="preferencesForm.favoriteDirectorIds"
              :options="directors"
              :multiple="true"
              :close-on-select="false"
              :searchable="true"
              :open-direction="'bottom'"
              track-by="id"
              placeholder="Выберите режиссёров"
            >
              <template v-slot:singleLabel="{ option }">
                {{ option.firstName }} {{ option.lastName }}
              </template>
              <template v-slot:option="{ option }">
                {{ option.firstName }} {{ option.lastName }}
              </template>
              <template v-slot:tag="{ option, remove }">
                <span class="custom-tag">
                  {{ option.firstName }} {{ option.lastName }}
                  <span @click="remove(option)">×</span>
                </span>
              </template>
            </Multiselect>
          </div>
          <div class="form-group">
            <label for="contentType">Тип контента</label>
            <select id="contentType" v-model="preferencesForm.contentTypePreference">
              <option value="MOVIE">Фильм</option>
              <option value="TV_SERIES">Сериал</option>
            </select>
          </div>
          <div class="form-group">
            <label for="minRating">Минимальный рейтинг</label>
            <input
              type="number"
              id="minRating"
              v-model="preferencesForm.minRating"
              min="1"
              max="10"
              placeholder="1-10"
            />
          </div>
          <div class="form-group">
            <label for="maxRating">Максимальный рейтинг</label>
            <input
              type="number"
              id="maxRating"
              v-model="preferencesForm.maxRating"
              min="1"
              max="10"
              placeholder="1-10"
            />
          </div>
          <div class="form-group">
            <label for="minDuration">Минимальная длительность (мин)</label>
            <input
              type="number"
              id="minDuration"
              v-model="preferencesForm.minDuration"
              min="1"
              max="32767"
              placeholder="1-32767"
            />
          </div>
          <div class="form-group">
            <label for="maxDuration">Максимальная длительность (мин)</label>
            <input
              type="number"
              id="maxDuration"
              v-model="preferencesForm.maxDuration"
              min="1"
              max="32767"
              placeholder="1-32767"
            />
          </div>
          <div class="form-group">
            <label for="ageRating">Возрастной рейтинг</label>
            <select id="ageRating" v-model="preferencesForm.preferredAgeRating">
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG_13">PG-13</option>
              <option value="R">R</option>
              <option value="NC_17">NC-17</option>
            </select>
          </div>
          <button type="submit" class="submit-button">Обновить предпочтения</button>
        </form>
        <button @click="deletePreferences" class="delete-button">Удалить предпочтения</button>
        <p v-if="preferencesError" class="error-message">{{ preferencesError }}</p>
      </div>
      <div v-else class="no-preferences-section">
        <p class="no-preferences">Предпочтения не заданы.</p>
        <button @click="createPreferences" class="submit-button">Создать предпочтения</button>
      </div>
    </div>
    <p v-else-if="error" class="error-message">{{ error }}</p>
    <p v-else class="loading-message">Загрузка...</p>
    <siteToast ref="siteToast" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Multiselect from 'vue-multiselect';
import api from '@/services/api';
import SiteToast from '@/components/SiteToast.vue';
import 'vue-multiselect/dist/vue-multiselect.css';

export default {
  name: 'UserProfile',
  components: {
    Multiselect,
    SiteToast,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const siteToast = ref(null);

    const user = ref(null);
    const userInfo = ref(null);
    const genres = ref([]);
    const actors = ref([]);
    const directors = ref([]);
    const error = ref('');
    const profileError = ref('');
    const preferencesError = ref('');
    const isEditingProfile = ref(false);
    const profileForm = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    const preferencesForm = ref({
      userId: null,
      preferredGenreIds: [],
      favoriteActorIds: [],
      favoriteDirectorIds: [],
      contentTypePreference: 'MOVIE',
      minRating: 1,
      maxRating: 10,
      minDuration: 1,
      maxDuration: 32767,
      preferredAgeRating: 'G',
    });

    const checkAuth = async () => {
      if (!store.state.token || !store.state.user) {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (token && user) {
          try {
            await api.validateToken(token);
            store.commit('setToken', token);
            store.commit('setUser', user);
            return true;
          } catch (err) {
            console.error('Токен недействителен:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return false;
          }
        }
        router.push('/login');
        return false;
      }
      return true;
    };

    const fetchGenres = async () => {
      try {
        const response = await api.getGenres();
        genres.value = response.data;
      } catch (err) {
        console.error('Ошибка загрузки жанров:', err);
      }
    };

    const fetchActors = async () => {
      try {
        const response = await api.getActors();
        actors.value = response.data;
      } catch (err) {
        console.error('Ошибка загрузки актёров:', err);
      }
    };

    const fetchDirectors = async () => {
      try {
        const response = await api.getDirectors();
        directors.value = response.data;
      } catch (err) {
        console.error('Ошибка загрузки режиссёров:', err);
      }
    };

    const fetchUserInfo = async () => {
      if (!checkAuth()) return;
      try {
        const userId = store.state.user.id;
        const response = await api.getUserInfo(userId);
        userInfo.value = response.data;
        preferencesForm.value = {
          id: userInfo.value.id,
          userId: userInfo.value.userId,
          preferredGenreIds: (userInfo.value.preferredGenreIds || []).map(id =>
            genres.value.find(genre => genre.id === id) || { id, name: 'Неизвестный жанр' }
          ),
          favoriteActorIds: (userInfo.value.favoriteActorIds || []).map(id =>
            actors.value.find(actor => actor.id === id) || { id, firstName: 'Неизвестный', lastName: 'актёр' }
          ),
          favoriteDirectorIds: (userInfo.value.favoriteDirectorIds || []).map(id =>
            directors.value.find(director => director.id === id) || { id, firstName: 'Неизвестный', lastName: 'режиссёр' }
          ),
          contentTypePreference: userInfo.value.contentTypePreference || 'MOVIE',
          minRating: userInfo.value.minRating || 1,
          maxRating: userInfo.value.maxRating || 10,
          minDuration: userInfo.value.minDuration || 1,
          maxDuration: userInfo.value.maxDuration || 32767,
          preferredAgeRating: userInfo.value.preferredAgeRating || 'G',
        };
        preferencesError.value = '';
      } catch (err) {
        userInfo.value = null;
        preferencesError.value = 'Предпочтения не найдены.';
        console.error(err);
      }
    };

    const initProfile = () => {
      if (!checkAuth()) return;
      user.value = store.state.user;
      profileForm.value = {
        username: user.value.username,
        email: user.value.email,
        password: '',
        confirmPassword: '',
      };
    };

    const startEditingProfile = () => {
      isEditingProfile.value = true;
      profileError.value = '';
    };

    const cancelEditingProfile = () => {
      isEditingProfile.value = false;
      profileForm.value = {
        username: user.value.username,
        email: user.value.email,
        password: '',
        confirmPassword: '',
      };
      profileError.value = '';
    };

    const updateProfile = async () => {
      if (!checkAuth()) return;
      if (!profileForm.value.email.includes('@')) {
        profileError.value = 'Введите корректный email';
        siteToast.value.showToast('Введите корректный email', 'error');
        return;
      }
      if (profileForm.value.username.length < 3 || profileForm.value.username.length > 20) {
        profileError.value = 'Имя пользователя должно быть от 3 до 20 символов';
        siteToast.value.showToast('Некорректное имя пользователя', 'error');
        return;
      }
      if (
        profileForm.value.password &&
        (profileForm.value.password.length < 6 || profileForm.value.password.length > 20)
      ) {
        profileError.value = 'Пароль должен быть от 6 до 20 символов';
        siteToast.value.showToast('Некорректный пароль', 'error');
        return;
      }
      if (profileForm.value.password && profileForm.value.password !== profileForm.value.confirmPassword) {
        profileError.value = 'Пароли не совпадают';
        siteToast.value.showToast('Пароли не совпадают', 'error');
        return;
      }
      try {
        const userId = store.state.user.id;
        const payload = { ...profileForm.value };
        delete payload.confirmPassword;
        if (!payload.password) delete payload.password;
        const response = await api.updateUser(userId, payload);
        store.commit('setUser', response.data);
        user.value = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
        isEditingProfile.value = false;
        profileError.value = '';
        siteToast.value.showToast('Профиль успешно обновлён!', 'success');
      } catch (err) {
        profileError.value = 'Ошибка обновления профиля. Проверьте данные.';
        siteToast.value.showToast('Ошибка обновления профиля', 'error');
        console.error(err);
      }
    };

    const updatePreferences = async () => {
      if (!checkAuth()) return;
      if (
        preferencesForm.value.minRating < 1 ||
        preferencesForm.value.minRating > 10 ||
        preferencesForm.value.maxRating < 1 ||
        preferencesForm.value.maxRating > 10 ||
        preferencesForm.value.maxRating < preferencesForm.value.minRating
      ) {
        preferencesError.value = 'Рейтинг должен быть от 1 до 10, максимум не меньше минимума';
        siteToast.value.showToast('Некорректный рейтинг', 'error');
        return;
      }
      if (
        preferencesForm.value.minDuration < 1 ||
        preferencesForm.value.minDuration > 32767 ||
        preferencesForm.value.maxDuration < 1 ||
        preferencesForm.value.maxDuration > 32767 ||
        preferencesForm.value.maxDuration < preferencesForm.value.minDuration
      ) {
        preferencesError.value = 'Длительность должна быть от 1 до 32767, максимум не меньше минимума';
        siteToast.value.showToast('Некорректная длительность', 'error');
        return;
      }
      try {
        const userId = store.state.user.id;
        preferencesForm.value.userId = userId;
        const payload = {
          ...preferencesForm.value,
          preferredGenreIds: preferencesForm.value.preferredGenreIds.map(item => (typeof item === 'object' ? item.id : item)),
          favoriteActorIds: preferencesForm.value.favoriteActorIds.map(item => (typeof item === 'object' ? item.id : item)),
          favoriteDirectorIds: preferencesForm.value.favoriteDirectorIds.map(item => (typeof item === 'object' ? item.id : item)),
        };
        const response = await api.updateUserInfo(userInfo.value.id, payload);
        userInfo.value = response.data;
        preferencesForm.value.preferredGenreIds = (response.data.preferredGenreIds || []).map(id =>
          genres.value.find(genre => genre.id === id) || { id, name: 'Неизвестный жанр' }
        );
        preferencesForm.value.favoriteActorIds = (response.data.favoriteActorIds || []).map(id =>
          actors.value.find(actor => actor.id === id) || { id, firstName: 'Неизвестный', lastName: 'актёр' }
        );
        preferencesForm.value.favoriteDirectorIds = (response.data.favoriteDirectorIds || []).map(id =>
          directors.value.find(director => director.id === id) || { id, firstName: 'Неизвестный', lastName: 'режиссёр' }
        );
        preferencesError.value = '';
        siteToast.value.showToast('Предпочтения успешно обновлены!', 'success');
      } catch (err) {
        preferencesError.value = 'Ошибка обновления предпочтений.';
        siteToast.value.showToast('Ошибка обновления предпочтений', 'error');
        console.error('Error updating preferences:', err);
      }
    };

    const createPreferences = async () => {
      if (!checkAuth()) return;
      if (
        preferencesForm.value.minRating < 1 ||
        preferencesForm.value.minRating > 10 ||
        preferencesForm.value.maxRating < 1 ||
        preferencesForm.value.maxRating > 10 ||
        preferencesForm.value.maxRating < preferencesForm.value.minRating
      ) {
        preferencesError.value = 'Рейтинг должен быть от 1 до 10, максимум не меньше минимума';
        siteToast.value.showToast('Некорректный рейтинг', 'error');
        return;
      }
      if (
        preferencesForm.value.minDuration < 1 ||
        preferencesForm.value.minDuration > 32767 ||
        preferencesForm.value.maxDuration < 1 ||
        preferencesForm.value.maxDuration > 32767 ||
        preferencesForm.value.maxDuration < preferencesForm.value.minDuration
      ) {
        preferencesError.value = 'Длительность должна быть от 1 до 32767, максимум не меньше минимума';
        siteToast.value.showToast('Некорректная длительность', 'error');
        return;
      }
      try {
        const userId = store.state.user.id;
        preferencesForm.value.userId = userId;
        const payload = {
          ...preferencesForm.value,
          preferredGenreIds: preferencesForm.value.preferredGenreIds.map(item => (typeof item === 'object' ? item.id : item)),
          favoriteActorIds: preferencesForm.value.favoriteActorIds.map(item => (typeof item === 'object' ? item.id : item)),
          favoriteDirectorIds: preferencesForm.value.favoriteDirectorIds.map(item => (typeof item === 'object' ? item.id : item)),
        };
        const response = await api.createUserInfo(payload);
        userInfo.value = response.data;
        preferencesForm.value.id = response.data.id;
        preferencesForm.value.preferredGenreIds = (response.data.preferredGenreIds || []).map(id =>
          genres.value.find(genre => genre.id === id) || { id, name: 'Неизвестный жанр' }
        );
        preferencesForm.value.favoriteActorIds = (response.data.favoriteActorIds || []).map(id =>
          actors.value.find(actor => actor.id === id) || { id, firstName: 'Неизвестный', lastName: 'актёр' }
        );
        preferencesForm.value.favoriteDirectorIds = (response.data.favoriteDirectorIds || []).map(id =>
          directors.value.find(director => director.id === id) || { id, firstName: 'Неизвестный', lastName: 'режиссёр' }
        );
        preferencesError.value = '';
        siteToast.value.showToast('Предпочтения успешно созданы!', 'success');
      } catch (err) {
        preferencesError.value = 'Ошибка создания предпочтений.';
        siteToast.value.showToast('Ошибка создания предпочтений', 'error');
        console.error('Error creating preferences:', err);
      }
    };

    const deletePreferences = async () => {
      if (!checkAuth()) return;
      if (!confirm('Вы уверены, что хотите удалить предпочтения? Это действие нельзя отменить.')) return;
      try {
        const userId = store.state.user.id;
        await api.deleteUserInfo(userId);
        userInfo.value = null;
        preferencesForm.value = {
          userId: store.state.user.id,
          preferredGenreIds: [],
          favoriteActorIds: [],
          favoriteDirectorIds: [],
          contentTypePreference: 'MOVIE',
          minRating: 1,
          maxRating: 10,
          minDuration: 1,
          maxDuration: 32767,
          preferredAgeRating: 'G',
        };
        preferencesError.value = '';
        siteToast.value.showToast('Предпочтения успешно удалены!', 'success');
      } catch (err) {
        preferencesError.value = 'Ошибка удаления предпочтений.';
        siteToast.value.showToast('Ошибка удаления предпочтений', 'error');
        console.error('Error deleting preferences:', err);
      }
    };

    onMounted(async () => {
      await checkAuth();
      initProfile();
      await Promise.all([fetchGenres(), fetchActors(), fetchDirectors()]);
      await fetchUserInfo();
    });

    return {
      user,
      userInfo,
      genres,
      actors,
      directors,
      profileForm,
      preferencesForm,
      error,
      profileError,
      preferencesError,
      isEditingProfile,
      startEditingProfile,
      cancelEditingProfile,
      updateProfile,
      createPreferences,
      updatePreferences,
      deletePreferences,
      siteToast,
    };
  },
};
</script>

<style scoped>
.profile-container {
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

h2 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 20px 0 10px;
}

.profile-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: left;
}

.profile-info p {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px;
}

.profile-info strong {
  color: #000;
}

.edit-button {
  padding: 10px;
  font-size: 13px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #0056b3;
}

.profile-form,
.preferences-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  color: #333;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  padding: 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
}

.multiselect {
  font-size: 13px;
  font-family: 'Montserrat', sans-serif;
}

.multiselect__tags {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.multiselect__tag {
  background: #007bff;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 5px;
  position: relative;
  display: inline-flex;
  align-items: center;
}

.multiselect__tag:not(:last-child)::after {
  content: ',';
  color: #333;
  margin-left: 4px;
}

.multiselect__content-wrapper {
  top: 100%;
  bottom: auto !important;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  z-index: 10;
}

.multiselect__option--highlight {
  background: #007bff;
  color: #fff;
}

.custom-tag {
  display: inline-block;
  margin-right: 5px;
  margin-bottom: 5px;
  padding: 3px 8px;
  background-color: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #333;
}

.custom-tag span {
  margin-left: 5px;
  cursor: pointer;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.submit-button {
  padding: 10px;
  font-size: 13px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0056b3;
}

.cancel-button {
  padding: 10px;
  font-size: 13px;
  color: #333;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

.delete-button {
  padding: 10px;
  font-size: 13px;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #c82333;
}

.no-preferences-section {
  text-align: center;
}

.no-preferences {
  font-size: 13px;
  color: #666;
  margin: 10px 0;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 10px;
}

.loading-message {
  font-size: 13px;
  color: #666;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .profile-container {
    margin: 20px;
    padding: 15px;
  }

  h1 {
    font-size: 18px;
  }

  h2 {
    font-size: 16px;
  }

  .profile-card {
    padding: 15px;
  }

  .profile-info p,
  .form-group label,
  .form-group input,
  .form-group select,
  .edit-button,
  .submit-button,
  .cancel-button,
  .delete-button {
    font-size: 12px;
  }

  .multiselect {
    font-size: 12px;
  }

  .multiselect__tag {
    font-size: 11px;
  }

  .form-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>