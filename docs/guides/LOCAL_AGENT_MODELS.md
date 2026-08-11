# Local Agent models (free)

JobJitsu’s Agent runs **on your machine** via [Ollama](https://ollama.com). Résumé text and job details stay local — Ollama is contacted only at `127.0.0.1`.

## 1. Install Ollama (free)

| OS | Where |
|----|--------|
| macOS / Windows / Linux | Download the app from **https://ollama.com/download** |

After install, confirm in a terminal:

```bash
ollama --version
```

Keep the Ollama app running while you use JobJitsu.

## 2. Pull a free model

These are free to download from Ollama’s library (no API key). Pick by RAM:

| Model (save this name in Preferences) | Approx. size | Good when |
|---------------------------------------|--------------|-----------|
| **`qwen2.5:3b`** (recommended start) | ~2 GB | 8 GB+ RAM — solid résumé/cover-letter drafts |
| **`llama3.2:3b`** | ~2 GB | 8 GB+ RAM — general local craft |
| **`phi3:mini`** | ~2.3 GB | 8 GB+ RAM — compact Microsoft Phi |
| **`qwen2.5:7b`** | ~4.7 GB | 16 GB+ RAM — stronger writing quality |
| **`llama3.1:8b`** | ~4.7 GB | 16 GB+ RAM — stronger general quality |

Pull one (example — recommended):

```bash
ollama pull qwen2.5:3b
```

List what you have:

```bash
ollama list
```

Smoke-test in the terminal (optional):

```bash
ollama run qwen2.5:3b "Write one calm résumé summary sentence for a staff engineer."
```

## 3. Point JobJitsu at the model

1. Open **Preferences**
2. Under **On-device Agent model**, choose an installed model from the list (Refresh if you just pulled one)
3. Save — chrome should move toward **Agent · On-device** when Ollama is up

## 4. Privacy notes

- JobJitsu talks to Ollama only on **localhost** (`127.0.0.1:11434`)
- No JobJitsu cloud holds your résumé
- Agent prepares drafts; it does **not** send applications for you
- Optional remote providers are Experimental and must stay opt-in (not this guide)

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| Agent · Unavailable | Start the Ollama app; run `ollama list` |
| Model not found | `ollama pull <name>`, then Refresh list and choose it in Preferences |
| Slow first reply | First load pulls weights into memory — wait, then retry |
| Want better quality | Pull `qwen2.5:7b` or `llama3.1:8b` if you have RAM |

## Craft chat (PE28-S03)

On **Craft**, after drafts exist, use **Refine with Agent** for a focused edit. If the résumé/JD is thin or the request asks to invent experience, Agent asks clarifying questions instead of fabricating facts. Nothing is sent from Craft.

## Related

- Epic: PE28 Local Craft Studio (#101)
- Story: PE05-S06 real on-device Agent (#102)
- Story: PE05-S07 list local Ollama models (#112)
- Story: PE28-S03 craft chat refine (#105)
- Architecture: [AI_ARCHITECTURE.md](../architecture/AI_ARCHITECTURE.md)
