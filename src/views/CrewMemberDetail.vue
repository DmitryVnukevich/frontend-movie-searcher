<template>
    <div class="crew-member-detail-container">
      <h1>{{ crewMember?.firstName }} {{ crewMember?.lastName || 'Участник команды' }}</h1>
      <div v-if="crewMember" class="crew-member-card">
        <div class="crew-member-content">
          <img :src="formatPhoto(crewMember.photo)" :alt="`${crewMember.firstName} ${crewMember.lastName}`" class="crew-member-photo" />
          <div class="crew-member-details">
            <p><strong>Имя:</strong> {{ crewMember.firstName }}</p>
            <p><strong>Фамилия:</strong> {{ crewMember.lastName }}</p>
            <p><strong>Дата рождения:</strong> {{ formatBirthDate(crewMember.birthDate) }}</p>
            <p><strong>Биография:</strong> {{ crewMember.bio || 'Биография отсутствует' }}</p>
          </div>
        </div>
        <router-link to="/" class="back-button">Назад к списку</router-link>
      </div>
      <p v-else-if="error" class="error-message">{{ error }}</p>
      <p v-else class="loading-message">Загрузка...</p>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter, useRoute } from 'vue-router';
  import api from '@/services/api';
  
  export default {
    name: 'CrewMemberDetail',
    setup() {
      const store = useStore();
      const router = useRouter();
      const route = useRoute();
      const crewMember = ref(null);
      const error = ref('');
  
      const checkAuth = () => {
        if (!store.state.token) {
          router.push('/login');
          return false;
        }
        return true;
      };
  
      const formatPhoto = (photo) => {
        if (!photo) return 'https://via.placeholder.com/150x225?text=No+Image';
        if (photo.startsWith('data:image')) return photo;
        return `data:image/jpeg;base64,${photo}`;
      };

      const formatBirthDate = (date) => {
        if (!date) return 'N/A';
        try {
          const [day, month, year] = date.split('-');
          const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
          ];
          return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
        } catch {
          return 'N/A';
        }
      };
  
      const fetchCrewMember = async () => {
        if (!checkAuth()) return;
        try {
          const crewMemberId = route.params.id;
          const response = await api.getCrewMember(crewMemberId);
          crewMember.value = response.data;
          error.value = '';
        } catch (err) {
          error.value = 'Ошибка загрузки участника. Возможно, участник не найден.';
          console.error(err);
        }
      };
  
      onMounted(() => {
        fetchCrewMember();
      });
  
      return {
        crewMember,
        error,
        formatPhoto,
        formatBirthDate,
      };
    },
  };
  </script>
  
  <style scoped>
  .crew-member-detail-container {
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
  
  .crew-member-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  
  .crew-member-content {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .crew-member-photo {
    width: 200px;
    height: 300px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .crew-member-details {
    flex: 1;
    text-align: left;
  }
  
  .crew-member-details p {
    font-size: 14px;
    color: #333;
    margin: 0 0 10px;
  }
  
  .crew-member-details strong {
    color: #000;
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
    .crew-member-detail-container {
      margin: 20px;
      padding: 15px;
    }
  
    h1 {
      font-size: 18px;
    }
  
    .crew-member-card {
      padding: 10px;
    }
  
    .crew-member-content {
      flex-direction: column;
      align-items: center;
    }
  
    .crew-member-photo {
      width: 100%;
      height: auto;
      aspect-ratio: 2/3;
    }
  
    .crew-member-details {
      text-align: center;
    }
  
    .crew-member-details p {
      font-size: 13px;
    }
  
    .back-button {
      font-size: 12px;
    }
  }
  </style>