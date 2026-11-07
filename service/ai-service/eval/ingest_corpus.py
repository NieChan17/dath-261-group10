import argparse
import json
import time
from pathlib import Path

from app.db import close_db, init_db
from app.ingest import IngestError, ingest_material


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m eval.ingest_corpus")
    parser.add_argument("corpus", type=Path, help="JSON list of {material_id, course_id, lesson_id, type, path}")
    args = parser.parse_args()

    root = args.corpus.parent
    materials = json.loads(args.corpus.read_text(encoding="utf-8"))
    init_db()
    started = time.perf_counter()
    total, skipped = 0, []
    try:
        for n, m in enumerate(materials, 1):
            try:
                count = ingest_material(
                    m["material_id"], m["course_id"], m.get("lesson_id"), m["type"], (root / m["path"]).read_bytes()
                )
            except IngestError as exc:
                skipped.append((m["path"], str(exc)))
                continue
            total += count
            print(f"[{n}/{len(materials)}] {m['course_id']} {m['path']}: {count} chunks", flush=True)
    finally:
        close_db()
    print(f"Ingested {total} chunks from {len(materials) - len(skipped)} materials in {time.perf_counter() - started:.0f}s")
    for path, reason in skipped:
        print(f"Skipped {path}: {reason}")


if __name__ == "__main__":
    main()
