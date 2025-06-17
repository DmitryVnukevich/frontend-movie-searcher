<template>
  <div class="genre-form">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Название жанра</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Введите название жанра"
          class="form-input"
          :class="{ 'input-error': errors.name }"
        />
        <p v-if="errors.name" class="error-message">{{ errors.name }}</p>
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
import { ref, computed, watch, onMounted } from 'vue';
import api from '@/services/api';

export default {
  name: 'GenreForm',
  props: {
    genre: {
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
    const error = ref('');
    const isSubmitting = ref(false);
    const errors = ref({});
    const isDirty = ref(false);

    const form = ref({
      id: props.genre?.id || null,
      name: props.genre?.name || '',
    });

    const validateForm = () => {
      errors.value = {};
      if (!form.value.name.trim()) {
        errors.value.name = 'Название жанра обязательно';
      } else if (form.value.name.length > 100) {
        errors.value.name = 'Название не должно превышать 100 символов';
      }
      return Object.keys(errors.value).length === 0;
    };

    const hasErrors = computed(() => Object.keys(errors.value).length > 0);

    const submitForm = async () => {
      if (!validateForm()) return;
      isSubmitting.value = true;
      error.value = '';
      try {
        const payload = { ...form.value };
        let response;
        if (props.isEditMode) {
          response = await api.updateGenre(form.value.id, payload);
        } else {
          response = await api.createGenre(payload);
        }
        emit('submit', response.data);
        emit('close');
      } catch (err) {
        error.value = err.response?.data?.message || 'Ошибка при сохранении жанра';
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
      validateForm();
    });

    return {
      form,
      error,
      errors,
      isSubmitting,
      hasErrors,
      submitForm,
      handleCancel,
    };
  },
};
</script>

<style scoped>
.genre-form {
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

.form-input {
  width: 100%;
  padding: 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
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

@media (max-width: 600px) {
  .genre-form {
    padding: 15px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-input {
    font-size: 12px;
  }

  .save-button,
  .cancel-button {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>