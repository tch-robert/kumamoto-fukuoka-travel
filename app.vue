<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header glass-panel">
      <div class="header-container">
        <h1>九州旅遊會議 📍</h1>

        <div v-if="roleName" class="user-profile">
          <span class="greeting"
            >目前登入：<strong>{{ roleName }}</strong></span
          >
          <button @click="handleLogout" class="action-link text-sm">更換角色</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Filters / Controls -->
      <div v-if="roleName" class="controls glass-panel">
        <div class="control-group">
          <label>選擇地區：</label>
          <div class="filter-chips">
            <button
              v-for="region in availableRegions"
              :key="region"
              class="chip"
              :class="{ active: selectedRegion === region }"
              @click="selectedRegion = region">
              {{ region === "all" ? "全部地區" : formatRegion(region) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state glass-panel">
        <div class="spinner"></div>
        <p>正在從 Google Sheet 載入景點資料...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state glass-panel">
        <p>載入失敗：{{ error }}</p>
        <button @click="fetchAttractions" class="btn-primary mt-4">重新載入</button>
      </div>

      <!-- Content Grid -->
      <div v-else-if="filteredAttractions.length > 0" class="attractions-grid">
        <AttractionCard v-for="attraction in filteredAttractions" :key="attraction.id" :attraction="attraction" />
      </div>

      <div v-else-if="isInitialized && roleName" class="empty-state glass-panel">
        <p>目前沒有找到對應的景點資料。</p>
      </div>
    </main>

    <!-- Initial Modal -->
    <RoleModal :is-open="isInitialized && !roleName" @submit="handleRoleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUser } from "~/composables/useUser";
import { useAttractions } from "~/composables/useAttractions";

const { roleName, isInitialized, initUser, setUser, logout } = useUser();
const { attractions, isLoading, error, fetchAttractions } = useAttractions();

const selectedRegion = ref("all");

const availableRegions = computed(() => {
  const regions = new Set(attractions.value.map(a => a.region || "unknow"));
  return ["all", ...Array.from(regions)];
});

const filteredAttractions = computed(() => {
  if (selectedRegion.value === "all") return attractions.value;
  return attractions.value.filter(a => (a.region || "unknow") === selectedRegion.value);
});

const formatRegion = (region: string) => {
  const map: Record<string, string> = { kumamoto: "熊本", fukuoka: "福岡", yufuin: "由布院" };
  return map[region?.toLowerCase()] || region || "未知區域";
};

onMounted(async () => {
  initUser();
  await fetchAttractions();
});

const handleRoleSubmit = (name: string) => {
  setUser(name);
};

const handleLogout = () => {
  if (confirm("確定要登出並更換角色嗎？")) {
    logout();
  }
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  padding-bottom: 60px;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-radius: 0 0 24px 24px;
  margin-bottom: 32px;
  border-top: none;
  border-left: none;
  border-right: none;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-container h1 {
  font-size: 1.5rem;
  background: linear-gradient(90deg, #fff, #38bdf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.greeting {
  color: var(--color-text-secondary);
}

.greeting strong {
  color: #fff;
  font-weight: 600;
}

.action-link {
  color: var(--color-accent);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.action-link:hover {
  color: var(--color-accent-hover);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.controls {
  padding: 16px 24px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.control-group label {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.filter-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.chip {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  font-weight: 500;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.chip.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 32px;
}

.loading-state,
.error-state,
.empty-state {
  padding: 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .attractions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
