import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // 部署至 GitHub Pages 建議關閉 SSR
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  app: {
    baseURL: process.env.NODE_ENV === "production" ? "/kumamoto-fukuoka-travel/" : "/", // 只有生產環境使用 Repo 名稱作為路徑，避免 GitHub Pages 找不到資源
    buildAssetsDir: "assets", // 避免 GitHub Pages 忽略以底線開頭的目錄
    head: {
      title: "熊本福岡旅行景點評分",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { hid: "description", name: "description", content: "與旅伴一起探索並評價九州旅遊景點" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&family=Outfit:wght@300;400;600;700&display=swap",
        },
      ],
    },
  },
  router: {
    options: {
      hashMode: true, // 開啟 Hash Mode (/#/) 以避免 GitHub Pages 重新整理時 404
    },
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "",
    },
  },
  css: ["~/assets/css/main.css"],
});
