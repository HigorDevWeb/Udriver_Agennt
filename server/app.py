from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv
import tempfile
from flask_cors import CORS
import requests
from docx import Document

# Wczytaj zmienne z pliku .env
load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API_KEY")
DIFY_API_KEY = os.getenv("DIFY_API_KEY")
DIFY_API_URL = os.getenv("DIFY_API_URL")
DIFY_DATASET_ID = os.getenv("DIFY_DATASET_ID")

app = Flask(__name__)
CORS(app)

def tlumacz_tekst(tekst, jezyk_docelowy):
    import openai
    client = openai.OpenAI(api_key=os.getenv("OPEN_AI_API_KEY"))
    nazwy_jezykow = {
        "en": "angielski",
        "pl": "polski",
        "uk": "ukraiński",
        "ru": "rosyjski"
    }[jezyk_docelowy]
    odpowiedz = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"Przetłumacz na język {nazwy_jezykow} w sposób naturalny i profesjonalny."},
            {"role": "user", "content": tekst}
        ],
        max_tokens=2048,
        temperature=0.1,
    )
    return odpowiedz.choices[0].message.content.strip()

def generuj_docx(tlumaczenia, nazwa_bazowa):
    dokument = Document()
    dokument.add_heading('Transkrypcja Wielojęzyczna', 0)
    for jezyk, tresc in tlumaczenia.items():
        dokument.add_heading(jezyk, level=1)
        dokument.add_paragraph(tresc)
    nazwa_pliku = f"{nazwa_bazowa}_wielojezyczny.docx"
    dokument.save(nazwa_pliku)
    return nazwa_pliku

def wyslij_do_dify(nazwa_pliku_docx):
    url = f"{DIFY_API_URL}/datasets/{DIFY_DATASET_ID}/document/create-by-file"
    naglowki = {'Authorization': f'Bearer {DIFY_API_KEY}'}
    dane = {'data': '{"indexing_technique":"high_quality","process_rule":{"mode":"automatic"}}'}
    pliki = {
        'file': (nazwa_pliku_docx, open(nazwa_pliku_docx, 'rb'),
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }
    odpowiedz = requests.post(url, headers=naglowki, data=dane, files=pliki)
    return odpowiedz.status_code, odpowiedz.text

@app.route('/transcribe', methods=['POST'])
def transkrybuj_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'Brak pliku w żądaniu'}), 400

    plik = request.files['file']
    if plik.filename == '':
        return jsonify({'error': 'Nie wybrano pliku'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp:
        plik.save(temp.name)
        sciezka_pliku = temp.name

    try:
        with open(sciezka_pliku, "rb") as plik_audio:
            transkrypcja = openai.audio.transcriptions.create(
                model="whisper-1",
                file=plik_audio
            )
        tekst = transkrypcja.text

        # Tłumaczenie na 4 języki
        tlumaczenia = {
            "Portugalski": tekst,
            "Angielski": tlumacz_tekst(tekst, "en"),
            "Polski": tlumacz_tekst(tekst, "pl"),
            "Ukraiński": tlumacz_tekst(tekst, "uk"),
            "Rosyjski": tlumacz_tekst(tekst, "ru"),
        }

        # Generowanie dokumentu DOCX
        nazwa_bazowa = os.path.splitext(plik.filename)[0]
        nazwa_pliku_docx = generuj_docx(tlumaczenia, nazwa_bazowa)

        # Wysłanie dokumentu do Dify
        status, odpowiedz = wyslij_do_dify(nazwa_pliku_docx)
        print("Wysłano do Dify:", status, odpowiedz)

        return jsonify({
            'transkrypcja': tekst,
            'docx_wyslany': status == 200,
            'odpowiedz_dify': odpowiedz
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500
    finally:
        os.remove(sciezka_pliku)

if __name__ == '__main__':
    app.run(debug=True)
