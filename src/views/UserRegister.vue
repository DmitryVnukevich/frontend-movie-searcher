<template>
    <div class="register-container">
      <h1>Регистрация</h1>
      <form @submit.prevent="register" class="register-form">
        <input
          v-model="form.username"
          type="text"
          placeholder="Имя пользователя"
          class="input-field"
          required
        />
        <input
          v-model="form.email"
          type="email"
          placeholder="Электронная почта"
          class="input-field"
          required
        />
        <input
          v-model="form.password"
          type="password"
          placeholder="Пароль"
          class="input-field"
          required
        />
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="Подтвердите пароль"
          class="input-field"
          required
        />
        <button type="submit" class="register-button">Зарегистрироваться</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p>
        Уже есть аккаунт? <router-link to="/login">Войдите</router-link>
      </p>
    </div>
  </template>
  
  <script>
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import api from '@/services/api';
  
  export default {
    name: 'UserRegister',
    setup() {
      const store = useStore();
      const router = useRouter();
  
      const form = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      };
      let error = '';
  
      const register = async () => {
        if (form.password !== form.confirmPassword) {
          error = 'Пароли не совпадают';
          return;
        }
        try {
          const response = await api.register({
            username: form.username,
            email: form.email,
            password: form.password,
          });
          store.commit('setToken', response.data.token);
          store.commit('setUser', response.data.user);
          router.push('/');
        } catch (err) {
          error = 'Ошибка регистрации. Проверьте данные.';
          console.error(err);
        }
      };
  
      return { form, register, error };
    },
  };
  </script>
  
  <style scoped>
  .register-container {
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
  
  .register-form {
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
  
  .register-button {
    padding: 10px;
    font-size: 15px;
    font-family: 'Montserrat', sans-serif;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .register-button:hover {
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
  
  /* Адаптивность */
  @media (max-width: 600px) {
    .register-container {
      margin: 20px;
      padding: 15px;
    }
  
    h1 {
      font-size: 18px;
    }
  
    .input-field,
    .register-button {
      font-size: 14px;
    }
  }
  </style>