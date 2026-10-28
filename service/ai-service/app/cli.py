import argparse
from pathlib import Path

from .db import close_db, init_db
from .ingest import ingest_material


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="command", required=True)

    ingest = sub.add_parser("ingest", help="Ingest a local file into the vector store")
    ingest.add_argument("path", type=Path)
    ingest.add_argument("--material-id", required=True)
    ingest.add_argument("--course-id", required=True)
    ingest.add_argument("--lesson-id")
    ingest.add_argument("--type", required=True, choices=["slides", "notes", "transcript"])

    args = parser.parse_args()
    init_db()
    try:
        count = ingest_material(args.material_id, args.course_id, args.lesson_id, args.type, args.path.read_bytes())
        print(f"Ingested {count} chunks from {args.path} as {args.material_id}")
    finally:
        close_db()


if __name__ == "__main__":
    main()
