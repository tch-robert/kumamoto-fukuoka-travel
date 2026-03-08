<template>
  <div class="attraction-card glass-panel">
    <div class="card-hero">
      <div class="card-tags">
        <span class="region-tag">{{ formatRegion(attraction.region) }}</span>
        <span class="type-tag" :class="attraction.type">{{ formatType(attraction.type) }}</span>
      </div>
      <h2 class="attraction-name">{{ attraction.name }}</h2>
    </div>

    <!-- Instagram Embed Area -->
    <div v-if="hasInstagram" class="media-container snap-scroll">
      <div v-for="(url, index) in attraction.source_links" :key="index" class="ig-wrapper">
        <blockquote
          class="instagram-media"
          :data-instgrm-permalink="getIgPermalink(url)"
          data-instgrm-version="14"
          style="
            background: #fff;
            border: 0;
            border-radius: 3px;
            box-shadow:
              0 0 1px 0 rgba(0, 0, 0, 0.5),
              0 1px 10px 0 rgba(0, 0, 0, 0.15);
            margin: 1px;
            max-width: 540px;
            min-width: 326px;
            padding: 0;
            width: 99.375%;
            width: -webkit-calc(100% - 2px);
            width: calc(100% - 2px);
          "></blockquote>
      </div>
    </div>

    <div class="card-body">
      <p class="description">{{ attraction.description }}</p>

      <!-- Current User Rating Action -->
      <div class="my-rating-action">
        <div class="action-header">
          <h4>您的評價</h4>
          <span v-if="saveStatus" class="status-msg" :class="saveStatus.type">
            {{ saveStatus.msg }}
          </span>
        </div>

        <div class="rating-input-area">
          <StarRating v-model="draftRating" />
          <textarea
            v-model="draftComment"
            placeholder="寫下您對這個景點的看法或期待... (選填)"
            class="comment-input"
            rows="2"></textarea>
          <div class="action-footer">
            <button class="btn-primary small-btn" @click="handleSave" :disabled="draftRating === 0 || isSubmitting">
              {{ isSubmitting ? "儲存中..." : hasMyReview ? "更新評價" : "送出評價" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Other Reviews -->
      <ReviewList :reviews="attraction.reviews || []" :current-user="roleName" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { Attraction } from "~/composables/useAttractions";
import { useUser } from "~/composables/useUser";
import { useAttractions } from "~/composables/useAttractions";

const props = defineProps<{
  attraction: Attraction;
}>();

const { roleName } = useUser();
const { submitReview } = useAttractions();

// Draft state for current user
const draftRating = ref(0);
const draftComment = ref("");
const isSubmitting = ref(false);
const saveStatus = ref<{ msg: string; type: "success" | "error" } | null>(null);

// Computed attributes
const hasInstagram = computed(() => {
  return props.attraction.source_links && props.attraction.source_links.length > 0;
});

const myReview = computed(() => {
  if (!roleName.value || !props.attraction.reviews) return null;
  return props.attraction.reviews.find(r => r.role_name === roleName.value);
});

const hasMyReview = computed(() => !!myReview.value);

// Sync existing review to drafts
watch(
  myReview,
  newReview => {
    if (newReview) {
      draftRating.value = Number(newReview.rating);
      draftComment.value = newReview.comment || "";
    }
  },
  { immediate: true },
);

// Formatting helpers
const formatRegion = (region: string) => {
  const map: Record<string, string> = { kumamoto: "熊本", fukuoka: "福岡", yufuin: "由布院" };
  return map[region?.toLowerCase()] || region || "未知區域";
};

const formatType = (type: string) => {
  const map: Record<string, string> = { attraction: "📍 景點", restaurant: "🍽️ 美食", accommodation: "🏨 住宿" };
  return map[type?.toLowerCase()] || type || "景點";
};

const getIgPermalink = (url: string) => {
  return url.split("?")[0].replace(/\/$/, "");
};

declare global {
  interface Window {
    instgrm?: any;
  }
}

// Load IG embed script on mount
onMounted(() => {
  if (hasInstagram.value && !window.instgrm) {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }
});

// Re-process embeds when the component is ready
watch(
  () => props.attraction,
  () => {
    if (window.instgrm) {
      // Give Vue time to render the blockquotes
      setTimeout(() => {
        window.instgrm.Embeds.process();
      }, 100);
    }
  },
  { immediate: true },
);

const handleSave = async () => {
  if (draftRating.value === 0 || !roleName.value) return;

  isSubmitting.value = true;
  saveStatus.value = null;

  const success = await submitReview(props.attraction.id, roleName.value, draftRating.value, draftComment.value);

  isSubmitting.value = false;
  if (success) {
    saveStatus.value = { msg: "儲存成功！", type: "success" };
    setTimeout(() => {
      saveStatus.value = null;
    }, 3000);
  } else {
    saveStatus.value = { msg: "儲存失敗，請重試", type: "error" };
  }
};
</script>

<style scoped>
.attraction-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform var(--transition-normal),
    box-shadow var(--transition-normal);
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
}

.card-hero {
  padding: 24px 24px 16px;
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.6), transparent);
  border-bottom: 1px solid var(--glass-border);
}

.card-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.region-tag,
.type-tag {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.region-tag {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.type-tag.attraction {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
.type-tag.restaurant {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}
.type-tag.accommodation {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.attraction-name {
  font-size: 1.6rem;
  color: #fff;
}

.media-container {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  scrollbar-width: thin;
}

.snap-scroll {
  scroll-snap-type: x mandatory;
}

.ig-wrapper {
  flex: 0 0 350px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: transparent;
  scroll-snap-align: start;
}

.card-body {
  padding: 24px;
  flex: 1;
}

.description {
  color: var(--color-text-primary);
  font-size: 1.05rem;
  margin-bottom: 24px;
  white-space: pre-line;
}

/* Rating Area */
.my-rating-action {
  background: rgba(15, 23, 42, 0.5);
  border-radius: var(--radius-md);
  padding: 20px;
  border: 1px solid rgba(56, 189, 248, 0.15);
}

.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.action-header h4 {
  color: var(--color-accent);
  margin: 0;
}

.status-msg {
  font-size: 0.85rem;
  font-weight: 600;
}
.status-msg.success {
  color: var(--color-success);
}
.status-msg.error {
  color: #ef4444;
}

.rating-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color var(--transition-fast);
  outline: none;
}

.comment-input:focus {
  border-color: var(--color-accent);
}

.action-footer {
  display: flex;
  justify-content: flex-end;
}

.small-btn {
  padding: 8px 20px;
  font-size: 0.95rem;
}
</style>
