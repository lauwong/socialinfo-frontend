<script setup lang="ts">
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import ContextListComponent from "../components/Context/ContextListComponent.vue";
import { useViewStore } from "../stores/view";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const { currentView } = storeToRefs(useViewStore());
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <PostListComponent v-if="currentView === 'post'" />
    <ContextListComponent v-else />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
