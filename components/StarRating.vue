<template>
  <div class="star-rating" :class="{ readonly }">
    <button
      v-for="star in 5"
      :key="star"
      type="button"
      class="star-btn"
      :class="{
        active: star <= (hoverValue || modelValue),
        interactive: !readonly,
      }"
      @click="!readonly && emit('update:modelValue', star)"
      @mouseenter="!readonly && (hoverValue = star)"
      @mouseleave="!readonly && (hoverValue = 0)"
      :disabled="readonly"
      :aria-label="`Rate ${star} out of 5 stars`">
      <!-- SVG Star -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star-icon">
        <path
          fill-rule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
          clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
const hoverValue = ref(0);
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 4px;
}

.star-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: default;
  color: var(--color-star-empty);
  transition:
    transform 0.1s ease,
    color 0.2s ease;
}

.star-btn.interactive {
  cursor: pointer;
}

.star-btn.interactive:hover {
  transform: scale(1.15);
}

.star-icon {
  width: 28px;
  height: 28px;
  transition: all 0.2s ease;
}

.readonly .star-icon {
  width: 18px;
  height: 18px;
}

.star-btn.active {
  color: var(--color-star);
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.4));
}
</style>
