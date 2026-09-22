from app.parsing.splitter import CHUNK_CHARS
from app.parsing.text_notes import parse_text_notes

NOTES = """Intro line before any heading.

# Processes
Overview of processes.

## Waterfall
Plan-driven model.

### Drawbacks
Hard to change.

## Agile
Iterative model.
"""


def test_heading_paths_follow_nesting():
    chunks = parse_text_notes(NOTES)
    assert [c.heading_path for c in chunks] == [
        None,
        "Processes",
        "Processes > Waterfall",
        "Processes > Waterfall > Drawbacks",
        "Processes > Agile",
    ]


def test_heading_text_is_kept_in_content():
    chunks = parse_text_notes(NOTES)
    assert chunks[2].content == "Waterfall\nPlan-driven model."
    assert chunks[0].content == "Intro line before any heading."


def test_long_section_is_split_and_every_part_keeps_its_title():
    text = "# Long\n" + " ".join(f"Sentence {i} explains one idea." for i in range(300))
    chunks = parse_text_notes(text)
    assert len(chunks) > 1
    assert all(c.heading_path == "Long" for c in chunks)
    assert all(c.content.startswith("Long\n") and len(c.content) > len("Long\n") for c in chunks)
    assert all(len(c.content) <= CHUNK_CHARS for c in chunks)


def test_heading_without_text_produces_no_chunk():
    chunks = parse_text_notes("# Course\n## Lesson 1\nContent of lesson one.")
    assert [c.heading_path for c in chunks] == ["Course > Lesson 1"]
