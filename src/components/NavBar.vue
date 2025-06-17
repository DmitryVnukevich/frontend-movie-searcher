<template>
  <div class="navbar">
    <button class="menu-toggle" :class="{ 'menu-hidden': isOpen }" @click="toggleMenu" aria-label="Toggle menu">
      <span class="menu-icon"></span>
    </button>

    <div class="sidebar" :class="{ 'sidebar-open': isOpen }">
      <div class="sidebar-header">
        <h2>Movie Searcher</h2>
        <button class="close-button" @click="toggleMenu" aria-label="Close menu">✕</button>
      </div>
      <nav class="sidebar-nav">
        <div class="mobile-search">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск фильмов..."
            class="search-input"
            @keyup.enter="performSearch"
          />
          <button class="search-button" @click="performSearch" aria-label="Search">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <router-link to="/" class="nav-link" @click="toggleMenu">Главная</router-link>
        <router-link to="/recommendations" class="nav-link" @click="toggleMenu" v-if="isLoggedIn">Рекомендации</router-link>
        <router-link to="/admin" class="nav-link" @click="toggleMenu" v-if="isLoggedIn && isAdmin">Панель администратора</router-link>
        <router-link to="/login" class="nav-link" @click="toggleMenu" v-if="!isLoggedIn">Вход</router-link>
        <router-link to="/register" class="nav-link" @click="toggleMenu" v-if="!isLoggedIn">Регистрация</router-link>
        <router-link to="/profile" class="nav-link" @click="toggleMenu" v-if="isLoggedIn">Профиль</router-link>
        <a href="#" class="nav-link" @click.prevent="logout" v-if="isLoggedIn">Выйти</a>
      </nav>
    </div>
    <div class="overlay" :class="{ 'overlay-active': isOpen }" @click="toggleMenu"></div>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

export default {
  name: 'NavBar',
  setup() {
    const store = useStore();
    const router = useRouter();
    const isOpen = ref(false);

    const isLoggedIn = computed(() => !!store.state.token);
    const isAdmin = computed(() => store.state.user?.roles?.includes('ADMIN') || false);
    const searchQuery = computed({
      get: () => store.state.searchQuery,
      set: (value) => store.commit('setSearchQuery', value),
    });

    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
      document.body.style.overflow = isOpen.value ? 'hidden' : '';
    };

    const logout = async () => {
      await store.dispatch('logout');
      toggleMenu();
      router.push('/login');
    };

    const performSearch = async () => {
      if (!searchQuery.value.trim()) {
        await router.push({ path: '/' });
        toggleMenu();
        return;
      }
      try {
        console.log('NavBar performSearch:', searchQuery.value);
        await store.dispatch('searchMovies', { query: searchQuery.value });
        await router.push({ path: '/', query: { search: searchQuery.value } });
        toggleMenu();
      } catch (error) {
        console.error('NavBar search error:', error.message);
      }
    };

    return { isOpen, toggleMenu, isLoggedIn, isAdmin, logout, searchQuery, performSearch };
  },
};
</script>

<style scoped>
.navbar {
  font-family: 'Montserrat', sans-serif;
}

.menu-toggle {
  position: fixed;
  top: 10px;
  left: 20px;
  background-color: #eaeaea;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 1100;
  padding: 10px;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-toggle:hover {
  background-color: #d0d0d0;
}

.menu-hidden {
  opacity: 0;
  pointer-events: none;
}

.menu-icon,
.menu-icon::before,
.menu-icon::after {
  display: block;
  width: 18px;
  height: 2px;
  background-color: #333;
  transition: all 0.3s ease;
}

.menu-icon {
  position: relative;
}

.menu-icon::before,
.menu-icon::after {
  content: '';
  position: absolute;
}

.menu-icon::before {
  top: -8px;
}

.menu-icon::after {
  top: 8px;
}

.menu-toggle[aria-expanded="true"] .menu-icon {
  background: transparent;
}

.menu-toggle[aria-expanded="true"] .menu-icon::before {
  transform: rotate(45deg);
  top: 0;
}

.menu-toggle[aria-expanded="true"] .menu-icon::after {
  transform: rotate(-45deg);
  top: 0;
}

.sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100%;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1110;
}

.sidebar-open {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 10px;
}

.nav-link {
  font-size: 15px;
  color: #333;
  text-decoration: none;
  padding: 10px;
  border-radius: 4px;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #007bff;
  color: #fff;
}

.mobile-search {
  display: none;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.search-input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  stroke: #333;
  transition: stroke 0.2s ease;
}

.search-button:hover .search-icon {
  stroke: #007bff;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 1080;
}

.overlay-active {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 600px) {
  .menu-toggle {
    top: 15px;
    left: 10px;
    padding: 10px;
    width: 36px;
    height: 36px;
  }

  .menu-icon,
  .menu-icon::before,
  .menu-icon::after {
    width: 16px;
    height: 1px;
  }

  .menu-icon::before {
    top: -6px;
  }

  .menu-icon::after {
    top: 6px;
  }

  .sidebar {
    width: 280px;
    left: -280px;
  }

  .sidebar-open {
    left: 0;
  }

  .sidebar-header h2 {
    font-size: 16px;
  }

  .nav-link {
    font-size: 14px;
  }

  .mobile-search {
    display: flex;
  }

  .search-input {
    font-size: 13px;
  }

  .search-button {
    padding: 6px;
  }

  .search-icon {
    width: 16px;
    height: 16px;
  }
}
</style>