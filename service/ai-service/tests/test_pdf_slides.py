import pymupdf

from app.parsing.pdf_slides import parse_pdf_slides


def _pdf(pages: list[str]) -> bytes:
    doc = pymupdf.open()
    for text in pages:
        page = doc.new_page()
        if text:
            page.insert_text((72, 72), text, fontsize=12)
    return doc.tobytes()


def test_one_chunk_per_slide_with_numbers_and_titles():
    chunks = parse_pdf_slides(_pdf(["Intro\nWhat is SE", "", "Processes\nWaterfall and agile"]))
    assert [c.slide_no for c in chunks] == [1, 3]
    assert [c.heading_path for c in chunks] == ["Intro", "Processes"]
    assert all(c.source_type == "slides" and c.page_no == c.slide_no for c in chunks)
