# 🇵🇱 Instrukcja Uruchomienia – System Transkrypcji i Tłumaczeń Audio

Ten system umożliwia użytkownikom przesyłanie wielu plików audio (MP3), transkrybowanie ich za pomocą OpenAI Whisper, tłumaczenie transkrypcji na wiele języków oraz przesyłanie wyników do platformy Dify.

---

## ✅ Wymagania

1. Python 3.10 lub nowszy  
2. Node.js (opcjonalnie – jeśli chcesz integrować z innymi usługami frontendowymi)  
3. Wirtualne środowisko Pythona (`venv`)  
4. Konto OpenAI z kluczem API  
5. Konto Dify z odpowiednio skonfigurowanym datasetem  

---

## 📁 Struktura Plików

```
├── app.py               # Backend Flask – obsługuje transkrypcję, tłumaczenia i wysyłkę do Dify
├── index.html           # Interfejs frontendowy
├── styles.css           # Style interfejsu
├── script.js            # Logika frontendowa (multi-upload + drag & drop)
├── .env                 # Klucze API i konfiguracja środowiska
```

---

## 📦 Instalacja

1. **Sklonuj repozytorium lub skopiuj pliki**
2. **Utwórz i aktywuj środowisko wirtualne**:
   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux/macOS
   venv\Scripts\activate.bat  # Windows
   ```

3. **Zainstaluj zależności**:
   ```bash
   pip install -r requirements.txt
   ```

   Jeśli nie masz `requirements.txt`, zainstaluj ręcznie:
   ```
   flask
   flask-cors
   python-dotenv
   requests
   python-docx
   openai
   ```

4. **Utwórz i uzupełnij plik `.env`**:
   ```
   OPEN_AI_API_KEY=twoj_klucz_openai
   DIFY_API_KEY=twoj_klucz_dify
   DIFY_API_URL=https://twoj-dify-url.com/api/v1
   DIFY_DATASET_ID=twoje_id_datasetu
   ```

---

## 🚀 Uruchomienie Aplikacji

1. Uruchom backend w terminalu:
   ```bash
   python app.py
   ```

2. Otwórz `index.html` w przeglądarce (np. klikając dwukrotnie lub przez lokalny serwer)

---

## 🧪 Jak Używać

- Przeciągnij i upuść wiele plików `.mp3` na obszar przesyłania
- System automatycznie:
  - Transkrybuje każdy plik
  - Tłumaczy tekst na: 🇬🇧 Angielski, 🇵🇱 Polski, 🇺🇦 Ukraiński, 🇷🇺 Rosyjski
  - Tworzy dokument `.docx` z tłumaczeniami
  - Przesyła dokument do Dify

---

## ⚠️ Uwagi Końcowe

- Klucz OpenAI musi obsługiwać modele `whisper-1` oraz `gpt-4o`
- Obowiązuje limit tokenów (2048) – dłuższe transkrypcje mogą być ucięte
- Dify akceptuje tylko odpowiednio sformatowane dokumenty `.docx`

---
