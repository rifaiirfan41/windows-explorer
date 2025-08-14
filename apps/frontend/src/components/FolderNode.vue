<script setup lang="ts">
import { ref, nextTick } from 'vue'
import axios from 'axios'
import { TrashIcon } from '@heroicons/vue/24/solid'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3002'

type LiteNode = { id: string; name: string; hasChildren?: boolean }
type ChildResp = { items: LiteNode[]; nextCursor: string | null }

const props = defineProps<{
  node: LiteNode
  onSelect: (id: string) => void
  onRefresh: (opts: { deletedId?: string; updatedId?: string }) => Promise<void> | void
}>()

const open = ref(false)
const loading = ref(false)
const children = ref<LiteNode[] | null>(null) // null = belum pernah load
const nextCursor = ref<string | null>(null)

// Inline rename state
const editing = ref(false)
const editName = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

async function loadChildren(cursor?: string) {
  loading.value = true
  try {
    const { data } = await axios.get<ChildResp>(`${API_BASE}/v1/folders/${props.node.id}/children`, {
      params: { limit: 20, cursor }
    })
    if (!children.value) children.value = []
    children.value.push(...data.items)
    nextCursor.value = data.nextCursor
  } finally { loading.value = false }
}

async function toggle() {
  if (!props.node.hasChildren) { open.value = !open.value; return }
  if (!open.value) {
    if (children.value === null) await loadChildren()
    open.value = true
  } else {
    open.value = false
  }
}

// Rename inline
function startEdit() {
  editing.value = true
  editName.value = props.node.name
  nextTick(() => inputEl.value?.focus())
}

async function commitEdit() {
  const newName = editName.value.trim()
  if (!newName || newName === props.node.name) { editing.value = false; return }
  await axios.patch(`${API_BASE}/v1/folders/${props.node.id}`, { name: newName })
  editing.value = false
  await props.onRefresh({ updatedId: props.node.id })
}

function cancelEdit() {
  editing.value = false
}

// Delete
async function deleteNode(e?: MouseEvent) {
  if (e) e.stopPropagation()
  if (!confirm(`Delete "${props.node.name}" ?`)) return
  await axios.delete(`${API_BASE}/v1/folders/${props.node.id}`)
  await props.onRefresh({ deletedId: props.node.id })
}
</script>

<template>
  <li>
    <div class="node-row" @click="toggle">
      <span class="caret">
        <template v-if="node.hasChildren">{{ open ? '▼' : '▶' }}</template>
        <template v-else>•</template>
      </span>

      <!-- Nama / editor inline -->
      <span
        v-if="!editing"
        class="name"
        @dblclick.stop="startEdit"
        @click.stop="onSelect(node.id)"
      >
        {{ node.name }}
      </span>
      <input
        v-else
        ref="inputEl"
        class="edit"
        v-model="editName"
        @keyup.enter.stop="commitEdit"
        @keyup.esc.stop="cancelEdit"
        @blur="cancelEdit"
        @click.stop
      />

      <!-- Ikon trash hanya saat hover -->
      <button class="trash" title="Delete" @click.stop="deleteNode">
        <TrashIcon class="trash-ic" />
      </button>
    </div>

    <ul v-if="open">
      <li v-if="loading" class="muted">Loading…</li>
      <FolderNode
        v-for="child in (children ?? [])"
        :key="child.id"
        :node="child"
        :onSelect="onSelect"
        :onRefresh="onRefresh"
      />
      <li v-if="nextCursor && !loading">
        <button class="loadmore" @click.stop="loadChildren(nextCursor)">Load more…</button>
      </li>
    </ul>
  </li>
</template>

<style scoped>
.node-row{
  display:flex; align-items:center; gap:6px; cursor:pointer;
  padding:2px 6px; border-radius:6px; position:relative;
}
.node-row:hover{ background:#f5f5f5 }
.caret{ width:16px; text-align:center; flex:0 0 16px; }
.name{ cursor:pointer; user-select:none; }

.edit{
  border:1px solid #cbd5e1; border-radius:6px; padding:2px 6px;
  font: inherit; width: 70%;
}

.trash{
  margin-left:auto;
  opacity:0; /* hidden by default */
  background:none; border:none; cursor:pointer; padding:2px;
}
.node-row:hover .trash{ opacity:1; } /* show on hover */
.trash-ic{ width:16px; height:16px; color:#ef4444; }
.trash:hover .trash-ic{ filter: brightness(0.9); }

ul{ list-style:none; margin:4px 0 4px 16px; padding:0 }
.muted{ color:#6b7280 }
.loadmore{ padding:4px 8px; border:1px solid #ddd; border-radius:8px; background:#fff; cursor:pointer }
.loadmore:hover{ background:#f5f5f5 }
</style>
