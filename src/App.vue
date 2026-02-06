<script setup>
import { ref, onMounted } from "vue";
import TicTacToeBoard from "./components/TicTacToeBoard.vue";
import CodeEditor from "./components/CodeEditor.vue";

const board = ref(new Array(9).fill(null));
const result = ref(null);
const executionTime = ref(null);
const error = ref(null);

const defaultCode = `// Input: board (Array of 9 items: 'X', 'O', or null)
// Output: Return 'X', 'O', or null if no winner

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Your logic here...
return null;
`;

const userCode = ref(defaultCode);

const batchResults = ref(null);
const showStatsModal = ref(false);

function createRandomBoard() {
  const newBoard = new Array(9).fill(null);
  let xTurn = true;
  // Fill roughly 5-8 cells
  const turns = Math.floor(Math.random() * 4) + 5;

  // Create a randomized order of indices to fill
  const indices = Array.from({ length: 9 }, (_, i) => i).sort(
    () => Math.random() - 0.5,
  );

  for (let i = 0; i < turns; i++) {
    newBoard[indices[i]] = xTurn ? "X" : "O";
    xTurn = !xTurn;
  }
  return newBoard;
}

function generateRandomBoard() {
  board.value = createRandomBoard();
  resetResult();
}

function resetResult() {
  result.value = null;
  executionTime.value = null;
  error.value = null;
}

// Hidden implementation to check the winner
function checkWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function runCode() {
  resetResult();

  try {
    // Create a function from the user code
    // We wrap it to ensure it has access to 'board'
    const userFunction = new Function("board", userCode.value);

    // Verify logic
    const expectedWinner = checkWinner(board.value);

    // Execute user code
    const start = performance.now();
    const actualWinner = userFunction(board.value);
    const end = performance.now();

    executionTime.value = (end - start).toFixed(4);

    // Compare results
    const isCorrect = actualWinner === expectedWinner;

    if (isCorrect) {
      result.value =
        actualWinner === null
          ? "Correct: No Winner"
          : `Correct: Winner is ${actualWinner}`;
    } else {
      result.value = `Incorrect. Expected: ${expectedWinner || "null"}, Got: ${actualWinner || "null"}`;
    }
  } catch (e) {
    error.value = e.message;
  }
}

function runBatchTests() {
  resetResult();
  const totalTests = 50;
  let passed = 0;
  let failed = 0;
  let errors = 0;

  try {
    const userFunction = new Function("board", userCode.value);

    const start = performance.now();
    for (let i = 0; i < totalTests; i++) {
      const testBoard = createRandomBoard();
      const expected = checkWinner(testBoard);

      try {
        const actual = userFunction(testBoard);
        if (actual === expected) {
          passed++;
        } else {
          failed++;
        }
      } catch (e) {
        errors++;
      }
    }
    const end = performance.now();

    executionTime.value = (end - start).toFixed(4); // Total time for batch

    batchResults.value = {
      total: totalTests,
      passed,
      failed,
      errors,
      chars: userCode.value.length,
      avgTime: ((end - start) / totalTests).toFixed(4),
      ops: Math.round(totalTests / ((end - start) / 1000)),
    };
    showStatsModal.value = true;
  } catch (e) {
    error.value = "Syntax Error: " + e.message;
  }
}

onMounted(() => {
  generateRandomBoard();
});
</script>

<template>
  <div class="container fade-in">
    <header>
      <h1>Logic Check</h1>
      <p>Implement the logic to find the winner.</p>
    </header>

    <main>
      <div class="left-panel">
        <TicTacToeBoard :board="board" />
        <button class="action-btn secondary" @click="generateRandomBoard">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
          Shuffle Board
        </button>
      </div>

      <div class="right-panel">
        <CodeEditor v-model="userCode" />

        <div class="controls">
          <div class="controls-header">
            <div class="status">
              <div v-if="executionTime" class="metric success">
                <span class="label">Time:</span>
                <span class="value">{{ executionTime }}ms</span>
              </div>
              <div v-if="result" class="metric result-display">
                <span class="value">{{ result }}</span>
              </div>

              <div v-if="error" class="metric error">
                <span class="value">{{ error }}</span>
              </div>
              <div class="btn-group">
                <button
                  class="action-btn secondary"
                  @click="runBatchTests"
                  title="Run against 50 random boards"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                  </svg>
                  Batch Test
                </button>
                <button class="action-btn primary" @click="runCode">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Execute Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Results Modal -->
    <div
      class="modal-backdrop"
      v-if="showStatsModal && batchResults"
      @click="showStatsModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Competition Results</h2>
          <button class="close-btn" @click="showStatsModal = false">×</button>
        </div>

        <div class="stats-grid-modal">
          <div
            class="stat-card large"
            :class="{
              success: batchResults.passed === batchResults.total,
              error: batchResults.passed !== batchResults.total,
            }"
          >
            <span class="stat-label">Accuracy</span>
            <span class="stat-value"
              >{{
                Math.round((batchResults.passed / batchResults.total) * 100)
              }}%</span
            >
            <div class="stat-sub">
              {{ batchResults.passed }}/{{ batchResults.total }} Passed
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-label">Avg Time</span>
            <span class="stat-value">{{ batchResults.avgTime }}ms</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Throughput</span>
            <span class="stat-value"
              >{{ batchResults.ops.toLocaleString() }} ops/s</span
            >
          </div>
          <div class="stat-card">
            <span class="stat-label">Code Size</span>
            <span class="stat-value">{{ batchResults.chars }} chars</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

header {
  text-align: center;
  margin-bottom: 1rem;
}

header h1 {
  font-size: 2.5rem;
  background: linear-gradient(to right, var(--accent), var(--success));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
}

header p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

main {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 3rem;
  align-items: start;
}

/* Left Panel */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

/* Right Panel */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0; /* Prevent flex box overflow issues */
}

.btn-group {
  display: flex;
  gap: 1rem;
}

/* Controls */
.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  /* Ensure controls don't take up too much vertical space */
  flex-shrink: 0;
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 350px; /* Match board width */
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid transparent;
}

.stat-card.success {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.2);
  color: var(--success);
}

.stat-card.error {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.2);
  color: var(--error);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-card.success .stat-label,
.stat-card.error .stat-label {
  color: currentColor;
  opacity: 0.8;
}

.stat-value {
  font-family: var(--font-code);
  font-weight: 600;
  font-size: 1.1rem;
}

.status {
  display: flex;
  gap: 1rem;
  font-family: var(--font-code);
  font-size: 0.9rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.metric.success {
  color: var(--success);
}
.metric.error {
  color: var(--error);
}
.metric.result-display {
  color: var(--accent);
  font-weight: 600;
}

/* Buttons */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 1.2em;
  height: 1.2em;
}

.action-btn.primary {
  background: var(--accent);
  color: #0f172a;
}

.action-btn.primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.4);
}

.action-btn.secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 100%;
}

.action-btn.secondary:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform-origin: center;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  background: linear-gradient(to right, var(--accent), var(--success));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  font-size: 2rem;
  line-height: 1;
  color: var(--text-secondary);
  padding: 0.25rem;
}

.close-btn:hover {
  color: var(--text-primary);
}

.stats-grid-modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card.large {
  grid-column: span 2;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
}

.stat-card.large .stat-value {
  font-size: 2.5rem;
  margin: 0.5rem 0;
}

.stat-sub {
  font-size: 0.9rem;
  opacity: 0.8;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 800px) {
  main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
