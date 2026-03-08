<template>
  <div class="review-list">
    <h4 class="title">旅伴評價 ({{ reviews.length }})</h4>

    <div v-if="reviews.length === 0" class="empty-state">目前還沒有人對這裡留下評價，成為第一個評分的人吧！</div>

    <div v-else class="reviews-container">
      <div
        v-for="review in sortedReviews"
        :key="review.role_name + review.timestamp"
        class="review-item"
        :class="{ 'is-me': review.role_name === currentUser }">
        <div class="review-header">
          <div class="user-info">
            <div class="avatar">{{ review.role_name.charAt(0).toUpperCase() }}</div>
            <span class="name"
              >{{ review.role_name }} <span v-if="review.role_name === currentUser" class="badge">您</span></span
            >
          </div>
          <div class="meta">
            <StarRating :modelValue="Number(review.rating)" :readonly="true" />
            <span class="date">{{ formatDate(review.timestamp) }}</span>
          </div>
        </div>

        <div v-if="review.comment" class="comment">
          {{ review.comment }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Review } from "~/composables/useAttractions";

const props = defineProps<{
  reviews: Review[];
  currentUser: string | null;
}>();

const sortedReviews = computed(() => {
  return [...props.reviews].sort((a, b) => {
    // Current user's review first, then sort by newest
    if (a.role_name === props.currentUser) return -1;
    if (b.role_name === props.currentUser) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
});

const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
</script>

<style scoped>
.review-list {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
}

.title {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.empty-state {
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 0.95rem;
  padding: 12px 0;
}

.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background: rgba(15, 23, 42, 0.4);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.review-item.is-me {
  background: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.is-me .avatar {
  background: var(--color-accent);
}

.name {
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  font-size: 0.7rem;
  background: var(--color-accent);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.date {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.comment {
  color: var(--color-text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
  padding-left: 42px; /* align with text, not avatar */
  white-space: pre-line;
}
</style>
