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
  const savedList = document.getElementById('savedList');
  const galleryEmpty = document.getElementById('galleryEmpty');
  const savedDetail = document.getElementById('savedDetail');
  const savedDetailEmpty = document.getElementById('savedDetailEmpty');
  const savedDetailName = document.getElementById('savedDetailName');
  const savedDetailDate = document.getElementById('savedDetailDate');
  const savedBeforeImage = document.getElementById('savedBeforeImage');
  const savedAfterImage = document.getElementById('savedAfterImage');
  const savedDetailDescription = document.getElementById('savedDetailDescription');
  const favoriteFilter = document.getElementById('favoriteFilter');
  const favoriteSavedProject = document.getElementById('favoriteSavedProject');
  const renameSavedProjectButton = document.getElementById('renameSavedProject');
  const deleteSavedProject = document.getElementById('deleteSavedProject');
  const closeSavedDetail = document.getElementById('closeSavedDetail');
  const shareSavedProject = document.getElementById('shareSavedProject');
  const shareLinkRow = document.getElementById('shareLinkRow');
  const shareLink = document.getElementById('shareLink');
  const copyShareLink = document.getElementById('copyShareLink');
  const showcaseList = document.getElementById('showcaseList');
  const showcaseEmpty = document.getElementById('showcaseEmpty');
  const tabButtons = Array.from(document.querySelectorAll('nav a[data-target]'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const helpQuestions = Array.from(document.querySelectorAll('.help-question'));

  let selectedFile = null;
  let selectedOriginalDataUrl = null;
  let restoredUrl = null;
  let restoredDataUrl = null;
  let activeSavedId = null;
  let showFavoritesOnly = false;
  let isProcessing = false;
  let isDescribing = false;
  let restoreProgressTimer = null;
  let restoreProgressIndex = 0;
  const galleryDbName = 'picresGallery';
  const galleryStoreName = 'savedImages';
  const showcaseProjects = [
    {
      name: 'Bronze Drum Dong Son',
      description: `Subject: Ancient bronze drum, possibly Dong Son-style
Description: Despite the user-provided title "Old chair," the photograph shows a large metal vessel or drum displayed inside a glass case. It has a broad circular top, a waisted body, and small loop handles at the sides. Green and brown patination covers much of the surface, while faint bands of geometric ornament remain visible around the upper body and top. Its form resembles an ancient Southeast Asian bronze drum, possibly of the Dong Son tradition, though the exact culture, date, and origin cannot be confirmed from this image alone.
Purpose: Possibly made for ceremonial use, communal signaling, or as a prestige object, if the bronze-drum identification is correct.
Significance: Its form may belong to a wider Southeast Asian tradition in which cast bronze drums carried ceremonial and social importance.
Historical / cultural context: Dong Son-style bronze drums are associated with ancient metalworking traditions in mainland and island Southeast Asia, but this particular object requires documentation before that association can be confirmed.
Observed details:
- Large circular metal top
- Green and brown surface patina
- Faint geometric decoration
- Small loop handles on the sides
- Displayed in a glass case on a red cushion
Identification note: The broad decorated top, waisted body, side handles, and aged bronze-like patina resemble Southeast Asian ceremonial bronze drums, but no readable label or distinctive motif confirms the type.
Warnings:
- The user-provided title does not match the visible object.
- The precise type, origin, and age cannot be verified from the photograph alone.
Human verification recommended.`,
      beforeImage: 'showcase/trong-dong-dong-son-before.webp',
      afterImage: 'showcase/trong-dong-dong-son-after.png'
    },
    {
      name: 'Traditional scene',
      description: 'A restored cultural scene example focused on improving faded contrast, preserving clothing and architectural details, and adding restrained natural color.',
      beforeImage: 'showcase/traditional-scene-before.jpg',
      afterImage: 'showcase/traditional-scene-after.jpg'
    }
  ];

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

function clearResult({ clearDescription = true } = {}) {
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
  if (clearDescription && description) description.value = '';
  if (clearDescription && description) description.readOnly = true;
  if (analysisCard) analysisCard.hidden = true;
}

function showImage(file) {
  if (!file || !file.type.startsWith('image/')) return;

  if (file.size > 10 * 1024 * 1024) {
    setStatus('Please choose a file smaller than 10 MB');
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
  clearResult({ clearDescription: false });
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

function pushDescriptionLine(lines, label, value) {
  if (!value) return;
  lines.push(`${label}: ${value}`);
}

function buildDescriptionText(analysis) {
  const lines = [];
  const titleText = (analysis?.identification?.candidate) || imageName?.value?.trim();

  pushDescriptionLine(lines, 'Subject', titleText);
  pushDescriptionLine(lines, 'Description', analysis?.description);
  pushDescriptionLine(lines, 'Origin', analysis?.origin);
  pushDescriptionLine(lines, 'Build time / period', analysis?.buildPeriod);
  pushDescriptionLine(lines, 'Purpose', analysis?.purpose);
  pushDescriptionLine(lines, 'Significance', analysis?.significance);
  pushDescriptionLine(lines, 'Historical / cultural context', analysis?.historicalContext);

  if (Array.isArray(analysis?.observedDetails) && analysis.observedDetails.length) {
    lines.push('Observed details:');
    analysis.observedDetails.forEach(detail => lines.push(`- ${detail}`));
  }

  if (analysis?.identification?.reason) {
    pushDescriptionLine(lines, 'Identification note', analysis.identification.reason);
  }

  if (Array.isArray(analysis?.warnings) && analysis.warnings.length) {
    lines.push('Warnings:');
    analysis.warnings.forEach(warning => lines.push(`- ${warning}`));
  }

  lines.push(analysis?.humanCheck ? 'Human verification recommended.' : 'No extra human verification warning from the AI analysis.');
  return lines.join('\n');
}

function renderAnalysis(analysis) {
  if (description) {
    description.value = buildDescriptionText(analysis);
    description.readOnly = false;
  }

  if (analysisCard) analysisCard.hidden = true;
  if (formattedDescription) formattedDescription.hidden = true;
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

function createShowcaseFigure(project, imageType) {
  const figure = document.createElement('figure');
  figure.className = 'showcase-figure';

  const image = document.createElement('img');
  image.src = project[`${imageType}Image`];
  image.alt = `${project.name} ${imageType} restoration image`;
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.remove();
    const missing = document.createElement('div');
    missing.className = 'showcase-missing';
    missing.textContent = `Add ${project[`${imageType}Image`]} to show this ${imageType} image.`;
    figure.prepend(missing);
  });

  const caption = document.createElement('figcaption');
  caption.textContent = imageType === 'before' ? 'Before' : 'After';

  figure.append(image, caption);
  return figure;
}

function renderShowcase() {
  if (!showcaseList) return;

  const visibleProjects = showcaseProjects.filter(project =>
    project?.name && project?.description && project?.beforeImage && project?.afterImage
  );

  if (showcaseEmpty) showcaseEmpty.hidden = visibleProjects.length > 0;
  showcaseList.replaceChildren(...visibleProjects.map(project => {
    const card = document.createElement('article');
    card.className = 'showcase-card';

    const compare = document.createElement('div');
    compare.className = 'showcase-compare';
    compare.append(createShowcaseFigure(project, 'before'), createShowcaseFigure(project, 'after'));

    const content = document.createElement('div');
    content.className = 'showcase-content';

    const title = document.createElement('h3');
    title.textContent = project.name;

    const text = document.createElement('p');
    text.textContent = project.description;

    content.append(title, text);
    card.append(compare, content);
    return card;
  }));
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
  if (savedDetailEmpty) savedDetailEmpty.hidden = false;
  if (shareLinkRow) shareLinkRow.hidden = true;
  if (shareLink) shareLink.value = '';
  if (savedList) {
    savedList.querySelectorAll('.saved-list-item').forEach(item => item.classList.remove('active'));
  }
}

function getShareUrl(item) {
  if (!item) return '';
  if (item.shareUrl) return item.shareUrl;
  if (item.id) return new URL(`/share/${item.id}`, window.location.origin).href;
  return '';
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
  if (favoriteSavedProject) {
    favoriteSavedProject.textContent = item.favorite ? '★' : '☆';
    favoriteSavedProject.title = item.favorite ? 'Remove favorite' : 'Add favorite';
    favoriteSavedProject.setAttribute('aria-label', favoriteSavedProject.title);
    favoriteSavedProject.classList.toggle('active', Boolean(item.favorite));
  }
  const shareUrl = getShareUrl(item);
  if (shareLinkRow) shareLinkRow.hidden = !shareUrl;
  if (shareLink) shareLink.value = shareUrl;
  if (savedDetailEmpty) savedDetailEmpty.hidden = true;
  savedDetail.hidden = false;
  savedList.querySelectorAll('.saved-list-item').forEach(button => {
    button.classList.toggle('active', button.dataset.savedId === item.id);
  });
}

async function renderSavedGallery() {
  if (!savedList || !galleryEmpty) return;
  const items = await readSavedGallery();
  const visibleItems = showFavoritesOnly ? items.filter(item => item.favorite) : items;
  galleryEmpty.hidden = visibleItems.length > 0;
  galleryEmpty.textContent = showFavoritesOnly && items.length
    ? 'No favorite projects yet.'
    : 'No saved images yet.';
  savedList.replaceChildren(...visibleItems.map(item => {
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
      createSavedActionButton('🗑︎', 'Delete project', () => removeSavedProject(item), 'danger')
    );

    row.append(nameButton, actions);
    return row;
  }));

  if (activeSavedId) {
    const activeItem = visibleItems.find(item => item.id === activeSavedId);
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

function createSavedActionButton(label, title, onClick, variant = '') {
  const button = document.createElement('button');
  button.className = `icon-button small saved-action-button${variant ? ` ${variant}` : ''}`;
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
  if (activeSavedId === item.id && (!showFavoritesOnly || item.favorite)) openGalleryDetail(item);
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
    shareSavedProject.textContent = '↗';
    shareSavedProject.setAttribute('aria-label', 'Sharing project');
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
      shareSavedProject.textContent = '↗';
      shareSavedProject.setAttribute('aria-label', 'Share project');
    }
  }
}

async function runActiveSavedAction(action) {
  const item = await getActiveSavedItem();
  if (!item) {
    setStatus('Choose a saved project first');
    return;
  }

  await action(item);
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
    const item = result.item;
    item.shareUrl = new URL(`/share/${item.id}`, window.location.origin).href;
    activeSavedId = item.id;
    galleryEmpty.hidden = true;
    savedList.replaceChildren();
    openGalleryDetail(item);
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
favoriteSavedProject.addEventListener('click', () => runActiveSavedAction(toggleFavorite));
renameSavedProjectButton.addEventListener('click', () => runActiveSavedAction(renameSavedProject));
shareSavedProject.addEventListener('click', () => createShareLink());
deleteSavedProject.addEventListener('click', () => runActiveSavedAction(removeSavedProject));
copyShareLink.addEventListener('click', copyCurrentShareLink);
favoriteFilter.addEventListener('change', () => {
  showFavoritesOnly = favoriteFilter.checked;
  renderSavedGallery();
});
loadSharedProjectFromUrl().then((loadedShare) => {
  renderShowcase();
  if (!loadedShare) {
    renderSavedGallery();
    activateTab('mainMenu');
  }
});
}
