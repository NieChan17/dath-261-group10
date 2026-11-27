# AI Service — Grounded Teaching Assistant (prototype)

Python/FastAPI microservice for the Track 1 advanced component. It ingests course materials, stores chunk embeddings in PostgreSQL + pgvector, runs course-scoped hybrid retrieval and streams cited answers to the lesson side-drawer.

Related issues: #115 (chunking and ingestion), #117 (retrieval guardrails and out-of-scope fallback), #122 (RAGAS evaluation).

> **Prototype status.** Ingestion, hybrid retrieval, the out-of-scope gate, feedback and the review queue are real.
> Answers are written by an LLM from the retrieved chunks only: Gemini through the API, or a local model served by
> Ollama (`LLM_PROVIDER`). `"mode"` in the `done` event is the model name. Without a Gemini key, or when the LLM
> call fails, a **mock** extracts sentences from the top-ranked chunk (`"mode": "mock-extractive"`).

## Architecture

```text
Instructor upload ──> NestJS ──POST /ingest──> ai-service ──parse, chunk, embed──> material_embedding (pgvector)
Student question  ──> NestJS ──POST /ask────> ai-service ──hybrid search──> SSE: token / citation / done
                      (JWT + enrollment check)                            └─> query_audit_log
```

The service is internal: only the NestJS backend should call it. Set `AI_INTERNAL_TOKEN` and send it as the
`X-Internal-Token` header; when the variable is empty (local development) the check is skipped.

## Quick start (Docker)

Run these commands from the repository root:

```bash
cp .env.example .env
```

Edit `.env`: change `DB_PASSWORD` (letters and digits only). If port `5432` or `8000` is already in use on your machine,
change `DB_PORT` or `AI_PORT`; both ports are published on `127.0.0.1` only.

```bash
docker compose up -d --build postgres rag-service
```

The first start downloads the embedding model (BGE-M3, about 2 GB) into the `hf_models` volume; follow it with
`docker compose logs -f rag-service`. `GET /health` reports `"embedder": "loading"` until the model is ready.
Interactive API docs: http://localhost:8000/docs (or your `AI_PORT`).

For a faster first run, use a small English-only model instead (the vector dimension must match):

```bash
EMBED_MODEL=sentence-transformers/all-MiniLM-L6-v2 EMBED_DIM=384 docker compose up -d --build postgres rag-service
```

Changing `EMBED_DIM` later requires recreating the `material_embedding` table (for example `docker compose down -v`,
which also deletes the database volume).

### Load the sample course

```bash
docker compose exec rag-service python -m app.cli ingest sample_data/system-modeling-slides.pdf \
  --type slides --material-id se-slides-05 --course-id CO3001 --lesson-id L05
docker compose exec rag-service python -m app.cli ingest sample_data/software-processes-notes.md \
  --type notes --material-id se-notes-02 --course-id CO3001 --lesson-id L02
docker compose exec rag-service python -m app.cli ingest sample_data/requirements-engineering-lecture.vtt \
  --type transcript --material-id se-video-03 --course-id CO3001 --lesson-id L03
```

The sample materials are original content written for this project. `sample_data/build_sample_slides.py` regenerates the PDF.

### Try it

```bash
curl -s localhost:8000/search -H "Content-Type: application/json" \
  -d '{"course_id": "CO3001", "query": "What is the main drawback of the waterfall model?"}'

curl -N localhost:8000/ask -H "Content-Type: application/json" \
  -d '{"course_id": "CO3001", "lesson_id": "L03", "question": "What is the difference between a goal and a requirement?", "video_time": 70}'
```

In Windows PowerShell, call `curl.exe` and escape the inner quotes as `\"`.

## Run without Docker

Start a PostgreSQL server with pgvector first (for example the `postgres` service above). Then, in `service/ai-service`:

```bash
python -m venv .venv
source .venv/Scripts/activate      # Git Bash; PowerShell: .\.venv\Scripts\Activate.ps1; macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env               # fill in DATABASE_URL
uvicorn app.main:app --port 8000
```

To ingest through the API outside Docker, also set `FILE_ROOT` in `.env` to the absolute path of `sample_data`;
the CLI (`python -m app.cli ingest ...`) reads local files directly and does not need it.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/ingest` | Queue ingestion of `{material_id, course_id, lesson_id, type, file_url}`; returns a job (`202`) |
| `GET` | `/ingest/{job_id}` | Job status: `queued`, `processing`, `ready`, `failed` |
| `DELETE` | `/materials/{material_id}` | Remove every chunk of a hidden or deleted material |
| `POST` | `/search` | Retrieval only, for debugging and evaluation |
| `POST` | `/ask` | Server-Sent Events stream of the answer |
| `POST` | `/feedback` | Thumbs up/down (`rating`: `1` or `-1`); a thumbs-down flags the answer |
| `GET` | `/review?course_id=…` | Flagged questions for instructor review |
| `GET` | `/health` | Liveness and embedding-model state (no token required) |

`type` is `slides` (PDF), `notes` (Markdown or plain text) or `transcript` (WebVTT or SRT).
`file_url` accepts `https://` (for example a signed R2/S3 URL) or `file://` paths inside `FILE_ROOT`.

### `/ask` event stream

