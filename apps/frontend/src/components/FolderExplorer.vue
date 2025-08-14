<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import FolderNode from './FolderNode.vue'
import { PlusIcon } from '@heroicons/vue/24/solid'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3002'

type LiteNode = { id: string; name: string; hasChildren?: boolean }
type FileT    = { id: string; name: string }

const roots     = ref<LiteNode[]>([])
const selected  = ref<{ id: string; name: string; children?: LiteNode[] } | null>(null)
const files     = ref<FileT[]>([])
const nextFiles = ref<string | null>(null)
const loading   = ref(false)
const error     = ref<string | null>(null)

async function loadRoots() {
  loading.value = true; error.value = null
  try {
    const { data } = await axios.get<LiteNode[]>(`${API_BASE}/v1/folders/tree`)
    roots.value = data
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load roots'
  } finally { loading.value = false }
}

async function onSelect(id: string) {
  loading.value = true; error.value = null
  try {
    const { data } = await axios.get(`${API_BASE}/v1/folders/${id}`)
    selected.value = data
    const rf = await axios.get(`${API_BASE}/v1/folders/${id}/files`, { params: { limit: 20 } })
    files.value = rf.data.items
    nextFiles.value = rf.data.nextCursor
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to load selection'
  } finally { loading.value = false }
}

async function loadMoreFiles() {
  if (!selected.value || !nextFiles.value) return
  const { data } = await axios.get(`${API_BASE}/v1/folders/${selected.value.id}/files`, {
    params: { limit: 20, cursor: nextFiles.value }
  })
  files.value.push(...data.items)
  nextFiles.value = data.nextCursor
}

onMounted(loadRoots)

// Buat folder: root jika belum ada selection, child jika ada selection
async function createFolder() {
  const name = prompt('Folder name?')
  if (!name) return
  const parentId = selected.value?.id ?? null
  await axios.post(`${API_BASE}/v1/folders`, { name, parentId })
  await loadRoots()
  if (parentId) await onSelect(parentId)
}

// Dipanggil node setelah rename/delete agar refresh tree & panel kanan
async function afterChange(opts: { deletedId?: string; updatedId?: string }) {
  await loadRoots()
  if (opts.deletedId && selected.value?.id === opts.deletedId) {
    selected.value = null
    files.value = []
  } else if (selected.value) {
    await onSelect(selected.value.id)
  }
}
</script>

<template>
  <div class="explorer">
    <aside class="left">
      <div class="left-header">
        <h3>Folders</h3>
        <button class="add-btn" @click="createFolder" title="New folder">
          <PlusIcon class="icon" />
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-else-if="loading && roots.length === 0" class="muted">Loading…</div>

      <ul class="tree">
        <FolderNode
          v-for="n in roots"
          :key="n.id"
          :node="n"
          :onSelect="onSelect"
          :onRefresh="afterChange"
        />
      </ul>
    </aside>

    <main class="right">
      <div class="right-header">
        <h3>Subfolders</h3>
      </div>

      <div v-if="!selected" class="muted">Klik folder di kiri (dbl-click nama untuk rename, hover untuk ikon 🗑)</div>
      <ul v-else class="list">
        <li v-for="sub in selected.children ?? []" :key="sub.id">{{ sub.name }}</li>
      </ul>

      <h3 class="mt">Files</h3>
      <ul v-if="files.length" class="list">
        <li v-for="f in files" :key="f.id">{{ f.name }}</li>
      </ul>
      <div v-else class="muted">Tidak ada file</div>

      <div v-if="nextFiles" style="margin-top:8px">
        <button class="btn" @click="loadMoreFiles">Load more files…</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.explorer { display:grid; grid-template-columns:320px 1fr; gap:16px; min-height:100vh; padding:16px; }
.left { border-right:1px solid #eee; padding-right:16px; }
.tree, .list { list-style:none; padding:0; margin:8px 0 0 0; }

.left-header { display:flex; align-items:center; justify-content:space-between; }
.add-btn { background:none; border:none; cursor:pointer; padding:4px; }
.icon { width:20px; height:20px; color:#2563eb; }

.right-header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:8px; cursor:pointer; background:#fff; }
.btn:hover { background:#f5f5f5 }
.muted { color:#6b7280 }
.error { color:#ef4444 }
.mt { margin-top:16px }
</style>
