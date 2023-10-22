<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import UserPostListComponent from "../components/Post/UserPostListComponent.vue";
import router from "../router";

const route = useRoute();
const username = ref();
const loaded = ref(false);

onBeforeMount(async () => {
  await router.isReady();
  username.value = route.query.username;
  loaded.value = true;
});
</script>

<template>
  <main>
    <h1>{{ username }}</h1>
    <div id="follow-button">
      <button class="pure-button" id="follow">Follow</button>
    </div>
    <UserPostListComponent v-if="loaded" v-bind:user="username" :name="'Hello'" />
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
