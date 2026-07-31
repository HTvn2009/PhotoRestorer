const themeButton = document.getElementById('themeToggle');
const uploadZone = document.getElementById('uploadZone');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const imageFileName = document.getElementById('imageFileName');
const imageFileDetails = document.getElementById('imageFileDetails');
const runButton = document.getElementById('runImage');
const retryButton = document.getElementById('retryImage');
const saveButton = document.getElementById('saveButton');
const restoredImage = document.getElementById('restoredImage');
const outputResult = document.getElementById('outputResult');
const outputPlaceholder = document.getElementById('outputPlaceholder');
const actionMessage = document.getElementById('actionMessage');
const status = document.getElementById('status');
const description = document.getElementById('description');
const imageName = document.getElementById('imageName');
const imageInfo = document.getElementById('imageInfo');
const descriptionReload = document.getElementById('descriptionReload');

let selectedFile = null;
let restoredUrl = null;
let isProcessing = false;

themeButton.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeButton.querySelector('span').textContent = isDark ? 'Sun' : 'Moon';
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
});

function formatFileSize(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(bytes < 100 * 1024 ? 1 : 0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function setStatus(message, processing = false) {
  status.querySelector('span').textContent = message;
  status.classList.toggle('processing', processing);
}

function clearResult() {
  if (restoredUrl) URL.revokeObjectURL(restoredUrl);
  restoredUrl = null;
  restoredImage.removeAttribute('src');
  outputResult.hidden = true;
  outputPlaceholder.hidden = false;
  retryButton.disabled = true;
  saveButton.disabled = true;
  description.value = '';
}

function showImage(file) {
  if (!file || !file.type.startsWith('image/')) return;

  if (file.size > 10 * 1024 * 1024) {
    actionMessage.textContent = 'Please choose an image smaller than 10 MB.';
    return;
  }

  selectedFile = file;
  clearResult();
  const imageUrl = URL.createObjectURL(file);

  previewImage.onload = () => {
    imageFileName.textContent = file.name;
    imageFileDetails.textContent = `${formatFileSize(file.size)} - ${previewImage.naturalWidth} x ${previewImage.naturalHeight}px`;
    imagePreview.hidden = false;
    uploadZone.querySelector('.upload-placeholder').hidden = true;
    actionMessage.textContent = 'Image is ready to restore.';
    setStatus('Ready');
    URL.revokeObjectURL(imageUrl);
  };

  previewImage.src = imageUrl;
}

async function restoreImage() {
  if (!selectedFile || isProcessing) {
    if (!selectedFile) actionMessage.textContent = 'Choose an image before restoring.';
    return;
  }

  isProcessing = true;
  clearResult();
  runButton.disabled = true;
  retryButton.disabled = true;
  runButton.textContent = 'Restoring...';
  actionMessage.textContent = 'AI is restoring the image.';
  setStatus('Processing', true);

  try {
    const response = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: await fileToDataUrl(selectedFile),
        fileName: selectedFile.name,
        title: [imageName.value.trim(), imageInfo.value.trim()].filter(Boolean).join(' - ')
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to restore the image.');

    const imageBytes = Uint8Array.from(atob(result.imageBase64), char => char.charCodeAt(0));
    restoredUrl = URL.createObjectURL(new Blob([imageBytes], { type: result.mimeType || 'image/png' }));
    restoredImage.src = restoredUrl;
    outputPlaceholder.hidden = true;
    outputResult.hidden = false;
    retryButton.disabled = false;
    saveButton.disabled = false;
    description.value = [
      'The image was restored with a focus on clarity, noise reduction, and balanced color.',
      'Only describe details that can be observed in the image.',
      'Origin, date, location, and related stories should be verified before publishing.'
    ].join('\n\n');
    actionMessage.textContent = 'Restore complete. You can save the image or retry.';
    setStatus('Complete');
  } catch (error) {
    actionMessage.textContent = error.message || 'Something went wrong while restoring the image.';
    setStatus('Error');
  } finally {
    isProcessing = false;
    runButton.disabled = false;
    runButton.textContent = 'Restore Image';
    if (restoredUrl) retryButton.disabled = false;
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function downloadResult() {
  if (!restoredUrl) return;
  const link = document.createElement('a');
  const fallbackName = selectedFile.name.replace(/\.[^.]+$/, '');
  link.href = restoredUrl;
  link.download = `${imageName.value.trim() || fallbackName}-restored.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

imageUpload.addEventListener('change', () => showImage(imageUpload.files[0]));
runButton.addEventListener('click', restoreImage);
retryButton.addEventListener('click', restoreImage);
saveButton.addEventListener('click', downloadResult);
descriptionReload.addEventListener('click', () => {
  if (restoredUrl) {
    description.value = 'Description reloaded. Verify origin, date, location, and related stories before publishing.';
  }
});

['dragenter', 'dragover'].forEach(name => uploadZone.addEventListener(name, event => {
  event.preventDefault();
  uploadZone.classList.add('dragging');
}));

['dragleave', 'drop'].forEach(name => uploadZone.addEventListener(name, event => {
  event.preventDefault();
  uploadZone.classList.remove('dragging');
}));

uploadZone.addEventListener('drop', event => showImage(event.dataTransfer.files[0]));
