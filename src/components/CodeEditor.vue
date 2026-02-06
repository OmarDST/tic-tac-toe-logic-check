<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as monaco from "monaco-editor";

// Workers are needed for intellisense to work properly in Vite
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const editorContainer = ref(null);
let editorInstance = null;

onMounted(() => {
  editorInstance = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: "javascript",
    theme: "vs-dark",
    fontSize: 14,
    fontFamily: "'Fira Code', monospace",
    minimap: { enabled: false },
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastColumn: 0,
    renderLineHighlight: "all",
    matchBrackets: "always",
    lineHeight: 24,
    bracketPairColorization: { enabled: true },
  });

  // Set specific monaco theme styling to match our app
  monaco.editor.defineTheme("custom-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [{ background: "1e293b" }],
    colors: {
      "editor.background": "#1e293b", // var(--card-bg)
      "editor.lineHighlightBackground": "#33415530",
      "editorLineNumber.foreground": "#94a3b8",
    },
  });
  monaco.editor.setTheme("custom-dark");

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue();
    if (value !== props.modelValue) {
      emit("update:modelValue", value);
    }
  });
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorInstance && newValue !== editorInstance.getValue()) {
      editorInstance.setValue(newValue);
    }
  },
);

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
  }
});
</script>

<template>
  <div class="code-editor-wrapper">
    <div class="editor-header">
      <span class="file-name">solution.js</span>
      <span class="lang-tag">JavaScript + IntelliSense</span>
    </div>
    <div class="monaco-container" ref="editorContainer"></div>
  </div>
</template>

<style scoped>
.code-editor-wrapper {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease;
}

.code-editor-wrapper:focus-within {
  border-color: var(--accent);
}

.editor-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-family: var(--font-main);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.file-name::before {
  content: "JS";
  font-size: 10px;
  font-weight: 900;
  color: #1e293b;
  background: #facc15;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lang-tag {
  font-size: 0.75rem;
  opacity: 0.7;
}

.monaco-container {
  flex: 1;
  width: 100%;
  height: 0; /* Important for flex child to scroll properly */
  min-height: 300px;
}
</style>
