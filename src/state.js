/**
 * Application state management
 * Centralized state with subscription system for reactive UI updates
 */

export const state = {
  file: null,
  fileUrl: null,
  fileBlob: null, // cached Blob for PDF re-renders
  pdfDocument: null, // cached parsed PDF document
  previewCanvas: null, // for images
  previewCanvases: [], // for PDFs
  options: {
    text: 'Copy for identity verification only\n{date}',
    position: 'diagonal',
    opacity: 30,
    fontSize: 5,
    color: '#dc2626',
    rotation: -45,
  },
  subscribers: [],
};

/**
 * Subscribe to state changes
 * @param {(newState: typeof state) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribe(callback) {
  state.subscribers.push(callback);
  return () => {
    state.subscribers = state.subscribers.filter((sub) => sub !== callback);
  };
}

/**
 * Notify subscribers of state change
 */
function notify() {
  state.subscribers.forEach((cb) => {
    cb(state);
  });
}

/**
 * Update state options safely
 * @param {Partial<typeof state.options>} newOptions
 */
export function updateOptions(newOptions) {
  state.options = { ...state.options, ...newOptions };
  notify();
}

/**
 * Set file state
 * @param {File} file
 * @param {string} fileUrl
 * @param {Blob} fileBlob
 */
export function setFile(file, fileUrl, fileBlob) {
  state.file = file;
  state.fileUrl = fileUrl;
  state.fileBlob = fileBlob;
  notify();
}

/**
 * Clear file state
 */
export function clearFile() {
  if (state.fileUrl) {
    URL.revokeObjectURL(state.fileUrl);
  }
  if (state.pdfDocument) {
    state.pdfDocument.destroy();
    state.pdfDocument = null;
  }
  state.file = null;
  state.fileUrl = null;
  state.fileBlob = null;
  state.previewCanvas = null;
  state.previewCanvases = [];
  notify();
}
