if (typeof document === 'undefined') {
  console.warn('Skipping browser UI bootstrap because document is unavailable in this runtime.');
} else {
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
  const outputProgress = document.getElementById('outputProgress');
  const progressPercent = document.getElementById('progressPercent');
  const progressTitle = document.getElementById('progressTitle');
  const progressFill = document.getElementById('progressFill');
  const progressSteps = Array.from(document.querySelectorAll('#progressSteps li'));
  const status = document.getElementById('status');
  const description = document.getElementById('description');
  const imageName = document.getElementById('imageName');
  const imageContext = document.getElementById('imageContext');
  const descriptionReload = document.getElementById('descriptionReload');
  const analysisCard = document.getElementById('analysisCard');
  const analysisCategory = document.getElementById('analysisCategory');
  const analysisConfidence = document.getElementById('analysisConfidence');
  const analysisIdentification = document.getElementById('analysisIdentification');
  const analysisDescription = document.getElementById('analysisDescription');
  const observedDetails = document.getElementById('observedDetails');
  const originWrap = document.getElementById('originWrap');
  const originText = document.getElementById('originText');
  const buildPeriodWrap = document.getElementById('buildPeriodWrap');
  const buildPeriodText = document.getElementById('buildPeriodText');
  const purposeWrap = document.getElementById('purposeWrap');
  const purposeText = document.getElementById('purposeText');
  const significanceWrap = document.getElementById('significanceWrap');
  const significanceText = document.getElementById('significanceText');
  const historicalContextWrap = document.getElementById('historicalContextWrap');
  const historicalContext = document.getElementById('historicalContext');
  const sourceNote = document.getElementById('sourceNote');
  const tabButtons = Array.from(document.querySelectorAll('nav a[data-target]'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const helpQuestions = Array.from(document.querySelectorAll('.help-question'));

  let selectedFile = null;
  let restoredUrl = null;
  let isProcessing = false;
  let isDescribing = false;
  let restoreProgressTimer = null;
  let restoreProgressIndex = 0;

  const restoreSteps = [
    { percent: 8, title: 'Preparing image' },
    { percent: 20, title: 'Analyzing original image' },
    { percent: 38, title: 'Repairing visible damage' },
    { percent: 56, title: 'Recovering detail and sharpness' },
    { percent: 74, title: 'Colorizing naturally' },
    { percent: 88, title: 'Balancing tone and realism' },
    { percent: 94, title: 'Finalizing restored PNG' }
  ];

themeButton.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  document.body.classList.toggle('dark', !isLight);
  themeButton.querySelector('span').textContent = isLight ? '☀' : '☾';
  themeButton.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
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

function setOutputProgress(stepIndex) {
  if (!outputProgress) return;
  const step = restoreSteps[Math.min(stepIndex, restoreSteps.length - 1)];
  if (progressPercent) progressPercent.textContent = `${step.percent}%`;
  if (progressTitle) progressTitle.textContent = step.title;
  if (progressFill) progressFill.style.width = `${step.percent}%`;
  progressSteps.forEach((item, index) => {
    item.classList.toggle('done', index < stepIndex - 1);
    item.classList.toggle('active', index === Math.max(0, stepIndex - 1));
  });
}

function startOutputProgress() {
  window.clearInterval(restoreProgressTimer);
  restoreProgressIndex = 0;
  if (outputResult) outputResult.hidden = true;
  if (outputPlaceholder) outputPlaceholder.hidden = false;
  if (outputText) outputText.textContent = 'Following restoration steps...';
  if (outputProgress) outputProgress.hidden = false;
  setOutputProgress(restoreProgressIndex);
  restoreProgressTimer = window.setInterval(() => {
    if (restoreProgressIndex < restoreSteps.length - 1) {
      restoreProgressIndex += 1;
      setOutputProgress(restoreProgressIndex);
    }
  }, 2200);
}

function completeOutputProgress() {
  window.clearInterval(restoreProgressTimer);
  restoreProgressTimer = null;
  if (progressPercent) progressPercent.textContent = '100%';
  if (progressTitle) progressTitle.textContent = 'Restored and colorized';
  if (progressFill) progressFill.style.width = '100%';
  progressSteps.forEach(item => {
    item.classList.add('done');
    item.classList.remove('active');
  });
}

function stopOutputProgress() {
  window.clearInterval(restoreProgressTimer);
  restoreProgressTimer = null;
  if (outputProgress) outputProgress.hidden = true;
  if (progressFill) progressFill.style.width = '0%';
  progressSteps.forEach(item => {
    item.classList.remove('done');
    item.classList.remove('active');
  });
}

function clearResult() {
  stopOutputProgress();
  if (restoredUrl) URL.revokeObjectURL(restoredUrl);
  restoredUrl = null;
  if (restoredImage) restoredImage.removeAttribute('src');
  if (outputResult) outputResult.hidden = true;
  if (outputPlaceholder) outputPlaceholder.hidden = false;
  if (outputText) outputText.textContent = 'will appear here after processing';
  retryButton.disabled = true;
  saveButton.disabled = true;
  if (description) description.value = '';
  if (analysisCard) analysisCard.hidden = true;
}

function showImage(file) {
  if (!file || !file.type.startsWith('image/')) return;

  if (file.size > 3 * 1024 * 1024) {
    setStatus('Please choose a file smaller than 3 MB');
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
  setStatus('Repairing, enhancing, and colorizing image', true);
  startOutputProgress();

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
    completeOutputProgress();
    outputPlaceholder.hidden = true;
    if (outputProgress) outputProgress.hidden = true;
    outputText.textContent = 'Restored and colorized image ready';
    outputResult.hidden = false;
    retryButton.disabled = false;
    saveButton.disabled = false;
    setStatus('Restoration complete');
    await describeImage();
  } catch (error) {
    stopOutputProgress();
    setStatus(error.message || 'Restore failed');
    if (outputText) outputText.textContent = error.message || 'Unable to restore the image.';
  } finally {
    isProcessing = false;
    runButton.disabled = false;
    runButton.innerHTML = '<span>✦</span> Run restoration';
    if (restoredUrl) retryButton.disabled = false;
  }
}

function formatCategory(category) {
  return ({ historical: 'Historical image', cultural: 'Cultural content', artifact: 'Artifact / object', landmark: 'Landmark / architecture', people: 'People in image', general: 'General image' })[category] || 'Image content';
}

function renderAnalysis(analysis) {
  description.value = analysis.description || '';
  analysisCategory.textContent = formatCategory(analysis.category);
  analysisConfidence.textContent = `Confidence: ${{ low: 'low', medium: 'medium', high: 'high' }[analysis.identification.confidence] || 'unknown'}`;
  analysisIdentification.textContent = analysis.identification.candidate
    ? `${analysis.identification.candidate}. ${analysis.identification.reason}`
    : analysis.identification.reason;
  analysisDescription.textContent = analysis.description || 'No verified summary available.';
  observedDetails.replaceChildren(...(analysis.observedDetails || []).map(detail => {
    const item = document.createElement('li');
    item.textContent = detail;
    return item;
  }));
  originWrap.hidden = !analysis.origin;
  originText.textContent = analysis.origin || '';
  buildPeriodWrap.hidden = !analysis.buildPeriod;
  buildPeriodText.textContent = analysis.buildPeriod || '';
  purposeWrap.hidden = !analysis.purpose;
  purposeText.textContent = analysis.purpose || '';
  significanceWrap.hidden = !analysis.significance;
  significanceText.textContent = analysis.significance || '';
  historicalContextWrap.hidden = !analysis.historicalContext;
  historicalContext.textContent = analysis.historicalContext || '';
  sourceNote.textContent = analysis.sourceSearchRecommended
    ? 'Search museum, archive, or academic sources to verify this possible identification. No sources have been verified yet.'
    : 'This description does not assert origin, date, or related stories without supporting evidence.';
  analysisCard.hidden = false;
}

async function describeImage() {
  if (!selectedFile || isDescribing) return;
  isDescribing = true;
  descriptionReload.disabled = true;
  descriptionReload.innerHTML = '<span>✦</span> Analyzing...';
  if (description) description.value = 'Analyzing the image for historical and cultural context...';
  try {
    const response = await fetch('/api/describe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: await fileToDataUrl(selectedFile), title: imageName.value.trim(), context: imageContext.value.trim() })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to analyze the image.');
    renderAnalysis(result.analysis);
  } catch (error) {
    if (description) description.value = `Unable to create a description: ${error.message}`;
    setStatus('Image restored, but its description could not be analyzed');
  } finally {
    isDescribing = false;
    descriptionReload.disabled = false;
    descriptionReload.innerHTML = '<span>✦</span> Analyze again';
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
  describeImage();
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
}
