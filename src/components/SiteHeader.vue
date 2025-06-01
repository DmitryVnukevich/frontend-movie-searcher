<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">Movie Searcher</router-link>
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск фильмов..."
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button class="search-button" @click="performSearch">Найти</button>
      </div>
    </div>
  </header>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SiteHeader',
  setup() {
    const store = useStore();
    const router = useRouter();

    const searchQuery = computed({
      get: () => store.state.searchQuery,
      set: (value) => store.commit('setSearchQuery', value),
    });

    const performSearch = async () => {
      if (!searchQuery.value.trim()) {
        await router.push({ path: '/' });
        return;
      }
      try {
        console.log('SiteHeader performSearch:', searchQuery.value);
        await store.dispatch('searchMovies', { query: searchQuery.value });
        await router.push({ path: '/', query: { search: searchQuery.value } });
      } catch (error) {
        console.error('SiteHeader search error:', error.message);
      }
    };

    return { searchQuery, performSearch };
  },
};
</script>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 60px;
  display: flex;
  align-items: center;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
}

.logo {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  text-decoration: none;
  padding-left: 50px;
  padding-right: 50px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
}

.search-button {
  padding: 8px 12px;
  font-size: 14px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}

@media (max-width: 600px) {
  .header {
    height: 60px;
  }

  .header-container {
    flex-direction: row;
    justify-content: flex-start;
    padding: 10px;
  }

  .logo {
    font-size: 18px;
  }

  .search-bar {
    display: none;
  }
}
</style>