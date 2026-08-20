from fastapi import APIRouter
from app.schemas.chatbot_schema import (
    ChatRequest,
    ChatResponse
)

router = APIRouter(
    prefix="/chatbot",
    tags=["AI Chatbot"]
)


@router.post("/", response_model=ChatResponse)
def chatbot(request: ChatRequest):

    message = request.message.lower().strip()

    if "makeup" in message:
        return {
            "reply": "Searching Makeup Artists..."
        }

    elif "mehendi" in message:
        return {
            "reply": "Searching Mehendi Artists..."
        }

    elif "photographer" in message:
        return {
            "reply": "Searching Photographers..."
        }

    elif "decorator" in message:
        return {
            "reply": "Searching Decorators..."
        }

    elif "catering" in message:
        return {
            "reply": "Searching Catering Services..."
        }

    elif "register" in message:
        return {
            "reply": "You can register as a provider from the registration page."
        }

    elif "hello" in message or "hi" in message:
        return {
            "reply": "Hello! Welcome to NaariBazar. How can I help you today?"
        }

    elif "thank you" in message or "thanks" in message:
        return {
            "reply": "You're welcome! 😊"
        }

    return {
        "reply": "Sorry, I couldn't understand your request. Please try searching for a service like Makeup, Mehendi, Photography, Decoration or Catering."
    }