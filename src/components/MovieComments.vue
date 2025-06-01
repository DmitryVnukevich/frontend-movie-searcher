<template>
  <div class="comments-container">
    <h2>Комментарии</h2>
    <div v-if="isLoading" class="loading">Загрузка...</div>
    <div v-else-if="comments.length === 0" class="no-comments">
      Комментариев пока нет. Будьте первым!
    </div>

    <div v-if="!hasCommented && isAuthenticated" class="comment-form">
      <h3>Оставить комментарий</h3>
      <form @submit.prevent="submitComment">
        <div class="form-group">
          <label for="rating">Оценка:</label>
          <div class="rating-stars">
            <span
              v-for="star in 10"
              :key="star"
              :class="['star', { filled: star <= (newCommentHoverRating || newComment.rating) }]"
              @mouseover="newCommentHoverRating = star"
              @mouseleave="newCommentHoverRating = 0"
              @click="newComment.rating = star"
            >
              ★
            </span>
          </div>
        </div>
        <div class="form-group">
          <label for="review">Комментарий:</label>
          <textarea
            id="review"
            v-model.trim="newComment.review"
            placeholder="Ваш комментарий (до 255 символов)"
            maxlength="255"
            required
          ></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-button" :disabled="isSubmitting">
            {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
      </form>
      <p v-if="formError" class="error-message">{{ formError }}</p>
    </div>
    <p v-else-if="hasCommented && isAuthenticated" class="comment-exists">
      Вы уже оставили комментарий к этому фильму.
    </p>
    <p v-else class="login-prompt">
      <router-link to="/login">Войдите</router-link>, чтобы оставить комментарий.
    </p>

    <div v-if="!isLoading && comments.length > 0" class="comments-list">
      <div v-for="comment in sortedComments" :key="comment.id" class="comment-card">
        <div class="comment-header">
          <span class="comment-username">{{ comment.username }}</span>
          <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <div v-if="editingCommentId === comment.id" class="edit-form">
          <div class="form-group">
            <label for="edit-rating">Оценка:</label>
            <div class="rating-stars">
              <span
                v-for="star in 10"
                :key="star"
                :class="['star', { filled: star <= (editingCommentHoverRating || editingComment.rating) }]"
                @mouseover="editingCommentHoverRating = star"
                @mouseleave="editingCommentHoverRating = 0"
                @click="editingComment.rating = star"
              >
                ★
              </span>
            </div>
          </div>
          <div class="form-group">
            <label for="edit-review">Комментарий:</label>
            <textarea
              id="edit-review"
              v-model.trim="editingComment.review"
              placeholder="Ваш комментарий (до 255 символов)"
              maxlength="255"
              required
            ></textarea>
          </div>
          <div class="form-actions">
            <button
              @click="submitEdit(comment.id)"
              class="submit-button"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <button @click="cancelEditing" class="cancel-button">Отмена</button>
          </div>
          <p v-if="formError" class="error-message">{{ formError }}</p>
        </div>
        <div v-else>
          <div class="comment-rating">
            <span
              v-for="star in 10"
              :key="star"
              :class="['star', { filled: star <= comment.rating }]"
            >
              ★
            </span>
            <span class="rating-value">{{ comment.rating }}/10</span>
          </div>
          <p class="comment-review">{{ comment.review }}</p>
          <div v-if="isAuthenticated && comment.userId === currentUserId" class="comment-actions">
            <button @click="startEditing(comment)" class="edit-button">Редактировать</button>
            <button @click="deleteComment(comment.id)" class="delete-button">Удалить</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        :disabled="currentPage === 0"
        @click="currentPage--"
        class="pagination-button"
      >
        Назад
      </button>
      <span v-for="page in pageNumbers" :key="page" class="page-number">
        <button
          v-if="page !== '...'"
          :class="{ active: currentPage === page - 1 }"
          @click="currentPage = page - 1"
          class="pagination-button"
        >
          {{ page }}
        </button>
        <span v-else class="ellipsis">...</span>
      </span>
      <button
        :disabled="currentPage === totalPages - 1"
        @click="currentPage++"
        class="pagination-button"
      >
        Далее
      </button>
    </div>

    <siteToast ref="siteToast" />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import SiteToast from '@/components/SiteToast.vue';
import api from '@/services/api';

export default {
  name: 'MovieComments',
  components: {
    SiteToast,
  },
  props: {
    movieId: {
      type: [Number, String],
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const comments = ref([]);
    const isLoading = ref(false);
    const formError = ref('');
    const isSubmitting = ref(false);
    const editingCommentId = ref(null);
    const newComment = ref({
      rating: 0,
      review: '',
    });
    const newCommentHoverRating = ref(0);
    const editingComment = ref({
      rating: 0,
      review: '',
    });
    const editingCommentHoverRating = ref(0);
    const siteToast = ref(null);
    const currentPage = ref(0);
    const pageSize = ref(10);
    const totalPages = ref(0);
    const totalElements = ref(0);

    const isAuthenticated = computed(() => !!store.state.token);
    const currentUserId = computed(() => store.state.user?.id);

    const hasCommented = computed(() =>
      comments.value.some(comment => comment.userId === currentUserId.value)
    );

    const sortedComments = computed(() => {
      if (!comments.value.length) return [];
      const userComment = comments.value.find(comment => comment.userId === currentUserId.value);
      const otherComments = comments.value
        .filter(comment => comment.userId !== currentUserId.value)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return userComment ? [userComment, ...otherComments] : otherComments;
    });

    const pageNumbers = computed(() => {
      const maxPages = 5;
      const pages = [];
      if (totalPages.value <= maxPages) {
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage.value + 1 - Math.floor(maxPages / 2));
        const end = Math.min(totalPages.value, start + maxPages - 1);
        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push('...');
        }
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        if (end < totalPages.value) {
          if (end < totalPages.value - 1) pages.push('...');
          pages.push(totalPages.value);
        }
      }
      return pages;
    });

    const fetchComments = async () => {
      isLoading.value = true;
      try {
        const response = await api.getComments(props.movieId, currentPage.value, pageSize.value);
        comments.value = response.data.content;
        totalPages.value = response.data.totalPages;
        totalElements.value = response.data.totalElements;
        store.commit('setComments', response.data.content);
      } catch (err) {
        siteToast.value.showToast('Ошибка загрузки комментариев.', 'error');
        console.error('fetchComments error:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const submitComment = async () => {
        if (!newComment.value.rating || !newComment.value.review) {
            formError.value = 'Заполните все поля.';
            siteToast.value.showToast('Заполните все поля.', 'error');
            return;
        }
        isSubmitting.value = true;
        formError.value = '';
        try {
            const commentData = {
            movieId: props.movieId,
            rating: newComment.value.rating,
            review: newComment.value.review,
            };
            await store.dispatch('postComment', commentData);
            currentPage.value = 0;
            await fetchComments();
            newComment.value = { rating: 0, review: '' };
            newCommentHoverRating.value = 0;
            siteToast.value.showToast('Комментарий добавлен!', 'success');
        } catch (err) {
            formError.value = err.message || 'Ошибка отправки комментария.';
            siteToast.value.showToast(formError.value, 'error');
            console.error('submitComment error:', err);
        } finally {
            isSubmitting.value = false;
        }
    };

    const startEditing = (comment) => {
      editingCommentId.value = comment.id;
      editingComment.value = {
        rating: comment.rating,
        review: comment.review,
      };
      editingCommentHoverRating.value = 0;
      formError.value = '';
    };

    const submitEdit = async (commentId) => {
      if (!editingComment.value.rating || !editingComment.value.review) {
        formError.value = 'Заполните все поля.';
        siteToast.value.showToast('Заполните все поля.', 'error');
        return;
      }
      isSubmitting.value = true;
      formError.value = '';
      try {
        const commentData = {
          rating: editingComment.value.rating,
          review: editingComment.value.review,
        };
        console.log('Submitting edit for commentId:', commentId, 'with data:', commentData);
        const updatedComment = await api.updateComment(commentId, commentData);
        console.log('Received updated comment:', updatedComment);
        await fetchComments();
        siteToast.value.showToast('Комментарий обновлён!', 'success');
        cancelEditing();
      } catch (err) {
        formError.value = err.message || 'Ошибка обновления комментария.';
        siteToast.value.showToast(formError.value, 'error');
        console.error('submitEdit error:', err);
      } finally {
        isSubmitting.value = false;
      }
    };

    const cancelEditing = () => {
      editingCommentId.value = null;
      editingComment.value = { rating: 0, review: '' };
      editingCommentHoverRating.value = 0;
      formError.value = '';
    };

    const deleteComment = async (commentId) => {
      if (!confirm('Вы уверены, что хотите удалить комментарий?')) return;
      try {
        await api.deleteComment(commentId);
        await fetchComments();
        siteToast.value.showToast('Комментарий удалён!', 'success');
      } catch (err) {
        siteToast.value.showToast('Ошибка удаления комментария.', 'error');
        console.error('deleteComment error:', err);
      }
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return date;
    };

    watch(currentPage, () => {
      fetchComments();
    });

    onMounted(() => {
      fetchComments();
    });

    return {
      comments,
      sortedComments,
      isLoading,
      isAuthenticated,
      currentUserId,
      hasCommented,
      newComment,
      newCommentHoverRating,
      editingComment,
      editingCommentHoverRating,
      editingCommentId,
      formError,
      isSubmitting,
      currentPage,
      pageSize,
      totalPages,
      pageNumbers,
      submitComment,
      startEditing,
      submitEdit,
      cancelEditing,
      deleteComment,
      formatDate,
      siteToast,
    };
  },
};
</script>

<style scoped>
.comments-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: 'Montserrat', sans-serif;
}

h2 {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
}

.comment-form,
.edit-form {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.comment-form h3 {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #333;
  margin-bottom: 5px;
}

.rating-stars {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 20px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}

.star.filled {
  color: #f39c12;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.submit-button {
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-button {
  padding: 8px 12px;
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

.error-message {
  color: #dc3545;
  font-size: 13px;
  margin-top: 10px;
}

.comment-exists {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.login-prompt {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.login-prompt a {
  color: #007bff;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-username {
  font-size: 14px;
  font-weight: 500;
  color: #007bff;
}

.comment-date {
  font-size: 12px;
  color: #666;
}

.comment-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #333;
  margin-bottom: 10px;
}

.comment-rating .star {
  font-size: 16px;
  cursor: default;
}

.comment-rating .star.filled {
  color: #f39c12;
}

.rating-value {
  font-size: 13px;
  color: #333;
}

.comment-review {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin: 0;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-button {
  padding: 6px 10px;
  font-size: 12px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-button:hover {
  background-color: #0056b3;
}

.delete-button {
  padding: 6px 10px;
  font-size: 12px;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #c82333;
}

.no-comments {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 20px 0;
}

.loading {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 20px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
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

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.page-number {
  font-size: 13px;
}

.page-number .pagination-button.active {
  background-color: #0056b3;
  font-weight: bold;
}

.ellipsis {
  padding: 0 10px;
}

@media (max-width: 600px) {
  .comments-container {
    padding: 15px;
  }

  h2 {
    font-size: 18px;
  }

  .comment-form,
  .edit-form {
    padding: 15px;
  }

  .comment-form h3 {
    font-size: 14px;
  }

  .form-group label,
  .form-group textarea {
    font-size: 12px;
  }

  .rating-stars .star {
    font-size: 18px;
  }

  .submit-button,
  .cancel-button {
    font-size: 12px;
  }

  .comment-card {
    padding: 10px;
  }

  .comment-username {
    font-size: 13px;
  }

  .comment-date {
    font-size: 11px;
  }

  .comment-rating .star {
    font-size: 14px;
  }

  .comment-rating,
  .rating-value,
  .comment-review {
    font-size: 12px;
  }

  .edit-button,
  .delete-button {
    font-size: 11px;
    padding: 5px 8px;
  }

  .comment-exists,
  .login-prompt {
    font-size: 13px;
  }

  .pagination-button {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>