<script setup lang="ts">
import { ref } from "vue";
import { useViewStore } from "../../stores/view";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshContexts"]);
const { openedPost, resetStore } = useViewStore();

const post = ref(openedPost);

const createContext = async (content: string) => {
  if (!post.value) {
    throw new Error("Tried to create context for undefined post!");
  }
  const parent = post.value._id;

  try {
    await fetchy("api/contexts", "POST", {
      body: { parent, content },
    });
  } catch (_) {
    return;
  }
  emit("refreshContexts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createContext(content)">
    <label for="content">Context Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a context!" required> </textarea>
    <menu>
      <button type="submit" class="pure-button-primary pure-button">Create Context</button>
      <button class="btn-small pure-button" @click="resetStore()">Cancel</button>
    </menu>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
