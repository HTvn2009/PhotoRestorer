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
  const formattedDescription = document.getElementById('formattedDescription');
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
  const savedList = document.getElementById('savedList');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const savedDetail = document.getElementById('savedDetail');
  const savedDetailName = document.getElementById('savedDetailName');
  const savedDetailDate = document.getElementById('savedDetailDate');
  const savedBeforeImage = document.getElementById('savedBeforeImage');
  const savedAfterImage = document.getElementById('savedAfterImage');
  const savedDetailDescription = document.getElementById('savedDetailDescription');
  const closeSavedDetail = document.getElementById('closeSavedDetail');
  const shareSavedProject = document.getElementById('shareSavedProject');
  const shareLinkRow = document.getElementById('shareLinkRow');
  const shareLink = document.getElementById('shareLink');
  const copyShareLink = document.getElementById('copyShareLink');
  const tabButtons = Array.from(document.querySelectorAll('nav a[data-target]'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const helpQuestions = Array.from(document.querySelectorAll('.help-question'));

  let selectedFile = null;
  let selectedOriginalDataUrl = null;
  let restoredUrl = null;
  let restoredDataUrl = null;
  let activeSavedId = null;
  let isProcessing = false;
  let isDescribing = false;
  let restoreProgressTimer = null;
  let restoreProgressIndex = 0;
  const galleryDbName = 'picresGallery';
  const galleryStoreName = 'savedImages';

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
  restoredDataUrl = null;
  if (restoredImage) restoredImage.removeAttribute('src');
  if (outputResult) outputResult.hidden = true;
  if (outputPlaceholder) outputPlaceholder.hidden = false;
  if (outputText) outputText.textContent = 'will appear here after processing';
  retryButton.disabled = true;
  saveButton.disabled = true;
  if (description) description.value = '';
  if (description) description.readOnly = true;
  if (analysisCard) analysisCard.hidden = true;
}

function showImage(file) {
  if (!file || !file.type.startsWith('image/')) return;

  if (file.size > 3 * 1024 * 1024) {
    setStatus('Please choose a file smaller than 3 MB');
    return;
  }

  selectedFile = file;
  selectedOriginalDataUrl = null;
  clearResult();
  const imageUrl = URL.createObjectURL(file);
  fileToDataUrl(file).then((dataUrl) => {
    if (selectedFile === file) selectedOriginalDataUrl = dataUrl;
  }).catch(() => {
    if (selectedFile === file) selectedOriginalDataUrl = null;
  });

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
    const restoredMimeType = result.mimeType || 'image/png';
    restoredDataUrl = `data:${restoredMimeType};base64,${result.imageBase64}`;
    restoredUrl = URL.createObjectURL(new Blob([imageBytes], { type: restoredMimeType }));
    restoredImage.src = restoredUrl;
    completeOutputProgress();
    outputPlaceholder.hidden = true;
    if (outputProgress) outputProgress.hidden = true;
    outputText.textContent = 'Restored and colorized image ready';
    outputResult.hidden = false;
    retryButton.disabled = false;
    setStatus('Restoration complete');
    await describeImage();
    saveButton.disabled = false;
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
  description.readOnly = false;
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
  // Build and display a formatted HTML fragment using Times New Roman per user's request
  try {
    if (formattedDescription) {
      formattedDescription.innerHTML = buildFormattedDescription(analysis);
      formattedDescription.hidden = false;
    }
  } catch (e) {
    // Fail silently if formatting cannot be produced
    console.error('Formatted description error:', e);
  }
}

function escapeHtml(input) {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildFormattedDescription(analysis) {
  const titleText = (analysis?.identification?.candidate) || imageName?.value?.trim() || 'Image description';
  const lines = [];

  // Primary summary line
  if (analysis?.description) lines.push(analysis.description);

  // Observed details each as its own line
  if (Array.isArray(analysis?.observedDetails) && analysis.observedDetails.length) {
    for (const detail of analysis.observedDetails) lines.push(detail);
  }

  // Identification reason
  if (analysis?.identification?.reason) lines.push(`Identification: ${analysis.identification.reason}`);

  // Warnings
  if (Array.isArray(analysis?.warnings) && analysis.warnings.length) {
    for (const w of analysis.warnings) lines.push(`Warning: ${w}`);
  }

  // Human check suggestion
  if (analysis?.humanCheck) lines.push('Human verification recommended.');

  // Build HTML fragment with inline Times New Roman styles
  const bodyLines = (lines.length ? lines : ['No visual description available']).map(l => `<div>- ${escapeHtml(l)}</div>`).join('\n  ');

  return `<div class="title" style="font-family: 'Times New Roman', serif; font-size: 15pt; font-weight: 700;">${escapeHtml(titleText)}</div>\n<div class="body" style="font-family: 'Times New Roman', serif; font-size: 11pt;">\n  ${bodyLines}\n</div>`;
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
    if (description) description.readOnly = false;
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

function formatSavedDate(savedAt) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(savedAt));
  } catch (error) {
    return '';
  }
}

function openGalleryDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is unavailable in this browser.'));
      return;
    }

    const request = window.indexedDB.open(galleryDbName, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(galleryStoreName)) {
        database.createObjectStore(galleryStoreName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function runGalleryStore(mode, handler) {
  const database = await openGalleryDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(galleryStoreName, mode);
    const store = transaction.objectStore(galleryStoreName);
    const request = handler(store);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function readSavedGallery() {
  try {
    const items = await runGalleryStore('readonly', store => store.getAll());
    return items.sort((first, second) => {
      if (Boolean(first.favorite) !== Boolean(second.favorite)) return first.favorite ? -1 : 1;
      return new Date(second.savedAt) - new Date(first.savedAt);
    });
  } catch (error) {
    return [];
  }
}

async function addSavedGalleryItem(item) {
  await runGalleryStore('readwrite', store => store.put(item));
}

async function deleteSavedGalleryItem(id) {
  await runGalleryStore('readwrite', store => store.delete(id));
}

function closeGalleryDetail() {
  activeSavedId = null;
  if (savedDetail) savedDetail.hidden = true;
  if (shareLinkRow) shareLinkRow.hidden = true;
  if (shareLink) shareLink.value = '';
  if (savedList) {
    savedList.querySelectorAll('.saved-list-item').forEach(item => item.classList.remove('active'));
  }
}

function openGalleryDetail(item) {
  if (!savedDetail || !item) return;
  activeSavedId = item.id;
  savedDetail.dataset.savedId = item.id;
  savedDetailName.textContent = item.name;
  savedDetailDate.textContent = formatSavedDate(item.savedAt);
  savedBeforeImage.src = item.beforeImage;
  savedAfterImage.src = item.afterImage;
  savedDetailDescription.textContent = item.description || 'No description saved.';
  if (shareLinkRow) shareLinkRow.hidden = !item.shareUrl;
  if (shareLink) shareLink.value = item.shareUrl || '';
  savedDetail.hidden = false;
  savedList.querySelectorAll('.saved-list-item').forEach(button => {
    button.classList.toggle('active', button.dataset.savedId === item.id);
  });
}

async function renderSavedGallery() {
  if (!savedList || !galleryEmpty) return;
  const items = await readSavedGallery();
  galleryEmpty.hidden = items.length > 0;
  savedList.replaceChildren(...items.map(item => {
    const row = document.createElement('div');
    row.className = 'saved-list-item';
    row.dataset.savedId = item.id;
    row.classList.toggle('active', item.id === activeSavedId);

    const nameButton = document.createElement('button');
    nameButton.className = 'saved-name-button';
    nameButton.type = 'button';
    nameButton.textContent = item.name;
    nameButton.addEventListener('click', () => {
      if (activeSavedId === item.id) {
        closeGalleryDetail();
      } else {
        openGalleryDetail(item);
      }
    });

    const actions = document.createElement('div');
    actions.className = 'saved-row-actions';
    actions.append(
      createSavedActionButton(item.favorite ? '★' : '☆', item.favorite ? 'Remove favorite' : 'Add favorite', () => toggleFavorite(item)),
      createSavedActionButton('✎', 'Rename project', () => renameSavedProject(item)),
      createSavedActionButton('↗', 'Share project', () => createShareLink(item)),
      createSavedActionButton('×', 'Delete project', () => removeSavedProject(item))
    );

    row.append(nameButton, actions);
    return row;
  }));

  if (activeSavedId) {
    const activeItem = items.find(item => item.id === activeSavedId);
    if (activeItem) {
      openGalleryDetail(activeItem);
    } else {
      closeGalleryDetail();
    }
  }
}

async function saveToGallery() {
  if (!selectedFile || !restoredDataUrl) return;
  const fallbackName = selectedFile.name.replace(/\.[^.]+$/, '') || 'Restored image';
  const originalImage = selectedOriginalDataUrl || await fileToDataUrl(selectedFile);
  const item = {
    id: `saved-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: imageName.value.trim() || fallbackName,
    description: description.value.trim(),
    beforeImage: originalImage,
    afterImage: restoredDataUrl,
    savedAt: new Date().toISOString()
  };

  try {
    await addSavedGalleryItem(item);
    activeSavedId = item.id;
    await renderSavedGallery();
    activateTab('gallery');
    openGalleryDetail(item);
    setStatus('Saved to My Gallery');
  } catch (error) {
    setStatus('Unable to save. Browser storage may be full.');
  }
}

async function updateSavedGalleryItem(item) {
  await runGalleryStore('readwrite', store => store.put(item));
}

function createSavedActionButton(label, title, onClick) {
  const button = document.createElement('button');
  button.className = 'icon-button small saved-action-button';
  button.type = 'button';
  button.textContent = label;
  button.title = title;
  button.setAttribute('aria-label', title);
  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    await onClick();
  });
  return button;
}

async function toggleFavorite(item) {
  item.favorite = !item.favorite;
  await updateSavedGalleryItem(item);
  await renderSavedGallery();
  if (activeSavedId === item.id) openGalleryDetail(item);
}

async function renameSavedProject(item) {
  const nextName = window.prompt('Rename saved project', item.name);
  if (nextName === null) return;
  const trimmedName = nextName.trim();
  if (!trimmedName) {
    setStatus('Project name cannot be empty');
    return;
  }

  item.name = trimmedName.slice(0, 120);
  await updateSavedGalleryItem(item);
  await renderSavedGallery();
  if (activeSavedId === item.id) openGalleryDetail(item);
  setStatus('Project renamed');
}

async function removeSavedProject(item) {
  const shouldDelete = window.confirm(`Delete "${item.name}" from My Gallery?`);
  if (!shouldDelete) return;

  await deleteSavedGalleryItem(item.id);
  if (activeSavedId === item.id) closeGalleryDetail();
  await renderSavedGallery();
  setStatus('Project deleted');
}

async function getActiveSavedItem() {
  if (!activeSavedId) return null;
  const items = await readSavedGallery();
  return items.find(item => item.id === activeSavedId) || null;
}

async function createShareLink(sourceItem) {
  const item = sourceItem || await getActiveSavedItem();
  if (!item || !shareSavedProject) return;

  if (!sourceItem) {
    shareSavedProject.disabled = true;
    shareSavedProject.innerHTML = '<span>↗</span> Sharing...';
  }

  try {
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        description: item.description,
        beforeImage: item.beforeImage,
        afterImage: item.afterImage,
        savedAt: item.savedAt
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to create share link.');

    const absoluteUrl = new URL(result.url, window.location.origin).href;
    item.shareUrl = absoluteUrl;
    await updateSavedGalleryItem(item);
    await renderSavedGallery();
    openGalleryDetail(item);
    await copyText(absoluteUrl);
    setStatus('Share link copied');
  } catch (error) {
    setStatus(error.message || 'Unable to create share link.');
  } finally {
    if (!sourceItem) {
      shareSavedProject.disabled = false;
      shareSavedProject.innerHTML = '<span>↗</span> Share';
    }
  }
}

async function copyText(text) {
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  shareLink.focus();
  shareLink.select();
  document.execCommand('copy');
}

async function copyCurrentShareLink() {
  if (!shareLink?.value) return;
  try {
    await copyText(shareLink.value);
    setStatus('Share link copied');
  } catch (error) {
    setStatus('Copy failed. Select the link and copy it manually.');
  }
}

async function loadSharedProjectFromUrl() {
  const match = /^\/share\/([^/]+)$/.exec(window.location.pathname);
  if (!match) return false;

  try {
    const response = await fetch(`/api/share?id=${encodeURIComponent(match[1])}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to load shared project.');
    activeSavedId = result.item.id;
    galleryEmpty.hidden = true;
    savedList.replaceChildren();
    openGalleryDetail(result.item);
    activateTab('gallery');
    setStatus('Viewing shared project');
    return true;
  } catch (error) {
    activateTab('gallery');
    galleryEmpty.hidden = false;
    galleryEmpty.textContent = error.message || 'Shared project was not found.';
    closeGalleryDetail();
    return true;
  }
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
saveButton.addEventListener('click', saveToGallery);
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

closeSavedDetail.addEventListener('click', closeGalleryDetail);
shareSavedProject.addEventListener('click', () => createShareLink());
copyShareLink.addEventListener('click', copyCurrentShareLink);
loadSharedProjectFromUrl().then((loadedShare) => {
  if (!loadedShare) {
    renderSavedGallery();
    activateTab('mainMenu');
  }
});
}
