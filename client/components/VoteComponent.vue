<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, defineEmits, defineProps, onBeforeMount, ref } from "vue";

const props = defineProps(["itemId"]);

const emit = defineEmits(["voted"]);

const { isLoggedIn } = storeToRefs(useUserStore());

// Props are readonly. To be able to change the votes,
// we need to derive new reactive variables.
const upvotes = ref(0);
const userVoted = ref(false);
const loaded = ref(false);
const hover = ref(false);
const highlight = computed(() => userVoted.value || hover.value);

async function upvoteItem() {
  try {
    await fetchy(`api/upvotes/${props.itemId}`, "POST");
  } catch {
    return;
  }
}

async function retractItemUpvote() {
  try {
    await fetchy(`api/upvotes/${props.itemId}`, "DELETE");
  } catch {
    return;
  }
}

async function getUpvoteCount() {
  let upvoteCount;
  try {
    upvoteCount = await fetchy(`api/upvotes/count/${props.itemId}`, "GET");
  } catch (e) {
    console.log(e);
    return;
  }
  upvotes.value = upvoteCount.count;
}

async function checkVote() {
  let hasVoted;
  try {
    hasVoted = await fetchy(`api/upvotes/${props.itemId}`, "GET");
  } catch (_) {
    return;
  }
  userVoted.value = hasVoted.voted;
}

const toggleVote = async () => {
  if (userVoted.value === false) {
    await upvoteItem();
    userVoted.value = true;
    upvotes.value++;
  } else {
    await retractItemUpvote();
    userVoted.value = false;
    upvotes.value--;
  }
  emit("voted", upvotes.value);
};

const color = computed(() => {
  if (highlight.value) {
    return "rgb(208, 67, 12)";
  } else {
    return "black";
  }
});

const emoji = computed(() => {
  if (highlight.value) {
    return "♥";
  } else {
    return "♡";
  }
});

onBeforeMount(async () => {
  await checkVote();
  await getUpvoteCount();
  loaded.value = true;
});
</script>

<template>
  <p v-if="isLoggedIn">
    <button @mouseover="hover = true" @mouseleave="hover = false" @click="toggleVote" v-bind:style="{ color }">{{ emoji }} {{ upvotes }}</button>
  </p>
</template>

<style scoped>
button {
  background: transparent;
  /* border-radius: 1rem; */
  border: none;
  margin-right: 1rem;
  cursor: pointer;
}

/* button:hover {
  background: rgb(246, 246, 189);
} */
</style>
