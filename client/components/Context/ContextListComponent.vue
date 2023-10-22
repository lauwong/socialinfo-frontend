<script setup lang="ts">
import ContextComponent from "@/components/Context/ContextComponent.vue";
import CreateContextForm from "@/components/Context/CreateContextForm.vue";
import EditContextForm from "@/components/Context/EditContextForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

// const { openPost } = storeToRefs(useViewStore());

const props = defineProps(["postId"]);

const openPost = ref<Record<string, string>>();

const loaded = ref(false);
let contexts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
const postId = ref(props.postId);

async function getPost() {
  let postResult;
  try {
    postResult = await fetchy(`api/posts/${postId.value}`, "GET");
  } catch (_) {
    return;
  }
  openPost.value = postResult;
  return postResult;
}

async function getContexts() {
  if (!openPost.value) {
    throw new Error("Tried to open contexts for undefined post");
  }

  const parent = openPost.value._id;
  let query: Record<string, string> = { parent };
  let contextResults;
  try {
    contextResults = await fetchy("api/contexts", "GET", { query });
  } catch (_) {
    return;
  }
  contexts.value = contextResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getPost();
  await getContexts();
  loaded.value = true;
});
</script>

<template>
  <section>
    <PostComponent v-if="loaded" :post="openPost" />
  </section>
  <section v-if="isLoggedIn">
    <h2>Create a context:</h2>
    <CreateContextForm @refreshContexts="getContexts" :post="openPost" />
  </section>
  <div class="row">
    <h2>Contexts:</h2>
  </div>
  <section class="contexts" v-if="loaded && contexts.length !== 0">
    <article v-for="context in contexts" :key="context._id">
      <ContextComponent v-if="editing !== context._id" :context="context" @refreshContexts="getContexts" @editContext="updateEditing" />
      <EditContextForm v-else :context="context" @refreshContexts="getContexts" @editContext="updateEditing" />
    </article>
  </section>
  <p v-else-if="loaded">No contexts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.contexts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
