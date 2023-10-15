import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useViewStore = defineStore(
  "view",
  () => {
    const openedPost = ref<Record<string, string>>();
    const currentView = computed(() => (!openedPost.value ? "post" : "context"));

    const resetStore = () => {
      openedPost.value = undefined;
    };

    const openPostContextView = (post: Record<string, string>) => {
      openedPost.value = post;
    };

    return {
      openedPost,
      currentView,
      resetStore,
      openPostContextView,
    };
  },
  { persist: true },
);
