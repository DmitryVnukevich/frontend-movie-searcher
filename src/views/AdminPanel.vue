<template>
  <div class="admin-panel">
    <h1>Панель администратора</h1>
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ 'tab-active': activeTab === tab.name }"
        @click="setActiveTab(tab.name)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="content">
      <div v-if="isLoading" class="loading">Загрузка...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else>
        <!-- Кнопка "Добавить" -->
        <button class="add-button" @click="openAddModal(activeTab)">
          Добавить {{ tabs.find(t => t.name === activeTab).label.toLowerCase() }}
        </button>
        <!-- Таблица -->
        <table class="data-table" v-if="sortedItems.length">
          <thead>
            <tr>
              <th v-for="column in getColumns(activeTab)" :key="column.key" @click="sort(column.key)">
                {{ column.label }}
                <span v-if="sortKey === column.key">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sortedItems" :key="item.id">
              <td v-for="column in getColumns(activeTab)" :key="column.key">
                {{ formatColumn(item, column.key) }}
              </td>
              <td class="actions">
                <button class="edit-button" @click="openEditModal(item)">Редактировать</button>
                <button class="delete-button" @click="deleteItem(item.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="no-data">Нет данных</div>
        <!-- Пагинация -->
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
            Вперёд
          </button>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <movie-form
          v-if="activeTab === 'movies'"
          :movie="selectedItem"
          :is-edit-mode="isEditMode"
          @close="closeModal"
          @submit="handleFormSubmit"
        />
        <crew-member-form
          v-else-if="activeTab === 'crew'"
          :crew-member="selectedItem"
          :is-edit-mode="isEditMode"
          @close="closeModal"
          @submit="handleFormSubmit"
        />
        <genre-form
          v-else-if="activeTab === 'genres'"
          :genre="selectedItem"
          :is-edit-mode="isEditMode"
          @close="closeModal"
          @submit="handleFormSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import api from '@/services/api';
import MovieForm from '@/components/MovieForm.vue';
import CrewMemberForm from '@/components/CrewMemberForm.vue';
import GenreForm from '@/components/GenreForm.vue';

