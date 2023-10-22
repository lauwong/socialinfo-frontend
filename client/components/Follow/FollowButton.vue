<script setup lang="ts">
import { fetchy } from "../../utils/fetchy";
import { ref, onBeforeMount } from "vue";

const props = defineProps(["user"]);
const username = ref(props.user);
const isFollowing = ref(false);

const followUser = async () => {
  try {
    await fetchy(`api/follows/${username.value}`, "POST");
    isFollowing.value = true;
  } catch {
    return;
  }
};

const unfollowUser = async () => {
  try {
    await fetchy(`api/follows/${username.value}`, "DELETE");
    isFollowing.value = false;
  } catch {
    return;
  }
};

async function checkFollowing() {
  let hasFollowed;
  try {
    hasFollowed = await fetchy(`api/follows/following/${username.value}`, "GET");
  } catch (_) {
    return;
  }
  isFollowing.value = hasFollowed.value;
}

onBeforeMount(async () => {
  await checkFollowing();
});
</script>

<template>
  <div id="follow-button">
    <button v-if="!isFollowing" class="pure-button" id="follow" @click="followUser">Follow</button>
    <button v-else class="pure-button" id="follow" @click="unfollowUser">Unfollow</button>
  </div>
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
