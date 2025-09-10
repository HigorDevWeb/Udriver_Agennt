class AudioTranscriptionApp {
  constructor() {
    this.init();
    this.filesToUpload = [];
    this.isProcessing = false;
    this.processedCount = 0;
    this.totalFiles = 0;
    this.results = [];
  }

  init() {
    this.bindElements();
    this.setupEventListeners();
    this.setupDragAndDrop();
  }

  bindElements() {
    this.dropArea = document.getElementById('drop-area');
    this.fileElem = document.getElementById('fileElem');
    this.fileList = document.getElementById('fileList');
    this.controls = document.getElementById('controls');
    this.clearBtn = document.getElementById('clearFiles');
    this.startBtn = document.getElementById('startTranscription');
    this.progressSection = document.getElementById('progressSection');
    this.fileProgress = document.getElementById('fileProgress');
    this.overallProgressBar = document.getElementById('overallProgressBar');
    this.progressText = document.getElementById('progressText');
    this.resultsSection = document.getElementById('results');
    this.loadingModal = document.getElementById('loadingModal');
  }

  setupEventListeners() {
    this.fileElem.addEventListener('change', (e) => this.handleFiles(e.target.files));
    this.clearBtn.addEventListener('click', () => this.clearFiles());
    this.startBtn.addEventListener('click', () => this.startTranscription());
    this.dropArea.addEventListener('click', () => this.fileElem.click());
  }

  setupDragAndDrop() {
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropArea.classList.add('highlight');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dropArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropArea.classList.remove('highlight');
      }, false);
    });

    this.dropArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    });
  }

  handleFiles(files) {
    const newFiles = Array.from(files).filter(file => {
      // Check if file is audio and not already added
      const isAudio = file.type.startsWith('audio/') || 
                     ['.mp3', '.wav', '.m4a', '.ogg', '.flac'].some(ext => 
                       file.name.toLowerCase().endsWith(ext));
      const notDuplicate = !this.filesToUpload.some(f => 
        f.name === file.name && f.size === file.size);
      
      if (!isAudio) {
        this.showNotification(`File "${file.name}" is not a supported audio format`, 'error');
        return false;
      }
      
      if (!notDuplicate) {
        this.showNotification(`File "${file.name}" is already added`, 'warning');
        return false;
      }
      
      return true;
    });

    if (newFiles.length === 0) return;

    // Add file metadata
    newFiles.forEach(file => {
      file.id = this.generateFileId();
      file.status = 'pending';
      file.progress = 0;
    });

    this.filesToUpload.push(...newFiles);
    this.updateFileList();
    this.updateControls();
    
    if (newFiles.length > 0) {
      this.showNotification(`Added ${newFiles.length} file(s) successfully`, 'success');
    }
  }

  generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateFileList() {
    if (this.filesToUpload.length === 0) {
      this.fileList.innerHTML = '';
      return;
    }

    const html = this.filesToUpload.map(file => `
      <div class="file-item" data-file-id="${file.id}">
        <div class="file-info">
          <div class="file-name">${this.escapeHtml(file.name)}</div>
          <div class="file-size">${this.formatFileSize(file.size)}</div>
        </div>
        <div class="file-status">
          <div class="status-icon status-${file.status}">
            ${this.getStatusIcon(file.status)}
          </div>
          <button onclick="app.removeFile('${file.id}')" class="remove-btn" ${this.isProcessing ? 'disabled' : ''}>
            ❌
          </button>
        </div>
      </div>
    `).join('');

    this.fileList.innerHTML = html;
  }

  updateControls() {
    const hasFiles = this.filesToUpload.length > 0;
    this.controls.style.display = hasFiles ? 'flex' : 'none';
    this.startBtn.disabled = this.isProcessing || !hasFiles;
    this.clearBtn.disabled = this.isProcessing;
  }

  getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      success: '✅',
      error: '❌'
    };
    return icons[status] || '⏳';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  removeFile(fileId) {
    if (this.isProcessing) return;
    
    this.filesToUpload = this.filesToUpload.filter(file => file.id !== fileId);
    this.updateFileList();
    this.updateControls();
    this.showNotification('File removed', 'info');
  }

  clearFiles() {
    if (this.isProcessing) return;
    
    this.filesToUpload = [];
    this.updateFileList();
    this.updateControls();
    this.showNotification('All files cleared', 'info');
  }

  async startTranscription() {
    if (this.isProcessing || this.filesToUpload.length === 0) return;

    this.isProcessing = true;
    this.processedCount = 0;
    this.totalFiles = this.filesToUpload.length;
    this.results = [];
    
    this.updateControls();
    this.showProgressSection();
    this.clearResults();

    try {
      for (const file of this.filesToUpload) {
        await this.processFile(file);
      }
      
      this.showNotification(`Successfully processed ${this.processedCount} files!`, 'success');
    } catch (error) {
      console.error('Error during transcription:', error);
      this.showNotification('An error occurred during processing', 'error');
    } finally {
      this.isProcessing = false;
      this.updateControls();
      this.hideProgressSection();
    }
  }

  async processFile(file) {
    try {
      file.status = 'processing';
      this.updateFileList();
      this.updateFileProgress(file, 'Processing...');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.transcription) {
        file.status = 'success';
        this.results.push({
          filename: file.name,
          transcription: data.transcription,
          success: true,
          dify_sent: data.docx_sent
        });
        this.updateFileProgress(file, 'Completed successfully');
        this.displayResult(file.name, data.transcription, true);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

    } catch (error) {
      file.status = 'error';
      this.updateFileProgress(file, `Error: ${error.message}`);
      this.displayResult(file.name, error.message, false);
    }

    this.processedCount++;
    this.updateOverallProgress();
    this.updateFileList();
  }

  updateFileProgress(file, status) {
    let progressItem = document.querySelector(`[data-progress-id="${file.id}"]`);
    
    if (!progressItem) {
      progressItem = document.createElement('div');
      progressItem.className = 'file-progress-item';
      progressItem.setAttribute('data-progress-id', file.id);
      progressItem.innerHTML = `
        <div class="file-progress-info">
          <div class="file-progress-name">${this.escapeHtml(file.name)}</div>
          <div class="file-progress-status"></div>
        </div>
      `;
      this.fileProgress.appendChild(progressItem);
    }

    const statusElement = progressItem.querySelector('.file-progress-status');
    statusElement.textContent = status;
    statusElement.className = `file-progress-status status-${file.status}`;
  }

  updateOverallProgress() {
    const percentage = (this.processedCount / this.totalFiles) * 100;
    this.overallProgressBar.style.width = `${percentage}%`;
    this.progressText.textContent = `${this.processedCount} / ${this.totalFiles} files processed`;
  }

  showProgressSection() {
    this.progressSection.style.display = 'block';
    this.fileProgress.innerHTML = '';
  }

  hideProgressSection() {
    setTimeout(() => {
      this.progressSection.style.display = 'none';
    }, 2000);
  }

  displayResult(filename, content, isSuccess) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    
    if (isSuccess) {
      resultItem.innerHTML = `
        <div class="result-header">
          <div class="result-filename">🎵 ${this.escapeHtml(filename)}</div>
          <div class="result-badge">Success</div>
        </div>
        <div class="transcription-text">${this.escapeHtml(content)}</div>
        <div class="translation-info">
          <span class="translation-badge">🇵🇹 Portuguese</span>
          <span class="translation-badge">🇬🇧 English</span>
          <span class="translation-badge">🇵🇱 Polish</span>
          <span class="translation-badge">🇺🇦 Ukrainian</span>
          <span class="translation-badge">🇷🇺 Russian</span>
        </div>
      `;
    } else {
      resultItem.innerHTML = `
        <div class="result-header">
          <div class="result-filename">❌ ${this.escapeHtml(filename)}</div>
          <div class="result-badge" style="background: #ef4444;">Error</div>
        </div>
        <div class="transcription-text" style="color: #dc2626;">
          ${this.escapeHtml(content)}
        </div>
      `;
    }

    this.resultsSection.appendChild(resultItem);
    
    // Scroll to new result
    resultItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  clearResults() {
    this.resultsSection.innerHTML = '';
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 300px;
          animation: slideInRight 0.3s ease;
        }
        .notification button {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notification-success { background: #10b981; }
        .notification-error { background: #ef4444; }
        .notification-warning { background: #f59e0b; }
        .notification-info { background: #3b82f6; }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  showLoadingModal() {
    this.loadingModal.style.display = 'block';
  }

  hideLoadingModal() {
    this.loadingModal.style.display = 'none';
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AudioTranscriptionApp();
});

// Handle page visibility changes to pause/resume processing if needed
document.addEventListener('visibilitychange', () => {
  if (document.hidden && window.app && window.app.isProcessing) {
    console.log('Page hidden, processing continues in background...');
  }
});
