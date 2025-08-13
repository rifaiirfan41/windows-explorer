<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3002'

type Folder = {
  id: string
  name: string
  children?: Folder[]
}

const folders = ref<Folder[]>([])
const selected = ref<Folder | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchFolders = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.get<Folder[]>(`${API_BASE}/folders`)
    folders.value = data
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load folders'
  } finally {
    loading.value = false
  }
}

const selectFolder = async (id: string) => {
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.get<Folder & { files?: any[] }>(`${API_BASE}/folders/${id}`)
    selected.value = data
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load folder detail'
  } finally {
    loading.value = false
  }
}

onMounted(fetchFolders)
</script>

<template>
  <div class="explorer">
    <aside class="left">
      <h3>Folders</h3>
      <div v-if="loading && folders.length === 0">Loading…</div>
      <div v-if="error">{{ error }}</div>
      <ul>
        <li
          v-for="f in folders"
          :key="f.id"
          @click="selectFolder(f.id)"
          class="folder-item"
        >
          {{ f.name }}
        </li>
      </ul>
    </aside>

    <main class="right">
      <h3>Subfolders</h3>
      <div v-if="!selected">Klik folder di kiri</div>
      <ul v-else>
        <li v-for="sub in selected.children ?? []" :key="sub.id">{{ sub.name }}</li>
      </ul>
    </main>
  </div>
</template>

<style scoped>
.explorer { display: grid; grid-template-columns: 280px 1fr; gap: 16px; min-height: 100vh; padding: 16px; }
.left { border-right: 1px solid #eee; }
.folder-item { cursor: pointer; padding: 6px 8px; border-radius: 6px; }
.folder-item:hover { background: #f5f5f5; }
.right ul, .left ul { list-style: none; padding: 0; margin: 0; }
</style>
