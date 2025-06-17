<template>
  <div class="crew-member-form">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="firstName">Имя</label>
        <input
          id="firstName"
          v-model="form.firstName"
          type="text"
          required
          placeholder="Введите имя"
          class="form-input"
          :class="{ 'input-error': errors.firstName }"
        />
        <p v-if="errors.firstName" class="error-message">{{ errors.firstName }}</p>
      </div>
      <div class="form-group">
        <label for="lastName">Фамилия</label>
        <input
          id="lastName"
          v-model="form.lastName"
          type="text"
          required
          placeholder="Введите фамилию"
          class="form-input"
          :class="{ 'input-error': errors.lastName }"
        />
        <p v-if="errors.lastName" class="error-message">{{ errors.lastName }}</p>
      </div>
      <div class="form-group">
        <label for="birthDate">Дата рождения</label>
        <input
          id="birthDate"
          v-model="form.birthDate"
          type="date"
          class="form-input"
          :class="{ 'input-error': errors.birthDate }"
        />
        <p v-if="errors.birthDate" class="error-message">{{ errors.birthDate }}</p>
      </div>
      <div class="form-group">
        <label for="bio">Биография</label>
        <textarea
          id="bio"
          v-model="form.bio"
          placeholder="Введите биографию"
          class="form-textarea"
          :class="{ 'input-error': errors.bio }"
        ></textarea>
        <p v-if="errors.bio" class="error-message">{{ errors.bio }}</p>
      </div>
      <div class="form-group">
        <label for="photo">Фото</label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          @change="handlePhotoUpload"
          class="form-input"
        />
        <img
          v-if="form.photo"
          :src="formatPhoto(form.photo)"
          alt="Превью фото"
          class="photo-preview"
        />
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
  name: 'CrewMemberForm',
  props: {
    crewMember: {
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
      id: props.crewMember?.id || null,
      firstName: props.crewMember?.firstName || '',
      lastName: props.crewMember?.lastName || '',
      birthDate: props.crewMember?.birthDate
        ? props.crewMember.birthDate.split('-').reverse().join('-')
        : '',
      bio: props.crewMember?.bio || '',
      photo: props.crewMember?.photo || '',
    });

    const formatPhoto = (photo) => {
      if (!photo) return 'https://via.placeholder.com/100x150?text=No+Image';
      if (photo.startsWith('data:image')) return photo;
      return `data:image/jpeg;base64,${photo}`;
    };

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          form.value.photo = e.target.result;
          isDirty.value = true;
        };
        reader.readAsDataURL(file);
      }
    };

    const validateForm = () => {
      errors.value = {};
      if (!form.value.firstName.trim()) {
        errors.value.firstName = 'Имя обязательно';
      }
      if (!form.value.lastName.trim()) {
        errors.value.lastName = 'Фамилия обязательна';
      }
      if (form.value.birthDate) {
        const date = new Date(form.value.birthDate);
        if (isNaN(date.getTime())) {
          errors.value.birthDate = 'Неверный формат даты';
        } else if (date > new Date()) {
          errors.value.birthDate = 'Дата рождения не может быть в будущем';
        }
      }
      if (form.value.bio && form.value.bio.length > 5000) {
        errors.value.bio = 'Биография не должна превышать 5000 символов';
      }
      return Object.keys(errors.value).length === 0;
    };

    const hasErrors = computed(() => Object.keys(errors.value).length > 0);

    const submitForm = async () => {
      if (!validateForm()) return;
      isSubmitting.value = true;
      error.value = '';
      try {
        const formattedBirthDate = form.value.birthDate
          ? form.value.birthDate.split('-').reverse().join('-')
          : null;
        const payload = {
          ...form.value,
          birthDate: formattedBirthDate,
          photo: form.value.photo && form.value.photo.startsWith('data:image')
            ? form.value.photo.split(',')[1]
            : form.value.photo || null,
        };
        let response;
        if (props.isEditMode) {
          response = await api.updateCrewMember(form.value.id, payload);
        } else {
          response = await api.createCrewMember(payload);
        }
        emit('submit', response.data);
        emit('close');
      } catch (err) {
        error.value = err.response?.data?.message || 'Ошибка при сохранении участника';
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
      handlePhotoUpload,
      formatPhoto,
      submitForm,
      handleCancel,
    };
  },
};
</script>

<style scoped>
.crew-member-form {
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

.photo-preview {
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

@media (max-width: 600px) {
  .crew-member-form {
    padding: 15px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-input,
  .form-textarea {
    font-size: 12px;
  }

  .save-button,
  .cancel-button {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>