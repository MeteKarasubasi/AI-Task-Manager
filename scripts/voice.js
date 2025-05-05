// Voice Recording State
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let visualizerInterval = null;

// DOM Elements
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const recordingStatus = document.getElementById('recordingStatus');
const audioVisualizer = document.getElementById('audioVisualizer').getContext('2d');
const transcribedText = document.getElementById('transcribedText');

// Audio Context Setup
let audioContext;
let analyser;
let dataArray;

// Initialize Voice Recording
async function initializeVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setupAudioContext(stream);
        setupMediaRecorder(stream);
        setupEventListeners();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        showError('Mikrofona erişilemedi. Lütfen mikrofon izinlerini kontrol edin.');
    }
}

// Audio Context Setup
function setupAudioContext(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

// Media Recorder Setup
function setupMediaRecorder(stream) {
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processAudioRecording(audioBlob);
    };
}

// Event Listeners
function setupEventListeners() {
    if (startRecordingBtn) {
        startRecordingBtn.addEventListener('click', startRecording);
    }
    
    if (stopRecordingBtn) {
        stopRecordingBtn.addEventListener('click', stopRecording);
    }
}

// Recording Controls
function startRecording() {
    audioChunks = [];
    isRecording = true;
    
    mediaRecorder.start();
    startVisualizer();
    
    updateUIForRecording(true);
}

function stopRecording() {
    isRecording = false;
    mediaRecorder.stop();
    stopVisualizer();
    
    updateUIForRecording(false);
}

// UI Updates
function updateUIForRecording(recording) {
    if (startRecordingBtn) startRecordingBtn.disabled = recording;
    if (stopRecordingBtn) stopRecordingBtn.disabled = !recording;
    if (recordingStatus) {
        recordingStatus.textContent = recording ? 'Kaydediliyor...' : 'Kayıt için tıklayın';
    }
}

// Audio Visualizer
function startVisualizer() {
    const canvas = document.getElementById('audioVisualizer');
    const canvasCtx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    visualizerInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.fillStyle = 'rgb(15, 23, 42)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        
        const barWidth = (WIDTH / analyser.frequencyBinCount) * 2.5;
        let barHeight;
        let x = 0;
        
        for(let i = 0; i < analyser.frequencyBinCount; i++) {
            barHeight = dataArray[i] / 2;
            
            const gradient = canvasCtx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#6366f1');
            
            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }, 16);
}

function stopVisualizer() {
    if (visualizerInterval) {
        clearInterval(visualizerInterval);
        visualizerInterval = null;
        
        // Clear canvas
        const canvas = document.getElementById('audioVisualizer');
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Audio Processing
async function processAudioRecording(audioBlob) {
    try {
        // Show loading state
        if (transcribedText) {
            transcribedText.textContent = 'Ses işleniyor...';
            transcribedText.parentElement.classList.remove('hidden');
        }
        
        // TODO: Implement Whisper API integration
        // For now, we'll simulate the API call
        await simulateTranscription(audioBlob);
        
    } catch (error) {
        console.error('Error processing audio:', error);
        showError('Ses işlenirken bir hata oluştu.');
        
        if (transcribedText) {
            transcribedText.textContent = 'Ses işlenemedi. Lütfen tekrar deneyin.';
        }
    }
}

// Temporary function to simulate Whisper API integration
async function simulateTranscription(audioBlob) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful transcription
    if (transcribedText) {
        transcribedText.textContent = 'Bu bir örnek transkripsiyon metnidir. ' +
            'Whisper API entegrasyonu tamamlandığında gerçek transkripsiyon burada görünecektir.';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeVoiceRecording); 