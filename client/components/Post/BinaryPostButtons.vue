<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["setPostViewMode"]);

const mode = ref("following");

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
  <div class="pure-button-group" role="group">
    <button class="pure-button" :class="{ selected: mode === 'following' }" v-on:click="viewFollowing">Following</button>
    <button class="pure-button" :class="{ selected: mode === 'all' }" v-on:click="viewAll">All</button>
  </div>
</template>

<style scoped>
div.pure-button-group {
  padding: 2em;
}

.selected {
  background: #0078e7;
  color: var(--base-bg);
}
</style>
