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
const outputText = document.getElementById('outputText');
const status = document.getElementById('status');
const description = document.getElementById('description');
const imageName = document.getElementById('imageName');
const descriptionReload = document.getElementById('descriptionReload');
const tabButtons = Array.from(document.querySelectorAll('nav a[data-target]'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const helpQuestions = Array.from(document.querySelectorAll('.help-question'));

let selectedFile = null;
let restoredUrl = null;
let isProcessing = false;

themeButton.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  document.body.classList.toggle('dark', !isLight);
  themeButton.querySelector('span').textContent = isLight ? '☀' : '☾';
  themeButton.setAttribute('aria-label', isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng');
});

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 100 * 1024 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function setStatus(message, processing = false) {
  if (!status) return;
  status.innerHTML = `<i></i> ${message}`;
  status.classList.toggle('processing', processing);
}

function clearResult() {
  if (restoredUrl) URL.revokeObjectURL(restoredUrl);
  restoredUrl = null;
  if (restoredImage) restoredImage.removeAttribute('src');
  if (outputResult) outputResult.hidden = true;
  if (outputPlaceholder) outputPlaceholder.hidden = false;
  if (outputText) outputText.textContent = 'will appear here after processing';
  retryButton.disabled = true;
  saveButton.disabled = true;
  if (description) description.value = '';
}

function showImage(file) {
  if (!file || !file.type.startsWith('image/')) return;

  if (file.size > 10 * 1024 * 1024) {
    setStatus('Please choose a file smaller than 10 MB');
    return;
  }

  selectedFile = file;
  clearResult();
  const imageUrl = URL.createObjectURL(file);

  previewImage.onload = () => {
    imageFileName.textContent = file.name;
    imageFileDetails.textContent = `${formatFileSize(file.size)}  •  ${previewImage.naturalWidth} × ${previewImage.naturalHeight}px`;
    imagePreview.hidden = false;
    uploadZone.querySelector('.upload-placeholder').hidden = true;
    setStatus('Ready to create');
    URL.revokeObjectURL(imageUrl);
  };

  previewImage.src = imageUrl;
}

async function restoreImage() {
  if (!selectedFile || isProcessing) {
    if (!selectedFile) setStatus('Choose an image before restoring');
    return;
  }

  isProcessing = true;
  clearResult();
  runButton.disabled = true;
  retryButton.disabled = true;
  runButton.innerHTML = '<span>✦</span> Restoring...';
  setStatus('Restoring image', true);

  try {
    const response = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: await fileToDataUrl(selectedFile),
        fileName: selectedFile.name,
        title: imageName.value.trim()
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to restore the image.');

    const imageBytes = Uint8Array.from(atob(result.imageBase64), char => char.charCodeAt(0));
    restoredUrl = URL.createObjectURL(new Blob([imageBytes], { type: result.mimeType || 'image/png' }));
    restoredImage.src = restoredUrl;
    outputPlaceholder.hidden = true;
    outputText.textContent = 'Processed image ready';
    outputResult.hidden = false;
    retryButton.disabled = false;
    saveButton.disabled = false;
    description.value = [
      'The image was restored with a focus on clarity, noise reduction, and balanced color.',
      'Only describe details that can be observed in the image.',
      'Origin, date, location, and related stories should be verified before publishing.'
    ].join('\n\n');
    setStatus('Restoration complete');
  } catch (error) {
    setStatus(error.message || 'Restore failed');
    if (outputText) outputText.textContent = error.message || 'Unable to restore the image.';
  } finally {
    isProcessing = false;
    runButton.disabled = false;
    runButton.innerHTML = '<span>✦</span> Run restoration';
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

function activateTab(target) {
  const currentTarget = tabPanels.find(panel => !panel.hidden)?.dataset.panel || 'mainMenu';

  if (currentTarget === target) {
    return;
  }

  tabButtons.forEach(button => {
    const isCurrent = button.dataset.target === target;
    button.classList.toggle('active', isCurrent);
    if (isCurrent) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  tabPanels.forEach(panel => {
    panel.hidden = panel.dataset.panel !== target;
  });
}

function toggleHelpItem(button) {
  const item = button.closest('.help-item');
  const details = item.querySelector('.help-details');
  const isOpen = !details.hidden;

  details.hidden = isOpen;
  button.setAttribute('aria-expanded', String(!isOpen));
  const icon = button.querySelector('.help-icon');
  icon.textContent = isOpen ? '+' : '−';
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

['dragenter', 'dragover'].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.remove('dragging');
  });
});

uploadZone.addEventListener('drop', (event) => showImage(event.dataTransfer.files[0]));

tabButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    activateTab(button.dataset.target);
  });
});

helpQuestions.forEach(button => {
  button.addEventListener('click', () => toggleHelpItem(button));
});

activateTab('mainMenu');
