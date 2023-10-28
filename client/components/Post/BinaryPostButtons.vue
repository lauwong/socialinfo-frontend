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
  <div id="toggle-group" role="group">
    <a :class="{ selected: mode === 'following' }" v-on:click="viewFollowing">Following</a>
    <a :class="{ selected: mode === 'all' }" v-on:click="viewAll">All</a>
  </div>
  <!-- <div class="pure-button-group" role="group">
    <button class="pure-button" :class="{ selected: mode === 'following' }" v-on:click="viewFollowing">Following</button>
    <button class="pure-button" :class="{ selected: mode === 'all' }" v-on:click="viewAll">All</button>
  </div> -->
</template>

<style scoped>
div#toggle-group {
  padding: 1em;
}

a {
  color: white;
  padding: 1em;
}

.selected {
  text-decoration: underline;
  color: var(--base-bg);
}
</style>
