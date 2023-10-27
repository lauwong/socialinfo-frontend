<script setup lang="ts">
import router from "@/router";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import FollowButton from "../components/Follow/FollowButton.vue";
import UserPostListComponent from "../components/Post/UserPostListComponent.vue";

const route = useRoute();
const username = computed(() => route.query.username);
const loaded = ref(false);
const componentKey = ref(0);

onBeforeMount(async () => {
  await router.isReady();
  loaded.value = true;
});
</script>

<template>
  <main>
    <h1>{{ username }}</h1>
    <FollowButton v-if="loaded" :user="username" :key="componentKey" />
    <UserPostListComponent v-if="loaded" v-bind:user="username" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

#follow-button {
  display: flex;
  justify-content: center;
}
</style>
