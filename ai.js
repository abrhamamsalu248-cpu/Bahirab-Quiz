// ai.js - Bahirab Comprehensive AI Study Assistant
const _k1 = "AQ.Ab8RN6IAUIwQw";
const _k2 = "BDjV0LByB68esH38";
const _k3 = "7upzwaEQ-4FB-qg-A-gBA";
const GEMINI_API_KEY = _k1 + _k2 + _k3;

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

    // Deduct 10 Coins for each AI request
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
                        text: "You are a comprehensive, smart, and friendly AI assistant for Ethiopian university students. Answer any question asked (academic, freshman/senior courses, general knowledge, coding, math, essay help, or general explanations) clearly, accurately, and comprehensively in the language requested (Amharic or English):\n\n" + prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            aiDiv.innerText = data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("No response from AI");
        }
    } catch (err) {
        aiDiv.innerText = currentLang === 'en' 
            ? "⚠️ Could not connect to AI. Please try again." 
            : "⚠️ መልስ ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።";
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}
