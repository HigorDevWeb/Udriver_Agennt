const audioForm = document.getElementById('audioForm');
const fileElem = document.getElementById('fileElem');
const resultadoDiv = document.getElementById('resultado');
const fileList = document.getElementById('fileList');
const dropArea = document.getElementById('drop-area');

let filesToUpload = [];

// Obsługa przeciągania i upuszczania
['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('highlight');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('highlight');
  }, false);
});

dropArea.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
});

fileElem.addEventListener('change', function(e) {
  handleFiles(fileElem.files);
});

function handleFiles(files) {
  filesToUpload = Array.from(files);
  showFileList();
}

function showFileList() {
  fileList.innerHTML = "";
  if (filesToUpload.length) {
    let html = "<strong>Wybrane pliki:</strong><ul>";
    filesToUpload.forEach(file => {
      html += `<li>${file.name}</li>`;
    });
    html += "</ul>";
    fileList.innerHTML = html;
  }
}

// Wysyłanie wielu plików w kolejności
audioForm.onsubmit = async function(e) {
  e.preventDefault();
  if (filesToUpload.length === 0) {
    alert("Wybierz przynajmniej jeden plik audio.");
    return;
  }
  resultadoDiv.innerHTML = "Wysyłanie plików...<br>";
  for (const file of filesToUpload) {
    resultadoDiv.innerHTML += `<strong>${file.name}:</strong> Wysyłanie...<br>`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await resp.json();
      if (data.transcription) {
        resultadoDiv.innerHTML += `<strong>${file.name}:</strong> <span style="color:green">Transkrypcja wysłana pomyślnie!</span><br>`;
      } else {
        resultadoDiv.innerHTML += `<strong>${file.name}:</strong> <span style="color:red">${data.error || "Błąd podczas transkrypcji."}</span><br>`;
      }
    } catch (err) {
      resultadoDiv.innerHTML += `<strong>${file.name}:</strong> <span style="color:red">Błąd podczas wysyłania</span><br>`;
    }
  }
  filesToUpload = [];
  showFileList();
};
