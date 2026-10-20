from app.generation import citation_label, format_timestamp, mock_answer, stream_words


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
