import './App.css'
import VoiceAgent from './components/VoiceAgent'

function App() {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>🎙️ Voice Agent</h1>
                <p className="subtitle">LiveKit × Gemini Live API with RAG</p>
            </header>

            <main className="app-main">
                <VoiceAgent />
            </main>

            <footer className="app-footer">
                <p>Powered by <strong>LiveKit Agents</strong> + <strong>Google Gemini 2.0</strong></p>
            </footer>
        </div>
    )
}

export default App
