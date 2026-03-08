<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content glass-panel">
      <div class="modal-header">
        <h2>歡迎來到九州行程會議</h2>
        <p>在開始探索與評分景點前，請先輸入您的專屬角色名稱：</p>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="input-group">
          <input
            v-model="nameInput"
            type="text"
            placeholder="例如：提督、旅伴A..."
            required
            autocomplete="off"
            @focus="isFocused = true"
            @blur="isFocused = false"
            :class="{ 'has-focus': isFocused }" />
        </div>

        <button type="submit" class="btn-primary submit-btn" :disabled="!isNameValid">進入會議</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", name: string): void;
}>();

const nameInput = ref("");
const isFocused = ref(false);

const isNameValid = computed(() => {
  return nameInput.value.trim().length > 0;
});

const handleSubmit = () => {
  if (isNameValid.value) {
    emit("submit", nameInput.value.trim());
    nameInput.value = "";
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn var(--transition-normal);
}

.modal-content {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  text-align: center;
  animation: slideUp var(--transition-normal);
}

.modal-header h2 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 12px;
}

.modal-header p {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 24px;
  position: relative;
}

input {
  width: 100%;
  padding: 16px 20px;
  font-size: 1.1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 2px solid var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  color: #fff;
  transition: all var(--transition-fast);
  outline: none;
}

input:focus,
input.has-focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
  background: rgba(15, 23, 42, 0.8);
}

input::placeholder {
  color: var(--color-text-secondary);
}

.submit-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
