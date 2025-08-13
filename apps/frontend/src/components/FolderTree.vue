<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const folders = ref<any[]>([]);
const selected = ref<any>(null);

const fetchFolders = async () => {
  const { data } = await axios.get('http://localhost:3000/folders');
  folders.value = data;
};

const selectFolder = async (id: string) => {
  const { data } = await axios.get(`http://localhost:3000/folders/${id}`);
  selected.value = data;
};

onMounted(fetchFolders);
</script>

<template>
  <div class="explorer">
    <div class="left">
      <ul>
        <li v-for="folder in folders" :key="folder.id" @click="selectFolder(folder.id)">
          {{ folder.name }}
        </li>
      </ul>
    </div>
    <div class="right">
      <h3>Subfolders</h3>
      <ul>
        <li v-for="sub in selected?.children || []" :key="sub.id">{{ sub.name }}</li>
      </ul>
    </div>
  </div>
</template>
