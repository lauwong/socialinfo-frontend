<script setup lang="ts">
import { ref } from "vue";
import router from "../../router";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshContexts"]);

const props = defineProps(["post"]);

const createContext = async (content: string) => {
  if (!props.post) {
    throw new Error("Tried to create context for undefined post!");
  }
  const parent = props.post._id;

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

const returnHome = () => {
  void router.push({ path: "/" });
};
</script>

<template>
  <form @submit.prevent="createContext(content)">
    <label for="content">Context Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a context!" required> </textarea>
    <div class="container">
      <button class="pure-button" @click="returnHome">Cancel</button>
      <button type="submit" class="button-error pure-button">Create Context</button>
    </div>
  </form>
</template>

<style scoped>
form {
  border-color: black;
  border-width: 0.2em;
  border-style: solid;
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
  resize: none;
}

.container {
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

button {
  flex: 1 0 auto;
}
</style>
