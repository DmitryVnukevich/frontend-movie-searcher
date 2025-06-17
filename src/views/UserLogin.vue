<template>
  <div class="login-container">
    <h1>Вход</h1>
    <form @submit.prevent="login" class="login-form">
      <input
        v-model="credentials.username"
        type="text"
        placeholder="Имя пользователя"
        class="input-field"
        required
      />
      <input
        v-model="credentials.password"
        type="password"
        placeholder="Пароль"
        class="input-field"
        required
      />
      <button type="submit" class="login-button">Войти</button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>
    <p>
      Нет аккаунта? <router-link to="/register">Зарегистрируйтесь</router-link>
    </p>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'UserLogin',
  setup() {
    const store = useStore();
    const router = useRouter();

    const credentials = {
      username: '',
      password: '',
    };
    let error = '';

    const login = async () => {
      try {
        await store.dispatch('login', credentials);
        router.push('/');
      } catch (err) {
        error = 'Ошибка входа. Проверьте данные.';
        console.error(err);
      }
    };

    return { credentials, login, error };
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-field {
  padding: 10px;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.input-field:focus {
  border-color: #007bff;
}

.login-button {
  padding: 10px;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 10px;
}

p {
  margin-top: 15px;
  font-size: 13px;
  color: #666;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .login-container {
    margin: 20px;
    padding: 15px;
  }

  h1 {
    font-size: 18px;
  }

  .input-field,
  .login-button {
    font-size: 14px;
  }
}
</style>