# Demo Script - Voice Agent Testing

This script guides you through testing the voice agent system and demonstrating its RAG capabilities.

## Pre-Demo Checklist

- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Environment variables configured in `backend/.env`
- [ ] Microphone and speakers/headphones working
- [ ] Two terminal windows ready

## Demo Flow

### Part 1: System Startup (2 minutes)

**Terminal 1 - Start Backend:**
```bash
cd backend
source venv/bin/activate
python agent.py dev
```

**Expected Output:**
```
RAG Index built with 12 documents.
INFO:livekit.agents:Starting LiveKit agent...
INFO:drone-agent:Connecting to room...
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

**Expected:** Browser opens to `http://localhost:3000`

### Part 2: Connect to Agent (1 minute)

1. In browser, enter room name: `demo-room`
2. Leave token field empty (dev mode)
3. Click **"Connect & Start Talking"**
4. Allow microphone permissions
5. Wait for "Connected" status

**Expected Frontend:**
- Status shows "Connected to demo-room"
- "🎧 Listening" indicator visible
- No errors in browser console

**Expected Backend:**
- Log: `User connected: [participant-id]`

### Part 3: Basic Voice Interaction (2 minutes)

**Test 1: Simple greeting**
- Say: *"Hello, can you hear me?"*
- Expected: Agent responds with voice greeting
- Visual: Audio wave animation appears

**Test 2: General conversation**
- Say: *"What can you help me with?"*
- Expected: Agent explains its drone expertise

### Part 4: RAG Demonstration (5 minutes)

**Test 3: ESC Question**
- Say: *"What is an Electronic Speed Controller?"*
- Backend log shows: `RAG Tool Triggered: Electronic Speed Controller`
- Agent response includes: *"The ESC regulates power from the battery to the brushless motors..."*

**Test 4: Flight Physics**
- Say: *"How does yaw control work on a quadcopter?"*
- Backend log shows: `RAG Tool Triggered: yaw control`
- Agent explains: *"Yaw is achieved by torque imbalance between CW and CCW motors..."*

**Test 5: Regulations**
- Say: *"What are the FAA altitude limits for drones?"*
- Backend log shows: `RAG Tool Triggered: FAA altitude limits`
- Agent mentions: *"400 feet above ground level..."*

**Test 6: Multiple questions**
- Say: *"Tell me about brushless motors and their KV ratings"*
- Verify agent uses knowledge base for technical details

### Part 5: UI Features (1 minute)

**Enable Transcript:**
1. Click **"Show Transcript"** button
2. Continue conversation
3. Verify messages appear in transcript panel
4. Check timestamps and speaker labels

**Disconnect:**
1. Click **"Disconnect"** button
2. Verify connection closed cleanly
3. Backend logs participant disconnect

## Demo Talking Points

### For Evaluators

**Architecture Highlights:**
> "This system uses LiveKit Agents with Google's Gemini Live API, which replaces the traditional STT-LLM-TTS pipeline with a unified streaming API. This reduces latency significantly."

**RAG Integration:**
> "The agent has access to a FAISS-based knowledge base. When you ask technical questions, Gemini automatically calls a function tool that retrieves relevant context using semantic search with sentence transformers."

**Real-time Performance:**
> "Notice the low latency - we're getting responses in under 1 second. The audio streaming is bidirectional and continuous, allowing for natural conversation flow."

**Production Ready:**
> "The frontend is built with React and LiveKit's client SDK. It's responsive, works on mobile, and includes features like transcript display and connection management."

## Troubleshooting During Demo

### No audio from agent
- Check browser audio settings
- Verify headphones/speakers connected
- Look for audio track subscription in browser console

### RAG not triggering
- Use more specific technical questions
- Mention keywords from knowledge base (ESC, yaw, GPS, etc.)
- Check backend console for function call logs

### Connection fails
- Verify backend is running and shows "Connecting to room"
- Check `.env` variables are correct
- Try a different room name
- Check browser console for errors

## Additional Demo Scenarios

### Scenario A: Knowledge Base Limitation
- Ask: *"What's the weather like today?"*
- Expected: Agent responds but without RAG (general knowledge)
- Point: RAG is only used for domain-specific questions

### Scenario B: Follow-up Questions
- Ask: *"What is an IMU?"*
- Then: *"How does it differ from GPS?"*
- Expected: Agent maintains context across questions

### Scenario C: Interrupt Handling
- Start speaking while agent is talking
- Expected: Agent should handle interruption gracefully (Gemini Live feature)

## Post-Demo Discussion Points

1. **Scalability**: "We can deploy multiple agent instances, add load balancing, and scale to hundreds of concurrent users."

2. **Customization**: "The knowledge base can be swapped for any domain - customer support FAQs, medical information, legal documents, etc."

3. **Advanced Features**: "We could add sentiment analysis, multi-language support, voice cloning, or integration with external APIs."

4. **Cost Efficiency**: "Using Gemini's free tier for development, and LiveKit Cloud free tier. Production costs scale with usage."

## Success Criteria

✅ Agent responds to voice input consistently
✅ RAG system triggers on technical questions
✅ Responses demonstrate knowledge base usage
✅ UI is responsive and intuitive
✅ No critical errors during demo
✅ Latency is acceptable (<2 seconds)

---

**Estimated Total Demo Time: 10-15 minutes**
