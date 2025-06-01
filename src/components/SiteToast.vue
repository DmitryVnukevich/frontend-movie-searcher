<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
      :style="{ animation: 'slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s' }"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'SiteToast',
  setup() {
    const toasts = ref([]);

    const showToast = (message, type = 'success') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
      }, 3000);
    };

    return {
      toasts,
      showToast,
    };
  },
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Montserrat', sans-serif;
  color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  max-width: 300px;
}

.toast.success {
  background-color: #007bff;
}

.toast.error {
  background-color: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@media (max-width: 600px) {
  .toast-container {
    top: 10px;
    right: 10px;
  }

  .toast {
    min-width: 150px;
    max-width: 250px;
    font-size: 12px;
  }
}
</style>