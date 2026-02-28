from __future__ import annotations

import json
import os
import queue
import secrets
import sys
import threading

from flask import Flask, Response, jsonify, request, send_from_directory

sys.path.insert(0, ".")
from tva_session import TVASession
DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
app = Flask(__name__, static_folder=DIST, static_url_path="")

_sessions: dict[str, TVASession] = {}


# Routes

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path: str):
    """Serve the React SPA. API routes take priority (defined above this)."""
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404
    full = os.path.join(DIST, path)
    if path and os.path.exists(full):
        return send_from_directory(DIST, path)
    index = os.path.join(DIST, "index.html")
    if os.path.exists(index):
        return send_from_directory(DIST, "index.html")
    return (
        "React build not found. "
        "Run:  cd frontend && npm install && npm run build",
        404,
    )


@app.route("/api/start", methods=["POST"])
def start():
    data = request.get_json() or {}
    api_key     = (data.get("api_key")      or "").strip()
    goal        = (data.get("goal")         or "").strip()
    system_prompt = (data.get("system_prompt") or "").strip()

    if not api_key:
        return jsonify({"error": "API key is required."}), 400
    if not goal:
        return jsonify({"error": "Session goal is required."}), 400

    session_id = secrets.token_hex(16)
    try:
        tva = TVASession(goal=goal, system_prompt=system_prompt, api_key=api_key)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400

    _sessions[session_id] = tva
    return jsonify({"session_id": session_id, "state": json.loads(tva.state.to_json())})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    session_id = (data.get("session_id") or "").strip()
    message    = (data.get("message")    or "").strip()

    if session_id not in _sessions:
        return jsonify({"error": "Session not found. Please start a new session."}), 404
    if not message:
        return jsonify({"error": "Message cannot be empty."}), 400

    tva = _sessions[session_id]
    q: queue.Queue = queue.Queue()

    def run() -> None:
        try:
            reply, meta = tva.chat(
                message,
                on_token=lambda t: q.put({"type": "token", "text": t}),
            )
            q.put({
                "type": "done",
                # If correction ran, the reply text differs from what was streamed.
                # Send it back so the client can replace what was shown.
                "reply": reply,
                "meta": meta,
                "state": json.loads(tva.state.to_json()),
            })
        except Exception as exc:
            q.put({"type": "error", "error": str(exc)})
        finally:
            q.put(None)  # sentinel

    threading.Thread(target=run, daemon=True).start()

    def stream():
        while True:
            item = q.get()
            if item is None:
                break
            yield f"data: {json.dumps(item)}\n\n"

    return Response(
        stream(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",
            "Connection":       "keep-alive",
        },
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"TVASession running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
