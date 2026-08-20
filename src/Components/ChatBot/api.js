const API_URL = "http://localhost:8000/chat";

export async function sendMessageToAI(message) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to connect to server");
    }

    const data = await response.json();

    return data.reply;
  } catch (error) {
    console.error(error);

    return "⚠️ Sorry, I couldn't reach the server right now.";
  }
}