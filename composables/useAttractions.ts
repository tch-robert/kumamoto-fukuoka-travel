import { ref } from "vue";

export interface Review {
  attraction_id: string;
  role_name: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Attraction {
  id: string;
  name: string;
  type: string;
  region: string;
  description: string;
  source_links: string[];
  reviews: Review[];
}

export const useAttractions = () => {
  const config = useRuntimeConfig();
  const API_URL = config.public.apiBaseUrl as string;

  const attractions = useState<Attraction[]>("attractions", () => []);
  const isLoading = useState<boolean>("isLoadingAttractions", () => false);
  const error = useState<string | null>("attractionsError", () => null);

  const fetchAttractions = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<{ status: string; data: Attraction[] }>(API_URL);
      if (response.status === "success") {
        attractions.value = response.data;
      } else {
        throw new Error("Failed to fetch data from API");
      }
    } catch (err: any) {
      error.value = err.message || "An unknown error occurred";
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const submitReview = async (attractionId: string, roleName: string, rating: number, comment: string) => {
    try {
      // GAS requires application/x-www-form-urlencoded to avoid CORS preflight issues
      const formData = new URLSearchParams();
      formData.append("attraction_id", attractionId);
      formData.append("role_name", roleName);
      formData.append("rating", rating.toString());
      formData.append("comment", comment);

      const response = await $fetch<{ status: string; message: string }>(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.status === "success") {
        // Optimistically update local state so we don't need a full refetch immediately
        const attraction = attractions.value.find(a => a.id === attractionId);
        if (attraction) {
          const existingReviewIndex = attraction.reviews.findIndex(r => r.role_name === roleName);
          const newReview: Review = {
            attraction_id: attractionId,
            role_name: roleName,
            rating,
            comment,
            timestamp: new Date().toISOString(),
          };

          if (existingReviewIndex >= 0) {
            // Replace existing
            attraction.reviews[existingReviewIndex] = newReview;
          } else {
            // Add new
            attraction.reviews.push(newReview);
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to submit review:", err);
      return false;
    }
  };

  return {
    attractions,
    isLoading,
    error,
    fetchAttractions,
    submitReview,
  };
};
