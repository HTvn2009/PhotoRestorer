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
  const showcasePrevious = document.getElementById('showcasePrevious');
  const showcaseNext = document.getElementById('showcaseNext');
  const showcasePageStatus = document.getElementById('showcasePageStatus');
  const tabButtons = Array.from(document.querySelectorAll('nav a[data-target]'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const helpQuestions = Array.from(document.querySelectorAll('.help-question'));
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatNote = document.getElementById('chatNote');
  const chatSuggestionButtons = Array.from(document.querySelectorAll('#chatSuggestions button'));

  let selectedFile = null;
  let selectedOriginalDataUrl = null;
  let restoredUrl = null;
  let restoredDataUrl = null;
  let activeSavedId = null;
  let showFavoritesOnly = false;
  let isProcessing = false;
  let isDescribing = false;
  let isStudying = false;
  let restoreProgressTimer = null;
  let restoreProgressIndex = 0;
  let showcasePage = 0;
  const galleryDbName = 'picresGallery';
  const galleryStoreName = 'savedImages';
  const showcasePageSize = 2;
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
Identification note: The broad decorated top, waisted body, side handles, and aged bronze-like patina resemble Southeast Asian ceremonial bronze drums, but no readable label or distinctive motif confirms the type.`,
      beforeImage: 'showcase/trong-dong-dong-son-before.webp',
      afterImage: 'showcase/trong-dong-dong-son-after.png'
    },
    {
      name: 'Mountain Rushmore in building',
      description: `Subject: Mount Rushmore during construction
Description: This black-and-white photograph appears to show Mount Rushmore while carving was still underway. George Washington’s monumental face is prominent at left, while another presidential portrait is emerging from the granite near the center. Pale, freshly worked surfaces contrast with the darker, deeply fractured natural rock around them. Cables hanging from the summit indicate the suspended equipment used by workers on the steep cliff. The unfinished setting offers a striking view of the memorial as both sculpture and construction site, before its four presidential figures reached their familiar final appearance.
Origin: Black Hills near Keystone, South Dakota, United States
Build time / period: Carved from 1927 to 1941
Purpose: Created as a monumental memorial representing four United States presidents.
Significance: Mount Rushmore became one of the most recognizable monumental sculptures and landmarks in the United States.
Historical / cultural context: The memorial was designed and directed by sculptor Gutzon Borglum, with work continuing after his death under Lincoln Borglum until 1941. The exact date and stage shown in this photograph are not established from the image alone.
Observed details:
- A large carved presidential face appears on the left
- A second face is partially formed near the center
- Broad pale areas show recently worked stone
- Rough, uncarved granite surrounds the sculpture
- Cables descend from above the mountaintop
Identification note: The monumental presidential portraits carved into exposed granite, together with the unfinished surfaces and suspended cables, match well-known construction views of Mount Rushmore.`,
      beforeImage: 'showcase/rushmore-before.jpg',
      afterImage: 'showcase/rushmore-after.png'
    },
    {
      name: 'Chu Dau ceramic plate',
      description: `Subject: Decorated East Asian ceramic dish, possibly Vietnamese
Description: A large, shallow ceramic dish is displayed upright on a stand. Its central field contains a delicate landscape of trees, rocky outcrops, vegetation, and distant hills, painted in blue, green, ochre, and reddish-brown on a pale glazed ground. Around the broad rim, repeated leaf-shaped panels alternate with smaller curling motifs and scattered green dots. Fine surface lines, uneven coloring, and areas of wear suggest age or prolonged handling. The decorative scheme appears East Asian and may be Vietnamese, although its precise place of manufacture, date, and original function cannot be confirmed from the photograph alone.
Purpose: Likely made as a functional or presentation dish and now preserved for display.
Significance: The dish reflects a landscape-centered ceramic decorative tradition using restrained polychrome painting and repeated border motifs.
Observed details:
- Large shallow ceramic dish with a pale glazed surface
- Central landscape of trees, rocks, and distant hills
- Blue, green, ochre, and reddish-brown painted decoration
- Leaf-shaped panels arranged around the broad rim
- Displayed upright on a dark stand
Identification note: The painted landscape, restrained multicolor palette, and rim panels are consistent with East Asian ceramic traditions, but the photograph provides no label, mark, date, or provenance.`,
      beforeImage: 'showcase/dia-gom-chu-dau-before.webp',
      afterImage: 'showcase/dia-gom-chu-dau-after.png'
    },
    {
      name: 'Ford car 1930s',
      description: `Subject: Prewar Mercedes-Benz luxury automobile
Description: This black-and-white photograph presents the imposing front of a prewar luxury automobile, possibly a Mercedes-Benz, displayed in a public exhibition setting. Its tall mesh radiator grille, large separate headlamps, long sculpted bonnet, and polished metal fittings reflect the formal styling of high-end cars from the late 1920s or early 1930s. A plate marked “MA-4603” and several motoring badges add period character. Seen close-up, the car conveys the craftsmanship, prestige, and monumental proportions associated with early European touring automobiles, while visitors and modern vehicles remain visible in the background.
Origin: Possibly Germany, if the Mercedes-Benz identification is confirmed.
Build time / period: Likely late 1920s to early 1930s, based on visible styling.
Purpose: Luxury passenger transport; the photograph appears to show the vehicle on exhibition.
Significance: An example of prewar luxury-car design, emphasizing hand-finished details, prominent radiator architecture, and prestige styling.
Historical / cultural context: Cars of this type belonged to an era when European luxury manufacturers combined powerful touring performance with coachbuilt bodies and elaborate exterior fittings.
Observed details:
- Large upright mesh radiator grille
- Two prominent round headlamps
- Long bonnet with polished trim
- Front plate reading “MA-4603”
- Several automobile badges mounted below the grille
Identification note: The three-pointed-star motifs, imposing radiator grille, separate headlamps, and long bonnet are consistent with Mercedes-Benz cars of the late 1920s or early 1930s, but the exact model is not verifiable from this view.`,
      beforeImage: 'showcase/fordcar1930-before.webp',
      afterImage: 'showcase/fordcar1930-after.png'
    },
    {
      name: '"Carpentry workshop near Chuong Duong Bridge"(1992)',
      description: `Subject: A carpentry and woodturning workshop near Chuong Duong Bridge in 1992
Description: Two craftspeople work at woodturning lathes inside a crowded carpentry workshop, identified by the supplied title as being near Chuong Duong Bridge in 1992. One shapes a decorative spindle while the other works beside a larger rotating piece. Wood shavings coat their clothing, benches, and the floor, emphasizing the physical intensity of the labor. Finished and partly shaped components, drive belts, motors, hand tools, and stacked materials fill the compact room. The black-and-white image offers an intimate record of small-scale urban craft production and everyday working life in early-1990s Hanoi.
Origin: Near Chuong Duong Bridge, Hanoi, Vietnam, according to the user-provided title.
Purpose: A working carpentry shop used to turn and shape wooden components, possibly for furniture or architectural fittings.
Significance: The scene preserves a close view of skilled manual labor and small-workshop wood production in Hanoi in 1992.
Historical / cultural context: The user-provided date places the workshop in early-1990s Hanoi, a period of expanding private enterprise and economic change in Vietnam.
Observed details:
- Two workers operate woodturning equipment
- Turned wooden spindles lie across the workbenches
- Wood shavings cover the workers and surrounding surfaces
- Belts, motors, tools, and materials crowd the small room
- The photograph is black and white
Identification note: The visible lathes, wooden spindles, tools, and heavy wood shavings clearly indicate a working carpentry shop; the location and date come from the user-provided title.`,
      beforeImage: 'showcase/xuong-moc-gan-cau-chuong-duong-1992-soloman-before.jpg',
      afterImage: 'showcase/xuong-moc-gan-cau-chuong-duong-1992-soloman-after.png'
    },
    {
      name: 'Martin Luther King Jr. at a WNBC round table',
      description: `Subject: A WNBC-TV public-affairs roundtable, possibly featuring Martin Luther King Jr.
Description: This black-and-white photograph captures a formal television roundtable in progress. Five men in suits lean toward one another around a table scattered with papers, framed by bookshelves and wood-paneled walls. In the foreground, a camera labeled WNBC TV 4 and its silhouetted operator reveal the production setting. The clothing, equipment, and restrained studio design suggest a mid-20th-century public-affairs broadcast. One participant appears to resemble civil rights leader Martin Luther King Jr., which may indicate a discussion connected with contemporary social or political issues, though the people and program cannot be confirmed from the image alone.
Origin: A television studio associated with WNBC-TV; the exact location is not confirmed.
Purpose: To record or broadcast a formal panel discussion or interview.
Significance: The image illustrates the role of television studios in presenting serious public discussion during the mid-20th century.
Historical / cultural context: The equipment, dress, and visual style are consistent with American television production of the 1950s or 1960s, but an exact date is unsupported.
Observed details:
- Five suited men sit around a round table
- A large studio camera is marked “WNBC TV” and “4”
- A camera operator stands in silhouette
- Bookshelves and wood-paneled walls form the set
- Papers and printed material lie on the table
Identification note: The station marking and studio arrangement are clearly visible, while one participant resembles Martin Luther King Jr.; no caption or other direct identification is provided.`,
      beforeImage: 'showcase/DR-King-on-NBC-before.jpg',
      afterImage: 'showcase/DR-King-on-NBC-after.png'
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
  runButton.innerHTML = '<span>&#10022;</span> Run restoration';
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
  resetStudyChat();
  updateStudyChatState();
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

function setStudyWelcome() {
  if (!chatMessages) return;
  chatMessages.replaceChildren();
  const orb = document.createElement('div');
  orb.className = 'chat-orb';
  orb.textContent = 'i';
  const title = document.createElement('h2');
  title.textContent = 'Learning notes';
  const text = document.createElement('p');
  text.textContent = selectedFile
    ? 'Ask about visible details, possible cultural context, or what should be verified.'
    : 'Upload an image, then ask about visible details, possible cultural context, or what should be verified.';
  chatMessages.append(orb, title, text);
}

function resetStudyChat() {
  setStudyWelcome();
  if (chatInput) chatInput.value = '';
}

function updateStudyChatState() {
  const canAsk = Boolean(selectedFile) && !isStudying;
  if (chatInput) chatInput.disabled = !canAsk;
  if (chatSend) chatSend.disabled = !canAsk;
  chatSuggestionButtons.forEach(button => {
    button.disabled = !canAsk;
  });
  if (chatNote) {
    chatNote.textContent = selectedFile
      ? isStudying ? 'Studying the uploaded image...' : 'Ask a question about the uploaded image.'
      : 'Upload an image to start asking.';
  }
}

function appendChatMessage(role, text, variant = '') {
  if (!chatMessages) return null;
  const message = document.createElement('div');
  message.className = `chat-message ${role}${variant ? ` ${variant}` : ''}`;
  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You' : 'Study Assistant';
  const body = document.createElement('p');
  body.textContent = text;
  message.append(label, body);
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
}

function updateStudySuggestions(suggestedQuestions) {
  if (!Array.isArray(suggestedQuestions) || !suggestedQuestions.length) return;
  chatSuggestionButtons.forEach((button, index) => {
    if (!suggestedQuestions[index]) return;
    button.textContent = suggestedQuestions[index];
    button.dataset.question = suggestedQuestions[index];
  });
}

async function askStudyAssistant(questionText) {
  const question = String(questionText || chatInput?.value || '').trim();
  if (!question || !selectedFile || isStudying) {
    if (!selectedFile) setStatus('Upload an image before asking the assistant');
    return;
  }

  isStudying = true;
  updateStudyChatState();
  if (chatInput) chatInput.value = '';
  appendChatMessage('user', question);
  const loadingMessage = appendChatMessage('assistant', 'Studying the uploaded image...', 'loading');

  try {
    const response = await fetch('/api/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: selectedOriginalDataUrl || await fileToDataUrl(selectedFile),
        question,
        title: imageName.value.trim(),
        context: imageContext.value.trim()
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to answer the question.');
    if (loadingMessage) loadingMessage.remove();
    appendChatMessage('assistant', result.answer || 'I could not find enough visual evidence to answer that.');
    updateStudySuggestions(result.suggestedQuestions);
    setStatus('Study answer ready');
  } catch (error) {
    if (loadingMessage) {
      loadingMessage.className = 'chat-message assistant error';
      const body = loadingMessage.querySelector('p');
      if (body) body.textContent = error.message || 'Unable to answer the question.';
    } else {
      appendChatMessage('assistant', error.message || 'Unable to answer the question.', 'error');
    }
    setStatus('Study assistant could not answer');
  } finally {
    isStudying = false;
    updateStudyChatState();
    if (chatInput && selectedFile) chatInput.focus();
  }
}

async function restoreImage() {
  if (!selectedFile || isProcessing) {
    if (!selectedFile) setStatus('Choose an image before restoring');
    return;
  }

  isProcessing = true;
  clearResult({ clearDescription: false });
  runButton.disabled = true;
  runButton.innerHTML = '<span>&#10022;</span> Restoring...';
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
    setStatus('Restoration complete');
    saveButton.disabled = false;
  } catch (error) {
    stopOutputProgress();
    setStatus(error.message || 'Restore failed');
    if (outputText) outputText.textContent = error.message || 'Unable to restore the image.';
  } finally {
    isProcessing = false;
    runButton.disabled = false;
    runButton.innerHTML = restoredUrl ? '<span>&#8635;</span> Retry restoration' : '<span>&#10022;</span> Run restoration';
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
  const pageCount = Math.max(1, Math.ceil(visibleProjects.length / showcasePageSize));
  showcasePage = Math.min(showcasePage, pageCount - 1);
  const pageStart = showcasePage * showcasePageSize;
  const pageProjects = visibleProjects.slice(pageStart, pageStart + showcasePageSize);

  if (showcaseEmpty) showcaseEmpty.hidden = visibleProjects.length > 0;
  if (showcasePrevious) {
    showcasePrevious.hidden = visibleProjects.length === 0;
    showcasePrevious.disabled = showcasePage === 0;
  }
  if (showcaseNext) {
    showcaseNext.hidden = visibleProjects.length === 0;
    showcaseNext.disabled = showcasePage >= pageCount - 1;
  }
  if (showcasePageStatus) {
    showcasePageStatus.hidden = visibleProjects.length <= showcasePageSize;
    showcasePageStatus.textContent = `Page ${showcasePage + 1} of ${pageCount}`;
  }

  showcaseList.replaceChildren(...pageProjects.map(project => {
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

function changeShowcasePage(direction) {
  const visibleCount = showcaseProjects.filter(project =>
    project?.name && project?.description && project?.beforeImage && project?.afterImage
  ).length;
  const pageCount = Math.max(1, Math.ceil(visibleCount / showcasePageSize));
  showcasePage = Math.max(0, Math.min(pageCount - 1, showcasePage + direction));
  renderShowcase();
}

if (showcasePrevious) {
  showcasePrevious.addEventListener('click', () => changeShowcasePage(-1));
}

if (showcaseNext) {
  showcaseNext.addEventListener('click', () => changeShowcasePage(1));
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

if (chatSend) {
  chatSend.addEventListener('click', () => askStudyAssistant());
}

if (chatInput) {
  chatInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    askStudyAssistant();
  });
}

chatSuggestionButtons.forEach(button => {
  button.addEventListener('click', () => askStudyAssistant(button.dataset.question || button.textContent));
});

setStudyWelcome();
updateStudyChatState();

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
