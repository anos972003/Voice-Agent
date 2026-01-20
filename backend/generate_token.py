#!/usr/bin/env python3
"""
Generate LiveKit access tokens for development/testing.
Usage: python generate_token.py <room_name> [participant_name]
"""

import sys
import os
from dotenv import load_dotenv
from livekit import api

load_dotenv()

def generate_token(room_name: str, participant_name: str = "user") -> str:
    """Generate a LiveKit access token."""
    
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not api_key or not api_secret:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in .env")
    
    token = api.AccessToken(api_key, api_secret)
    token.with_identity(participant_name)
    token.with_name(participant_name)
    token.with_grants(api.VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=True,
        can_subscribe=True,
    ))
    
    return token.to_jwt()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_token.py <room_name> [participant_name]")
        print("Example: python generate_token.py demo-room myuser")
        sys.exit(1)
    
    room_name = sys.argv[1]
    participant_name = sys.argv[2] if len(sys.argv) > 2 else "user"
    
    try:
        token = generate_token(room_name, participant_name)
        print(f"\n✅ Token generated successfully for room: {room_name}")
        print(f"👤 Participant: {participant_name}")
        print(f"\n🔑 Access Token:")
        print(token)
        print(f"\n📋 Copy this token and paste it into the frontend.\n")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
