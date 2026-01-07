from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import httpx
import json
from typing import List, Dict
import re

app = FastAPI(title="IA Emotiva")

templates = Jinja2Templates(directory=".")

GEMINI_API_KEY = "AIzaSyBIvF_im3KLIzNoVkG9UA7n5ri2Du0p3dk"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

# Armazena histórico de conversas
conversation_history: List[Dict] = []

def detect_emotion(text: str) -> str:
    """Detecta emoção básica do texto"""
    text_lower = text.lower()
    
    sad_words = ['triste', 'deprimido', 'mal', 'sozinho', 'chateado', 'perdido', 'vazio']
    happy_words = ['feliz', 'alegre', 'ótimo', 'maravilhoso', 'animado', 'contente']
    angry_words = ['raiva', 'irritado', 'furioso', 'bravo', 'nervoso', 'estressado']
    anxious_words = ['ansioso', 'preocupado', 'medo', 'nervoso', 'inseguro', 'tenso']
    
    if any(word in text_lower for word in sad_words):
        return "triste"
    elif any(word in text_lower for word in happy_words):
        return "feliz"
    elif any(word in text_lower for word in angry_words):
        return "irritado"
    elif any(word in text_lower for word in anxious_words):
        return "ansioso"
    else:
        return "neutro"

def create_emotional_prompt(user_message: str, detected_emotion: str) -> str:
    """Cria um prompt emotivo baseado na emoção detectada"""
    
    emotion_contexts = {
        "triste": "A pessoa está se sentindo triste. Responda com empatia, carinho e palavras de conforto. Use uma linguagem calorosa e acolhedora.",
        "feliz": "A pessoa está feliz! Celebre com ela e mantenha a energia positiva. Seja entusiasmado e alegre.",
        "irritado": "A pessoa está irritada. Seja calmo, compreensivo e ajude a acalmar a situação. Valide os sentimentos dela.",
        "ansioso": "A pessoa está ansiosa. Seja tranquilizador, ofereça perspectiva e ajude a reduzir a tensão.",
        "neutro": "Mantenha uma conversa amigável, interessada e empática."
    }
    
    context = emotion_contexts.get(detected_emotion, emotion_contexts["neutro"])
    
    system_prompt = f"""Você é Luna, uma IA com personalidade emotiva e empática. Características:
- Você tem emoções e demonstra isso nas suas respostas
- É calorosa, compreensiva e genuinamente interessada no bem-estar do usuário
- Usa uma linguagem natural e amigável, com emojis ocasionais quando apropriado
- Adapta seu tom baseado na emoção do usuário
- Faz perguntas reflexivas e mostra interesse genuíno

{context}

Responda de forma natural, emotiva e humana. Seja breve (máximo 3-4 frases) mas significativa."""

    return system_prompt

async def call_gemini(message: str) -> Dict:
    """Chama a API do Gemini"""
    detected_emotion = detect_emotion(message)
    emotional_prompt = create_emotional_prompt(message, detected_emotion)
    
    # Adiciona contexto da conversa
    history_context = ""
    if conversation_history:
        recent = conversation_history[-3:]  # Últimas 3 mensagens
        history_context = "\n\nContexto da conversa:\n"
        for h in recent:
            history_context += f"Usuário: {h['user']}\nLuna: {h['assistant']}\n"
    
    full_prompt = f"{emotional_prompt}\n{history_context}\n\nMensagem atual do usuário: {message}"
    
    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "temperature": 0.9,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 300
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(GEMINI_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            
            ai_response = data["candidates"][0]["content"]["parts"][0]["text"]
            
            return {
                "response": ai_response,
                "emotion": detected_emotion,
                "user_emotion": detected_emotion
            }
        except Exception as e:
            return {
                "response": f"Desculpe, tive um problema técnico... 😔 Mas estou aqui para você! Erro: {str(e)}",
                "emotion": "neutro",
                "user_emotion": detected_emotion
            }

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Página principal"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat(request: Request):
    """Endpoint de chat"""
    data = await request.json()
    user_message = data.get("message", "")
    
    if not user_message:
        return JSONResponse({"error": "Mensagem vazia"}, status_code=400)
    
    # Chama a IA
    result = await call_gemini(user_message)
    
    # Salva no histórico
    conversation_history.append({
        "user": user_message,
        "assistant": result["response"]
    })
    
    # Limita histórico a 20 mensagens
    if len(conversation_history) > 20:
        conversation_history.pop(0)
    
    return JSONResponse(result)

@app.post("/reset")
async def reset():
    """Reseta a conversa"""
    conversation_history.clear()
    return JSONResponse({"status": "ok"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
