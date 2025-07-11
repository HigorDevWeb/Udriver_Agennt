🇵🇱 Instrukcja uruchomienia systemu transkrypcji i tłumaczenia audio
Ten system umożliwia użytkownikowi przesyłanie wielu plików audio (MP3), ich transkrypcję za pomocą OpenAI Whisper, tłumaczenie transkrypcji na różne języki i wysyłkę wyników do Dify (platformy zarządzania wiedzą).

✅ Wymagania wstępne
Python 3.10 lub nowszy

Node.js (jeśli chcesz używać backendu z frontendem w jednym projekcie)

Wirtualne środowisko Python (venv)

Konto w OpenAI oraz klucz API

Konto w Dify i skonfigurowany dataset

📁 Struktura plików
bash
Copy
Edit
├── app.py               # Backend Flask – obsługuje transkrypcję, tłumaczenia, upload do Dify
├── index.html           # Interfejs użytkownika (frontend)
├── styles.css           # Stylizacja interfejsu
├── script.js            # Logika frontendowa (upload, drag & drop)
├── .env                 # Klucze API i konfiguracje środowiskowe
📦 Instalacja
Sklonuj repozytorium lub skopiuj pliki

Utwórz wirtualne środowisko i aktywuj je:

bash
Copy
Edit
python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate.bat  # Windows
Zainstaluj zależności:

bash
Copy
Edit
pip install -r requirements.txt
Jeśli nie masz requirements.txt, dodaj:

nginx
Copy
Edit
flask
flask-cors
python-dotenv
requests
python-docx
openai
Uzupełnij plik .env:

ini
Copy
Edit
OPEN_AI_API_KEY=twój_klucz_openai
DIFY_API_KEY=twój_klucz_dify
DIFY_API_URL=https://twój.dify.app/api/v1
DIFY_DATASET_ID=twój_dataset_id
🚀 Uruchomienie aplikacji
W terminalu uruchom backend:

bash
Copy
Edit
python app.py
Otwórz index.html w przeglądarce (np. dwuklik lub serwer lokalny)

🧪 Jak korzystać
Przeciągnij i upuść wiele plików MP3 do pola uploadu

System automatycznie:

Transkrybuje każdy plik

Tłumaczy tekst na: 🇬🇧 angielski, 🇵🇱 polski, 🇺🇦 ukraiński, 🇷🇺 rosyjski

Generuje plik .docx z tłumaczeniami

Wysyła dokument do Dify

⚠️ Uwagi końcowe
API OpenAI musi mieć dostęp do modelu whisper-1 oraz gpt-4o

Limit tokenów wynosi 2048 – długie transkrypcje mogą być ucinane

Dify przyjmuje tylko .docx z poprawnym formatowaniem
