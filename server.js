import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public'))); // serve frontend

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/chat", async (req, res) => {
  try {
    const { chat, message } = req.body;

    const messages = chat.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    }));
    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages
    });

    const reply = completion.choices[0].message.content;

    // Optional: title for first message
    let title = null;
    if(chat.length === 0){
      const titleCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: `Suggest a short title for this conversation: "${message}"` }
        ],
      });
      title = titleCompletion.choices[0].message.content;
    }

    res.json({ reply, title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI did not respond. (Error)" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
