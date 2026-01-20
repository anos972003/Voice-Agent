import { useState, useEffect } from 'react'
import { Room } from 'livekit-client'
import './VoiceAgent.css'

function VoiceAgent() {
    const [roomName, setRoomName] = useState('')
    const [token, setToken] = useState('')
    const [room, setRoom] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState('')
    const [transcript, setTranscript] = useState([])
    const [showTranscript, setShowTranscript] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Connect to LiveKit Room
    const connectToRoom = async () => {
        if (!roomName.trim()) {
            setError('Please enter a room name')
            return
        }

        setIsConnecting(true)
        setError('')

        try {
            const newRoom = new Room()

            // Set up event listeners
            newRoom.on('connected', () => {
                console.log('Connected to room:', roomName)
                setIsConnected(true)
                setIsConnecting(false)
                addTranscript('System', 'Connected to voice agent')
            })

            newRoom.on('disconnected', () => {
                console.log('Disconnected from room')
                setIsConnected(false)
                addTranscript('System', 'Disconnected from voice agent')
            })

            newRoom.on('participantConnected', (participant) => {
                console.log('Participant connected:', participant.identity)
                addTranscript('System', `Agent joined: ${participant.identity}`)
            })

            newRoom.on('trackSubscribed', (track, publication, participant) => {
                console.log('Track subscribed:', track.kind, 'from', participant.identity)

                if (track.kind === 'audio') {
                    const audioElement = track.attach()
                    document.body.appendChild(audioElement)

                    // Monitor speaking status
                    track.on('started', () => setIsSpeaking(true))
                    track.on('ended', () => setIsSpeaking(false))
                }
            })

            newRoom.on('dataReceived', (payload, participant) => {
                const message = new TextDecoder().decode(payload)
                console.log('Data received:', message)
                addTranscript(participant?.identity || 'Agent', message)
            })

            // Generate token (for development, you'd call your backend)
            // This is a simplified version - in production, get token from your backend
            const wsUrl = import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'
            const accessToken = token || await generateToken(roomName)

            // Connect to room
            await newRoom.connect(wsUrl, accessToken)
            setRoom(newRoom)

        } catch (err) {
            console.error('Failed to connect:', err)
            setError(`Connection failed: ${err.message}`)
            setIsConnecting(false)
        }
    }

    // Disconnect from room
    const disconnectFromRoom = async () => {
        if (room) {
            await room.disconnect()
            setRoom(null)
            setIsConnected(false)
            setTranscript([])
        }
    }

    // Generate access token (simplified - in production, call your backend)
    const generateToken = async (roomName) => {
        // For development: you can use LiveKit CLI to generate tokens
        // or implement a token server endpoint
        // This is a placeholder - you'll need to replace with actual token generation
        return token || 'your-access-token'
    }

    // Add transcript entry
    const addTranscript = (speaker, message) => {
        const entry = {
            speaker,
            message,
            timestamp: new Date().toLocaleTimeString()
        }
        setTranscript(prev => [...prev, entry])
    }

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (room) {
                room.disconnect()
            }
        }
    }, [room])

    return (
        <div className="voice-agent-container">
            <div className="card glass">
                {!isConnected ? (
                    <div className="connect-form">
                        <h2>Connect to Voice Agent</h2>

                        <div className="form-group">
                            <label htmlFor="roomName">Room Name</label>
                            <input
                                id="roomName"
                                type="text"
                                className="input"
                                placeholder="Enter room name (e.g., my-voice-room)"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && connectToRoom()}
                                disabled={isConnecting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="token">Access Token (Optional)</label>
                            <input
                                id="token"
                                type="text"
                                className="input"
                                placeholder="Leave empty for dev mode"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                disabled={isConnecting}
                            />
                            <p className="helper-text">
                                For development, leave empty. For production, provide a LiveKit access token.
                            </p>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            className="btn btn-primary"
                            onClick={connectToRoom}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <span className="spinner"></span> Connecting...
                                </>
                            ) : (
                                'Connect & Start Talking'
                            )}
                        </button>

                        <div className="info-card mt-lg">
                            <h3>📋 How to Use</h3>
                            <ol>
                                <li>Make sure the backend agent is running</li>
                                <li>Enter a room name (or use default)</li>
                                <li>Click "Connect & Start Talking"</li>
                                <li>Allow microphone permissions when prompted</li>
                                <li>Start speaking - the agent will respond!</li>
                            </ol>
                        </div>
                    </div>
                ) : (
                    <div className="agent-interface">
                        <div className="flex justify-between items-center mb-lg">
                            <div>
                                <h2>Voice Agent Active</h2>
                                <div className="status-indicator status-connected">
                                    <span className="status-dot"></span>
                                    Connected to {roomName}
                                </div>
                            </div>
                            <button
                                className="btn btn-danger"
                                onClick={disconnectFromRoom}
                            >
                                Disconnect
                            </button>
                        </div>

                        <div className="agent-status">
                            <div className="status-card">
                                <div className="status-label">Agent Status</div>
                                <div className="status-value">
                                    {isSpeaking ? (
                                        <>
                                            <div className="audio-wave">
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                                <div className="audio-bar"></div>
                                            </div>
                                            <span className="ml-sm">Speaking...</span>
                                        </>
                                    ) : (
                                        '🎧 Listening'
                                    )}
                                </div>
                            </div>

                            <div className="status-card">
                                <div className="status-label">Microphone</div>
                                <div className="status-value">🎤 Active</div>
                            </div>
                        </div>

                        <div className="controls mt-lg">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowTranscript(!showTranscript)}
                            >
                                {showTranscript ? '📝 Hide' : '📝 Show'} Transcript
                            </button>
                        </div>

                        {showTranscript && (
                            <div className="transcript-panel mt-lg">
                                <h3>Conversation Transcript</h3>
                                <div className="transcript-content">
                                    {transcript.length === 0 ? (
                                        <p className="text-muted">No messages yet. Start speaking!</p>
                                    ) : (
                                        transcript.map((entry, idx) => (
                                            <div key={idx} className="transcript-entry">
                                                <div className="transcript-meta">
                                                    <span className="transcript-speaker">{entry.speaker}</span>
                                                    <span className="transcript-time">{entry.timestamp}</span>
                                                </div>
                                                <div className="transcript-message">{entry.message}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="info-note mt-lg">
                            <strong>💡 Try asking:</strong> "What is an Electronic Speed Controller?" or
                            "Explain yaw control on a drone" to see RAG in action!
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VoiceAgent
