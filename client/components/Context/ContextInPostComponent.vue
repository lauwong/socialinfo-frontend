<script setup lang="ts">
import router from "../../router";

const props = defineProps(["context"]);
const emit = defineEmits(["refreshContexts"]);

async function openUser() {
  if (props.context.author !== "Autogenerated") {
    await router.push({ path: "/user", query: { username: props.context.author } });
    router.go(0);
  }
}
</script>

<template>
  <p @click="openUser" class="author">{{ props.context.author }}</p>
  <p>{{ props.context.content }}</p>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1em;
}
</style>
