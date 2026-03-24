export default async function handler(req, res) {
  if (req.method === "POST") {
    const { message } = req.body;

    try {
      // Access your Groq API key from environment variables
      const apiKey = process.env.GROQ_API_KEY;

      // Call Groq API (replace with the correct endpoint if different)
      const response = await fetch("https://api.groq.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",   // Example model, adjust as needed
          messages: [
            { role: "system", content: "You are a helpful chatbot." },
            { role: "user", content: message }
          ],
          max_tokens: 200
        })
      });

      const data = await response.json();

      // Send back Groq’s reply
      res.status(200).json({ reply: data.choices[0].message.content });
    } catch (error) {
      console.error("Groq API error:", error);
      res.status(500).json({ error: "Failed to fetch response from Groq AI" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
