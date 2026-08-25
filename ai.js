// ai.js - Bahirab Comprehensive AI Study Assistant
const _k1 = "AQ.Ab8RN6JxsvK";
const _k2 = "HS20poZEGYHTtY";
const _k3 = "_lSyQ4CdSNqPT0";
const _k4 = "NyL08b5Kz8w";
const GEMINI_API_KEY = _k1 + _k2 + _k3 + _k4;

async function sendAiMessage() {
    const inputEl = document.getElementById('aiInput');
    const prompt = inputEl.value.trim();
    if (!prompt) return;

    if (userCoins < 10) {
        const alertMsg = currentLang === 'en' 
            ? "⚠️ Not enough Coins! 1 question requires 10 Coins. Watch an ad to earn Coins." 
            : "⚠️ በቂ Coins የለዎትም! 1 ጥያቄ ለመጠየቅ 10 Coins ያስፈልጋል። ማስታወቂያ አይተው Coins ያግኙ።";
        alert(alertMsg);
        return;
    }

    // Deduct 10 Coins
    updateCoins(-10);

    const chatBox = document.getElementById('aiChatBox');

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user';
    userDiv.innerText = prompt;
    chatBox.appendChild(userDiv);
    inputEl.value = '';

    // Append Loading Indicator
    const aiDiv = document.createElement('div');
    aiDiv.className = 'chat-msg ai';
    aiDiv.innerText = currentLang === 'en' ? "Thinking... ⏳" : "መልስ እየተዘጋጀ ነው... ⏳";
    chatBox.appendChild(aiDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "You are a comprehensive, smart, and friendly AI study assistant for Ethiopian university students. Answer any question asked (academic, freshman/senior courses, general knowledge, coding, problem-solving, or general explanations) clearly, concisely, and accurately in the requested language (Amharic or English):\n\n" + prompt
                    }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            aiDiv.innerText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            aiDiv.innerText = `⚠️ API Error: ${data.error.message || data.error.status}`;
        } else {
            throw new Error("No response content");
        }
    } catch (err) {
        aiDiv.innerText = `⚠️ Error: ${err.message || 'Connection failed'}`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}
