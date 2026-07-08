const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const previewContainer = document.getElementById('preview-container');

imageInput.addEventListener('change', function() {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();

        // When the file is done reading
        reader.addEventListener('load', function() {
            // Set the preview image src to the data URL
            imagePreview.setAttribute('src', this.result);
            // Reveal the preview container
            previewContainer.classList.remove('hidden');
        });

        // Start reading the image file
        reader.readAsDataURL(file);
    }
});