export default {
  name: 'AdminPanel',
  components: {
    MovieForm,
    CrewMemberForm,
    GenreForm,
  },
  setup() {
    const store = useStore();
    const activeTab = ref('movies');
    const isLoading = ref(false);
    const error = ref('');
    const sortKey = ref('id');
    const sortOrder = ref('asc');
    const showModal = ref(false);
    const selectedItem = ref(null);
    const isEditMode = ref(false);

    const tabs = [
      { name: 'movies', label: 'Фильмы и сериалы' },
      { name: 'crew', label: 'Участники съемочной группы' },
      { name: 'genres', label: 'Жанры' },
    ];

    const columns = {
      movies: [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Название' },
        { key: 'ageRating', label: 'Возрастной рейтинг' },
        { key: 'contentType', label: 'Тип контента' },
      ],
      crew: [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'Имя' },
        { key: 'lastName', label: 'Фамилия' },
        { key: 'birthDate', label: 'Дата рождения' },
      ],
      genres: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Название' },
      ],
    };

    const items = computed(() => {
      if (activeTab.value === 'movies') return store.state.adminMovies;
      if (activeTab.value === 'crew') return store.state.adminCrewMembers;
      return store.state.adminGenres;
    });

    const currentPage = computed(() => {
      if (activeTab.value === 'movies') return store.state.adminMoviesPage;
      if (activeTab.value === 'crew') return store.state.adminCrewPage;
      return store.state.adminGenresPage;
    });

    const totalPages = computed(() => {
      if (activeTab.value === 'movies') return store.state.adminMoviesTotalPages;
      if (activeTab.value === 'crew') return store.state.adminCrewTotalPages;
      return store.state.adminGenresTotalPages;
    });

    const sortedItems = computed(() => {
      return [...items.value].sort((a, b) => {
        let valueA = a[sortKey.value];
        let valueB = b[sortKey.value];

        if (sortKey.value === 'birthDate') {
          const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const [day, month, year] = dateStr.split('-');
            return new Date(`${year}-${month}-${day}`);
          };
          valueA = parseDate(valueA);
          valueB = parseDate(valueB);
          if (!valueA && !valueB) return 0;
          if (!valueA) return sortOrder.value === 'asc' ? 1 : -1;
          if (!valueB) return sortOrder.value === 'asc' ? -1 : 1;
        } else if (typeof valueA === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1;
        return 0;
      });
    });

    const getColumns = () => columns[activeTab.value];

    const formatColumn = (item, key) => {
      if (key === 'birthDate') {
        return item[key] ? item[key].replace(/-/g, '.') : 'N/A'; // dd-MM-yyyy -> dd.MM.yyyy
      }
      return item[key] || 'N/A';
    };

    const sort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    };

    const setActiveTab = (tab) => {
      activeTab.value = tab;
      fetchData(tab, 0);
    };

    const fetchData = async (tab, page) => {
      isLoading.value = true;
      error.value = '';
      try {
        if (tab === 'movies') {
          await store.dispatch('fetchAdminMovies', { page, size: 12 });
        } else if (tab === 'crew') {
          await store.dispatch('fetchAdminCrewMembers', { page, size: 20 });
        } else if (tab === 'genres') {
          await store.dispatch('fetchAdminGenres', { page, size: 20 });
        }
      } catch (err) {
        error.value = `Ошибка загрузки ${tabs.find(t => t.name === tab).label.toLowerCase()}.`;
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const changePage = (page) => {
      if (page >= 0 && page < totalPages.value) {
        fetchData(activeTab.value, page);
      }
    };

    const deleteItem = async (id) => {
      if (!confirm(`Удалить ${tabs.find(t => t.name === activeTab.value).label.toLowerCase()} ID: ${id}?`)) return;
      try {
        await store.dispatch('deleteAdminItem', { tab: activeTab.value, id });
        await fetchData(activeTab.value, currentPage.value);
      } catch (err) {
        error.value = `Ошибка удаления ${tabs.find(t => t.name === activeTab.value).label.toLowerCase()}.`;
        console.error(err);
      }
    };

    const openAddModal = () => {
      selectedItem.value = null;
      isEditMode.value = false;
      showModal.value = true;
    };

    const openEditModal = async (item) => {
      try {
        if (activeTab.value === 'movies') {
          const response = await api.getMovie(item.id);
          selectedItem.value = response.data;
        } else if (activeTab.value === 'genres') {
          const response = await api.getGenre(item.id);
          selectedItem.value = response.data;
        } else {
          selectedItem.value = { ...item };
        }
        isEditMode.value = true;
        showModal.value = true;
      } catch (err) {
        error.value = 'Ошибка загрузки данных для редактирования.';
        console.error(err);
      }
    };

    const closeModal = () => {
      showModal.value = false;
      selectedItem.value = null;
      isEditMode.value = false;
    };

    const handleFormSubmit = async () => {
      await fetchData(activeTab.value, currentPage.value);
      closeModal();
    };

    onMounted(() => {
      fetchData(activeTab.value, 0);
    });

    return {
      activeTab,
      tabs,
      isLoading,
      error,
      getColumns,
      formatColumn,
      sort,
      sortKey,
      sortOrder,
      sortedItems,
      currentPage,
      totalPages,
      showModal,
      selectedItem,
      isEditMode,
      openAddModal,
      openEditModal,
      closeModal,
      handleFormSubmit,
      deleteItem,
      changePage,
      setActiveTab,
    };
  },
};
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
  background-color: #f8f8f8;
}

h1 {
  font-size: 22px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.tabs button {
  padding: 10px 20px;
  font-size: 14px;
  color: #333;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tabs button:hover {
  background-color: #e0e0e0;
}

.tab-active {
  background-color: #007bff !important;
  color: #fff !important;
}

.content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.add-button {
  padding: 10px 20px;
  font-size: 14px;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-button:hover {
  background-color: #218838;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 10px;
  font-size: 13px;
  color: #333;
  border: 1px solid #ddd;
}

.data-table th {
  background-color: #f0f0f0;
  cursor: pointer;
}

.data-table th:hover {
  background-color: #e0e0e0;
}

.data-table tbody tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.edit-button,
.delete-button {
  padding: 6px 12px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button {
  background-color: #007bff;
  color: #fff;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545;
  color: #fff;
}

.delete-button:hover {
  background-color: #c82333;
}

.loading,
.error-message,
.no-data {
  font-size: 14px;
  color: #666;
  margin: 20px;
}

.error-message {
  color: #dc3545;
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

.pagination-button:hover {
  background-color: #0056b3;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 13px;
  color: #333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.cancel-button {
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #c82333;
}

@media (max-width: 900px) {
  .admin-panel {
    margin: 20px;
    padding: 15px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tabs button {
    font-size: 13px;
    padding: 8px 16px;
  }

  .data-table th,
  .data-table td {
    font-size: 12px;
    padding: 8px;
  }

  .pagination-button {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 18px;
  }

  .tabs button {
    font-size: 12px;
    padding: 6px 12px;
  }

  .add-button {
    font-size: 13px;
    padding: 8px 16px;
  }

  .data-table {
    display: block;
    overflow-x: auto;
  }

  .edit-button,
  .delete-button {
    font-size: 11px;
    padding: 5px 10px;
  }

  .pagination-button {
    font-size: 12px;
    padding: 6px 10px;
  }

  .modal-content {
    padding: 15px;
    width: 95%;
  }
}
</style>