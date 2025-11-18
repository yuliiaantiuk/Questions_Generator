from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

# Завантажуємо ключ з .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("Не знайдено OPENAI_API_KEY у .env")

openai.api_key = OPENAI_API_KEY

app = FastAPI()

class TTSPayload(BaseModel):
    text: str
    language: str = "uk"  # 'uk' або 'en'

@app.post("/synthesize")
async def synthesize(payload: TTSPayload):
    text = payload.text
    lang = payload.language.lower()

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Вибір голосу — gpt-4o-mini-tts підтримує будь-яку мову
    voice = "alloy"  # рекомендований природний голос

    try:
        # Виклик OpenAI TTS
        response = openai.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice=voice,
            input=text
        )
        # Записуємо в mp3
        filename = f"tts_{lang}_{abs(hash(text))}.mp3"
        filepath = os.path.join("audio_cache", filename)
        os.makedirs("audio_cache", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(response.read())  # response містить байти mp3

        return {"success": True, "filename": filename, "path": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
