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
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(bytes < 100 * 1024 ? 1 : 0)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

function setStatus(message, processing = false) {
  status.querySelector('span').textContent = ` ${message}`;
  status.classList.toggle('processing', processing);
}

function showImage(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 10 * 1024 * 1024) {
    actionMessage.textContent = 'Vui lòng chọn ảnh nhỏ hơn 10 MB.';
    return;
  }
  selectedFile = file;
  clearResult();
  const imageUrl = URL.createObjectURL(file);
  previewImage.onload = () => {
    imageFileName.textContent = file.name;
    imageFileDetails.textContent = `${formatFileSize(file.size)} · ${previewImage.naturalWidth} × ${previewImage.naturalHeight}px`;
    imagePreview.hidden = false;
    uploadZone.querySelector('.upload-placeholder').hidden = true;
    URL.revokeObjectURL(imageUrl);
    actionMessage.textContent = 'Ảnh đã sẵn sàng để phục hồi.';
    setStatus('Sẵn sàng');
  };
  previewImage.src = imageUrl;
}

async function restoreImage() {
  if (!selectedFile || isProcessing) {
    if (!selectedFile) actionMessage.textContent = 'Hãy chọn một ảnh trước khi chạy phục hồi.';
    return;
  }
  isProcessing = true;
  clearResult();
  runButton.disabled = true;
  retryButton.disabled = true;
  runButton.innerHTML = '<span>◌</span> Đang phục hồi...';
  actionMessage.textContent = 'AI đang khử mờ, tăng chi tiết và tô màu ảnh…';
  setStatus('Đang xử lý', true);

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
    if (!response.ok) throw new Error(result.error || 'Không thể phục hồi ảnh.');
    const imageBytes = Uint8Array.from(atob(result.imageBase64), char => char.charCodeAt(0));
    restoredUrl = URL.createObjectURL(new Blob([imageBytes], { type: result.mimeType || 'image/png' }));
    restoredImage.src = restoredUrl;
    outputPlaceholder.hidden = true;
    outputResult.hidden = false;
    retryButton.disabled = false;
    saveButton.disabled = false;
    description.value = 'AI đã tạo một bản phục hồi mới: tăng độ phân giải, giảm mờ/nhiễu và tô màu thận trọng. Với ảnh lịch sử hoặc văn hóa truyền thống, hệ thống được hướng dẫn bảo toàn bố cục, trang phục, kiến trúc và không bịa thêm chi tiết.';
    actionMessage.textContent = 'Phục hồi hoàn tất. Bạn có thể lưu ảnh hoặc Retry để tạo một phiên bản mới.';
    setStatus('Hoàn tất');
  } catch (error) {
    actionMessage.textContent = error.message || 'Đã có lỗi khi phục hồi ảnh.';
    setStatus('Có lỗi');
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
  link.href = restoredUrl;
  link.download = `${(imageName.value.trim() || selectedFile.name.replace(/\.[^.]+$/, ''))}-restored.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

imageUpload.addEventListener('change', () => showImage(imageUpload.files[0]));
runButton.addEventListener('click', restoreImage);
retryButton.addEventListener('click', restoreImage);
saveButton.addEventListener('click', downloadResult);
['dragenter', 'dragover'].forEach(name => uploadZone.addEventListener(name, event => { event.preventDefault(); uploadZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach(name => uploadZone.addEventListener(name, event => { event.preventDefault(); uploadZone.classList.remove('dragging'); }));
uploadZone.addEventListener('drop', event => showImage(event.dataTransfer.files[0]));
