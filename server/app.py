from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv
import tempfile
from flask_cors import CORS
import requests
from docx import Document

# Carrega variáveis do .env
load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API_KEY")
DIFY_API_KEY = os.getenv("DIFY_API_KEY")
DIFY_API_URL = os.getenv("DIFY_API_URL")
DIFY_DATASET_ID = os.getenv("DIFY_DATASET_ID")

app = Flask(__name__)
CORS(app)

def traduzir(texto, idioma_destino):
    import openai
    client = openai.OpenAI(api_key=os.getenv("OPEN_AI_API_KEY"))
    idioma_nome = {
        "en": "inglês",
        "pl": "polonês",
        "uk": "ucraniano",
        "ru": "russo"
    }[idioma_destino]
    chat_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": f"Traduza para {idioma_nome} de forma natural e profissional."},
            {"role": "user", "content": texto}
        ],
        max_tokens=2048,
        temperature=0.1,
    )
    return chat_response.choices[0].message.content.strip()


def gerar_docx(traducoes, filename_base):
    doc = Document()
    doc.add_heading('Transcrição Multilíngue', 0)
    for idioma, texto in traducoes.items():
        doc.add_heading(idioma, level=1)
        doc.add_paragraph(texto)
    nome_arquivo = f"{filename_base}_multilingue.docx"
    doc.save(nome_arquivo)
    return nome_arquivo

def enviar_para_dify(nome_arquivo_docx):
    url = f"{DIFY_API_URL}/datasets/{DIFY_DATASET_ID}/document/create-by-file"
    headers = {'Authorization': f'Bearer {DIFY_API_KEY}'}
    data = {'data': '{"indexing_technique":"high_quality","process_rule":{"mode":"automatic"}}'}
    files = {
        'file': (nome_arquivo_docx, open(nome_arquivo_docx, 'rb'),
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }
    resp = requests.post(url, headers=headers, data=data, files=files)
    return resp.status_code, resp.text

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp:
        file.save(temp.name)
        temp_path = temp.name

    try:
        with open(temp_path, "rb") as audio_file:
            transcription = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        text = transcription.text

        # Traduzir para 4 idiomas
        traducoes = {
            "Português": text,
            "Inglês": traduzir(text, "en"),
            "Polonês": traduzir(text, "pl"),
            "Ucraniano": traduzir(text, "uk"),
            "Russo": traduzir(text, "ru"),
        }

        # Gerar DOCX
        filename_base = os.path.splitext(file.filename)[0]
        nome_arquivo_docx = gerar_docx(traducoes, filename_base)

        # Enviar para o Dify
        status, resposta = enviar_para_dify(nome_arquivo_docx)
        print("Envio para Dify:", status, resposta)

        return jsonify({
            'transcription': text,
            'docx_sent': status == 200,
            'dify_response': resposta
        })

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500
    finally:
        os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True)
