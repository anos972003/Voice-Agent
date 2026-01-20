import asyncio
import logging
import os
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import AgentSession
from livekit.plugins import groq, deepgram, elevenlabs, silero

from rag import RAGSystem

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("drone-agent")

# Lazy-load RAG system (to avoid slow worker initialization)
_rag_system = None

def get_rag_system():
    global _rag_system
    if _rag_system is None:
        logger.info("Loading RAG system (one-time initialization)...")
        _rag_system = RAGSystem()
        logger.info("RAG system loaded successfully")
    return _rag_system


class DroneAssistant(agents.Agent):
    """Drone assistant with RAG capabilities"""
    
    def __init__(self):
        super().__init__(
            instructions="""You are a helpful drone operations assistant with access to technical drone information.
You can answer questions about drone physics, specifications, regulations, and operations.
When users ask technical questions, use the lookup_drone_info function to retrieve accurate information.
Keep your responses concise and clear.""",
        )

    @llm.function_tool(description="Lookup technical drone information including physics, specifications, and regulations.")
    async def lookup_drone_info(self, query: str) -> str:
        """RAG tool for retrieving drone information"""
        logger.info(f"RAG Tool Triggered: {query}")
        rag = get_rag_system()  # Lazy load on first use
        result = rag.retrieve(query)
        return result


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice agent"""
    logger.info(f"Connecting to room {ctx.room.name}")
    
    # Create agent session with FREE providers that actually work
    session = AgentSession(
        stt=deepgram.STT(),         # Deepgram STT (200 hours/month FREE)
        llm=groq.LLM(               # Groq LLM (14,400 req/day FREE)
            model="llama-3.1-8b-instant",
            api_key=os.getenv("GROQ_API_KEY"),
        ),
        tts=elevenlabs.TTS(),       # ElevenLabs TTS (10,000 chars/month FREE)
        vad=silero.VAD.load(),      # Voice Activity Detection
    )
    
    # Start the session
    await session.start(
        room=ctx.room,
        agent=DroneAssistant(),
    )
    
    # Greet the user
    await session.generate_reply(
        instructions="Greet the user warmly and let them know you're ready to assist with drone-related questions."
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))