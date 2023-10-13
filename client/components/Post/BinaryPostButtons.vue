<script setup lang="ts">
import { ref } from "vue";

const props = defineProps(["mode"]);
const emit = defineEmits(["setPostViewMode"]);

const mode = ref(props.mode);

function viewFollowing() {
  mode.value = "following";
  emit("setPostViewMode", mode.value);
}

function viewAll() {
  mode.value = "all";
  emit("setPostViewMode", mode.value);
}
</script>

<template>
  <button v-on:click="viewFollowing">Following</button>
  <button v-on:click="viewAll">All</button>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
