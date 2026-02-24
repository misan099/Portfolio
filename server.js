const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

app.use(express.json({ limit: "256kb" }));
app.use(express.static(__dirname));

const profileContext = `
You are MIsan Rijal's portfolio AI assistant.
Keep answers concise, friendly, and recruiter-focused.
Never invent details.

Profile:
- Name: MIsan Rijal
- Target Role: Python Developer Intern / Software Engineer Intern
- School: Minnesota State University, Mankato
- Degree: B.S. Computer Information Technology
- Skills: Java, Python, JavaScript, TypeScript, C++, React, Node.js, Express, PostgreSQL, MySQL, Git/GitHub
- Projects:
  1) Lost and Found MNSU (collaborative campus utility app)
  2) Recommendation Engine Experiment (AI-powered suggestion feature integration)
- Experience:
  - Broadcasting / Streaming Technician at Maverick Visual Productions (Oct 2023 - Present)
  - Led live event streaming workflows and troubleshooting across AV, IT, and networking systems.
  - Integrated AI captioning into live streaming workflows to improve accessibility.
  - Tools used: OBS, vMix, DaVinci Resolve, ATEM switchers, Blackmagic Studio 4K cameras.
- Reference:
  - Robert Petersen (robert.petersen@mnsu.edu)
- Contact:
  - Email: misanbugrijal@gmail.com
  - LinkedIn: https://www.linkedin.com/in/misanrijal/
  - GitHub: https://github.com/misan099
- Availability: Actively open to internship opportunities.
`;

app.post("/api/ai", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({ error: "OPENAI_API_KEY is not configured." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          { role: "system", content: profileContext },
          { role: "user", content: question }
        ],
        max_output_tokens: 220
      })
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({ error: "AI provider error.", details });
    }

    const data = await response.json();
    const answer = data?.output_text?.trim();

    if (!answer) {
      return res.status(502).json({ error: "No AI response generated." });
    }

    return res.json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "Server error.", details: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio running on http://localhost:${PORT}`);
});