```text
event: token
data: {"text": "Verification asks "}

event: citation
data: {"index": 1, "chunk_id": 12, "material_id": "se-notes-02", "lesson_id": "L02", "source_type": "notes",
       "label": "Software Processes > Verification and Validation", "slide_no": null, "page_no": null,
       "ts_start": null, "ts_end": null, "cosine": 0.71}

event: done
data: {"answer_id": "…", "in_scope": true, "top_score": 0.71, "suggest_forum": false,
       "mode": "mock-extractive", "first_token_ms": 84, "total_ms": 91}
```

When the best cosine similarity is below `OOS_THRESHOLD`, the answer is a refusal, no citations are sent,
`suggest_forum` is `true` and the question is flagged for instructor review. The same happens when the LLM replies
that the chunks do not contain the answer, or answers without citing any chunk.

The LLM sees the top `TOP_K` chunks numbered `[1]`…`[n]`. The service keeps only the chunks the answer cites and
renumbers them in order of first use, so `[1]` in the text is always the first `citation` event.

## Retrieval

1. Embed the question (plus highlighted text, if any) with the configured model.
2. Top candidates by pgvector cosine distance (HNSW index), always filtered by `course_id`.
3. Top candidates by PostgreSQL full-text search (`websearch_to_tsquery('simple', …)`, ranked with `ts_rank_cd`).
4. Fuse both lists with Reciprocal Rank Fusion (`RRF_K`), add small boosts for the current lesson and for
   transcript windows around `video_time`, keep `TOP_K`.

Chunking: one chunk per slide; Markdown split by heading, then by a recursive character splitter
(2,000 characters, 200 overlap); transcripts grouped into 60–90 second windows that end on a sentence.

## Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `APP_ENV` | `development` | `development`, `staging` or `production`; outside development the service refuses to start without `INTERNAL_TOKEN` |
| `DATABASE_URL` | *(required)* | Set by docker compose; for local runs copy `.env.example` to `.env` |
| `INTERNAL_TOKEN` | *(empty)* | Shared secret with the NestJS backend (`AI_INTERNAL_TOKEN` in the root `.env`) |
| `EMBED_MODEL` / `EMBED_DIM` | `BAAI/bge-m3` / `1024` | Must match each other |
| `OOS_THRESHOLD` | `0.55` | Lowest value that refused every out-of-scope question in the #122 baseline (95.4% of in-scope questions answered) |
| `LLM_PROVIDER` | `gemini` | `gemini` (API) or `ollama` (local model) |
| `LLM_MODEL` | `gemini-3.5-flash-lite` | Model that writes the answer, for example `qwen2.5:7b` with Ollama |
| `GEMINI_API_KEY` | *(empty)* | Key from Google AI Studio; with `gemini` and no key the mock answer is used |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama server; compose uses `http://host.docker.internal:11434` |
| `TOP_K`, `CANDIDATE_POOL`, `RRF_K` | `5`, `20`, `60` | Retrieval tuning |
| `LESSON_BOOST`, `VIDEO_WINDOW_BOOST` | `0.005`, `0.005` | Added to the fused RRF score |
| `FILE_ROOT`, `MAX_DOWNLOAD_MB` | `/app/sample_data`, `50` | Limits for `file_url` |

## Tests

```bash
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

The unit tests cover the parsers, chunking, rank fusion, boosts, citation labels, the mock answer and the citation
handling of the LLM answer (with a fake client), and need no database or API key.

## Answer quality (RAGAS)

`python -m eval.run_ragas --provider gemini|ollama --model <name>` answers the 87 in-scope #122 questions and
scores each answer with RAGAS (`pip install -r eval/requirements.txt`). Results from 24/11, top 5 hybrid chunks,
`OOS_THRESHOLD` 0.55, judge `gemini-3.5-flash-lite`:

| Answer model | Answered | Refused by the model | Faithfulness | Answer relevancy | Median answer time |
|---|---|---|---|---|---|
| `gemini-3.5-flash-lite` (API) | 75 | 3 | 1.000 | 0.929 | 1.5 s |
| `qwen2.5:7b` (Ollama, RTX 3070 Ti) | 74 | 9 | 0.967 | 0.936 | 1.2 s |

On the 70 questions both models answered, faithfulness is 1.000 vs 0.965 and answer relevancy 0.935 vs 0.942.
Four questions were refused by the out-of-scope gate for both models; 5 Gemini answers hit the free-tier daily quota
and were not scored. The judge is a Gemini model, so it may favour Gemini answers.

## Known limitations

- Hybrid retrieval is not better than vector-only on the #122 questions (Hit@1 78.2% vs 80.5%). Joining the
  keywords with OR lowered hybrid Hit@1 to 58.6%; dropping stop words but keeping AND only matched vector-only.
- `OOS_THRESHOLD = 0.55` was calibrated on 106 BK-LMS questions; the highest out-of-scope question scored 0.532 and the lowest in-scope one 0.525, so a few in-scope questions are still refused.
- The mock answer uses only the top chunk; the refusal message is English only.
- The LLM answer is generated in full and then streamed word by word, so `first_token_ms` includes the whole
  LLM call. With Gemini on the free tier, course chunks are sent to Google and rate limits apply.
- `qwen2.5:7b` wrote 4 of its 30 Vietnamese answers partly in Chinese, and refused 5 questions that Gemini
  answered; RAGAS scored one of the Chinese answers 0 for faithfulness but did not flag the others.
- Ingestion jobs are kept in memory, and a question is logged only after its answer stream finishes.
- The API has no automated tests yet; it was checked manually with FastAPI's `TestClient`.

## Next steps

- #117: agree the ingestion hook and table ownership with the backend, then open the pull request.
