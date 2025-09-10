# 🇬🇧 Launch Instructions – Audio Transcription and Translation System

This system allows users to upload multiple audio files (MP3), transcribe them using OpenAI Whisper, translate transcriptions to multiple languages, and send results to the Dify platform.

---

## ✅ Requirements

1. Python 3.10 or newer  
2. Node.js (optional – if you want to integrate with other frontend services)  
3. Python virtual environment (`venv`)  
4. OpenAI account with API key  
5. Dify account with properly configured dataset  

---

## 📁 File Structure

```
├── app.py               # Flask backend – handles transcription, translations and sending to Dify
├── index.html           # Frontend interface
├── styles.css           # Interface styles
├── script.js            # Frontend logic (multi-upload + drag & drop)
├── .env                 # API keys and environment configuration
```

---

## 📦 Installation

1. **Clone repository or copy files**
2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux/macOS
   venv\Scripts\activate.bat  # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

   If you don't have `requirements.txt`, install manually:
   ```
   flask
   flask-cors
   python-dotenv
   requests
   python-docx
   openai
   ```

4. **Create and fill `.env` file**:
   ```
  
   ```

---

## 🚀 Running the Application

1. Run backend in terminal:
   ```bash
   python app.py
   ```

2. Open `index.html` in browser (e.g. by double-clicking or through local server)

---

## 🧪 How to Use

- Drag and drop multiple `.mp3` files to the upload area
- System automatically:
  - Transcribes each file
  - Translates text to: 🇬🇧 English, 🇵🇱 Polish, 🇺🇦 Ukrainian, 🇷🇺 Russian
  - Creates `.docx` document with translations
  - Sends document to Dify

---

## ⚠️ Final Notes

- OpenAI key must support `whisper-1` and `gpt-4o` models
- Token limit applies (2048) – longer transcriptions may be truncated
- Dify accepts only properly formatted `.docx` documents

---
# 🇬🇧 Instructions – API Keys Configuration (OpenAI and Dify)

This document describes how to obtain the required configuration data to run the transcription and translation system.

---

## 🔑 1. OpenAI API Key (`OPEN_AI_API_KEY`)

1. Go to: [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Click "Create new secret key"
3. Copy the generated key (starts with `sk-`)
4. Paste it into `.env` file:

```
OPEN_AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📄 2. Dify Information

### A. Getting `DIFY_DATASET_ID`

1. Go to your Dify: `https://your-dify-url.com`
2. Click on "Datasets" tab
3. Create new dataset or select existing one
4. Go to dataset "Settings" and copy `Dataset ID`
5. Add to `.env`:

```
DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

### B. Creating `DIFY_API_KEY`

1. In Dify menu find "API Keys" section (e.g. in "Team Settings")
2. Create new key with file upload permissions
3. Copy generated key and add to `.env`:

```
DIFY_API_KEY=dify-sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### C. Setting `DIFY_API_URL`

1. Base address of your Dify instance is e.g.:

```
https://dify.yourdomain.com
```

2. API address:

```
https://dify.yourdomain.com/api/v1
```

3. Add to `.env`:

```
DIFY_API_URL=https://dify.yourdomain.com/api/v1
```

---

## ✅ Example `.env` file

```
OPEN_AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_KEY=dify-sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://dify.yourdomain.com/api/v1
DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Keep the `.env` file in the main project folder (at the same level as `app.py`).
