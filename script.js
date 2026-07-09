const imageInput = document.getElementById('image-input');
const restoreBtn = document.getElementById('restore-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const placeholderText = document.getElementById('placeholder-text');

// Slider elements
const comparisonContainer = document.getElementById('comparison-container');
const imageBefore = document.getElementById('image-before');
const imageAfter = document.getElementById('image-after');
const comparisonSlider = document.getElementById('comparison-slider');
const sliderHandle = document.getElementById('slider-handle');

let originalImageSrc = ""; // Store original file source to compare later

// 1. Show preview when selected
imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImageSrc = e.target.result;
            document.getElementById('image-preview').src = originalImageSrc;
            document.getElementById('preview-container').classList.remove('hidden');
            restoreBtn.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
});

// 2. Interactive Slider Movement Logic
comparisonSlider.addEventListener('input', function(e) {
    const value = e.target.value;
    
    // Update the clip-path of the top "Before" image
    imageBefore.style.clipPath = `polygon(0 0, ${value}% 0, ${value}% 100%, 0 100%)`;
    
    // Move the visual circle handle horizontally
    sliderHandle.style.left = `${value}%`;
});

// 3. Process with AI and set up comparison
restoreBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;

    // UI Updates: Show loader, hide old result
    loadingSpinner.classList.remove('hidden');
    placeholderText.classList.add('hidden');
    comparisonContainer.classList.add('hidden');
    restoreBtn.disabled = true;

    try {
        const API_TOKEN = "YOUR_HF_TOKEN_HERE";
        const modelUrl = "https://api-inference.huggingface.co/models/microsoft/swin2SR-classical-sr-x2-64";

        const response = await fetch(modelUrl, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: file,
        });

        if (!response.ok) throw new Error("AI Request Failed");

        const blob = await response.blob();
        const outputUrl = URL.createObjectURL(blob);

        // Assign sources to slider
        imageBefore.src = originalImageSrc; // Original upload
        imageAfter.src = outputUrl;          // AI processed result

        // Reset slider back to the center (50%)
        comparisonSlider.value = 50;
        imageBefore.style.clipPath = `polygon(0 0, 50% 0, 50% 100%, 0 100%)`;
        sliderHandle.style.left = `50%`;

        // Display the slider container
        comparisonContainer.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        alert("The model might be loading. Please try again in a few seconds.");
    } finally {
        loadingSpinner.classList.add('hidden');
        restoreBtn.disabled = false;
    }
});
