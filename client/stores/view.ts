import { defineStore } from "pinia";
import { ref } from "vue";

export const useViewStore = defineStore(
  "view",
  () => {
    const openPost = ref<Record<string, string>>();
    const currentView = ref("post");

    const resetStore = () => {
      currentView.value = "post";
      openPost.value = undefined;
    };

    const openPostContextView = (post: Record<string, string>) => {
      currentView.value = "context";
      openPost.value = post;
    };

    return {
      openPost,
      currentView,
      resetStore,
      openPostContextView,
    };
  },
  { persist: true },
);
