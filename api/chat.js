I see what you’re building — a simple API route handler that proxies requests to Groq’s LLaMA model. Nicely structured! There are just a couple of small issues in your code that will cause errors:

### 🔧 Issues
1. **Authorization header formatting**  
   You wrote:
   ```js
   "Authorization": Bearer ${process.env.GROQ_API_KEY},
   ```
   This will throw a syntax error. It should be a string with template literals:
   ```js
   "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
   ```

2. **Response parsing**  
   Groq’s API returns completions in the format:
   ```json
   {
     "choices": [
       {
         "message": {
           "role": "assistant",
           "content": "..."
         }
       }
     ]
   }
   ```
   Your code correctly checks `data.choices`, but make sure you access `data.choices[0].message.content`.

3. **Error handling**  
   Right now you return the raw `data` object if `choices` is missing. It might be cleaner to log it and send a simpler error message back to the client.

---

### ✅ Fixed Version
Here’s a corrected version of your handler:

```js
export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("Groq API error:", data);
      return res.status(500).json({ error: "Invalid response from Groq API" });
    }

    res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

