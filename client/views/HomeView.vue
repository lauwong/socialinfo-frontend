<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { defineProps, ref } from "vue";
import ContextListComponent from "../components/Context/ContextListComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["view"]);
const view = ref(props.view);

function handleOpenPostContexts(postId: string) {
  view.value = postId;
}
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <PostListComponent v-if="!view" @openCtx="handleOpenPostContexts" />
    <ContextListComponent v-else v-bind="view" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
