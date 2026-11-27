import httpx

from app.generation import (
    REFUSAL,
    citation_label,
    format_timestamp,
    llm_answer,
    mock_answer,
    ollama_complete,
    renumber_citations,
    stream_words,
)


def test_citation_labels(make_hit):
    assert citation_label(make_hit(1, source_type="slides", slide_no=4)) == "Slide 4"
    assert citation_label(make_hit(1, source_type="transcript", ts_start=75.0)) == "Timestamp 01:15"
    assert citation_label(make_hit(1, heading_path="Processes > Waterfall")) == "Processes > Waterfall"
    assert format_timestamp(3725) == "1:02:05"


def test_mock_answer_cites_top_hits_and_streams_losslessly(make_hit):
    hits = [make_hit(i, content="First sentence. Second sentence.") for i in range(5)]
    answer, cited = mock_answer(hits, max_chars=20)
    assert answer == "First sentence. [1]"
    assert [h.id for h in cited] == [0, 1, 2]
    assert "".join(stream_words(answer)) == answer


def fake_llm(text, prompts):
    def complete(prompt):
        prompts.append(prompt)
        return text

    return complete


def test_renumber_citations_keeps_only_cited_excerpts(make_hit):
    hits = [make_hit(i) for i in range(1, 6)]
    answer, cited = renumber_citations("Waterfall is linear [3]. It is rigid [1][3][7].", hits)
    assert answer == "Waterfall is linear [1]. It is rigid [2][1]."
    assert [h.id for h in cited] == [3, 1]


def test_llm_answer_numbers_excerpts_and_refuses_without_citations(make_hit):
    hits = [make_hit(1, content="Plan first."), make_hit(2, source_type="slides", slide_no=4, content="Then build.")]
    prompts = []
    assert llm_answer(fake_llm("Build after planning [2].", prompts), "Order?", hits) == (
        "Build after planning [1].", [hits[1]]
    )
    assert "[2] (Slide 4)\nThen build." in prompts[0]
    assert llm_answer(fake_llm("NOT_FOUND", prompts), "Order?", hits) == (REFUSAL, [])
    assert llm_answer(fake_llm("Build after planning.", prompts), "Order?", hits) == (REFUSAL, [])


def test_ollama_complete_posts_one_chat_message(monkeypatch):
    sent = {}

    def post(url, json, timeout):
        sent.update(url=url, body=json)
        return httpx.Response(200, json={"message": {"content": "Answer [1]."}}, request=httpx.Request("POST", url))

    monkeypatch.setattr(httpx, "post", post)
    assert ollama_complete("http://ollama:11434/", "qwen2.5:7b")("Prompt") == "Answer [1]."
    assert sent["url"] == "http://ollama:11434/api/chat"
    assert sent["body"]["model"] == "qwen2.5:7b"
    assert sent["body"]["messages"] == [{"role": "user", "content": "Prompt"}]
    assert sent["body"]["stream"] is False
