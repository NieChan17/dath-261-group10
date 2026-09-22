from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_CHARS = 2000
OVERLAP_CHARS = 200


def split_text(text: str, chunk_size: int = CHUNK_CHARS) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=min(OVERLAP_CHARS, chunk_size // 4)
    )
    return [part for part in splitter.split_text(text) if part.strip()]
