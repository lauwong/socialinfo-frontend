<script setup lang="ts">
import { onBeforeMount } from "vue";

const props = defineProps(["viewMode"]);
const emit = defineEmits(["setPostViewMode"]);

function viewFollowing() {
  emit("setPostViewMode", "following");
}

function viewAll() {
  emit("setPostViewMode", "all");
}

onBeforeMount(() => {
  emit("setPostViewMode", "following");
});
</script>

<template>
  <div id="toggle-group" role="group">
    <a :class="{ selected: props.viewMode === 'following' }" v-on:click="viewFollowing">Following</a>
    <a :class="{ selected: props.viewMode === 'all' }" v-on:click="viewAll">All</a>
  </div>
</template>

<style scoped>
div#toggle-group {
  padding: 1em;
}

a {
  color: white;
  padding: 1em;
  font-size: 1.2em;
}

.selected {
  text-decoration: underline;
  color: var(--base-bg);
}
</style>
