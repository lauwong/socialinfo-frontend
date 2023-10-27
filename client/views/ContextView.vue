<script setup lang="ts">
import router from "@/router";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import ContextListComponent from "../components/Context/ContextListComponent.vue";

const route = useRoute();

const postId = ref();
const loaded = ref(false);

onBeforeMount(async () => {
  await router.isReady();
  postId.value = route.query.id;
  loaded.value = true;
});
</script>

<template>
  <main>
    <ContextListComponent v-if="loaded" :post-id="postId" />
  </main>
</template>

<style scoped>
main {
  padding: 1em;
}
</style>
