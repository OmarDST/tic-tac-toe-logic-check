<script setup>
defineProps({
  board: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="board">
    <div
      v-for="(cell, index) in board"
      :key="index"
      class="cell"
      :class="{
        x: cell === 'X',
        o: cell === 'O',
        empty: !cell,
      }"
    >
      <span v-if="cell">{{ cell }}</span>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1;
  margin: 0 auto;
}

.cell {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  user-select: none;
}

.cell:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.3);
  border-color: var(--text-secondary);
}

.x {
  color: var(--accent);
  text-shadow: 0 0 25px rgba(56, 189, 248, 0.5);
}

.o {
  color: var(--success);
  text-shadow: 0 0 25px rgba(74, 222, 128, 0.5);
}

@media (max-width: 768px) {
  .cell {
    font-size: 2.5rem;
    border-radius: 12px;
  }
}
</style>
