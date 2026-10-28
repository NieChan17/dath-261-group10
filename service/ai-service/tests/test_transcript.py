from app.parsing.transcript import parse_cues, parse_transcript

VTT = """WEBVTT

1
00:00:00.000 --> 00:00:30.000
<v Lecturer>First part of the talk.

2
00:00:30.000 --> 00:01:05.000
Second part ends a sentence.

3
00:01:05.000 --> 00:01:40.000
Third part keeps going

4
00:01:40.000 --> 00:02:50.000
and finishes here.
"""

SRT = """1
00:00:01,500 --> 00:00:04,250
Hello from an SRT file.

2
01:00:00,000 --> 01:00:02,000
One hour later.
"""


def test_parse_vtt_cues_strips_tags_and_reads_times():
    cues = parse_cues(VTT)
    assert len(cues) == 4
    assert cues[0].text == "First part of the talk."
    assert cues[1].start == 30.0 and cues[1].end == 65.0


def test_parse_srt_with_comma_millis_and_hours():
    cues = parse_cues(SRT)
    assert [c.start for c in cues] == [1.5, 3600.0]
    assert cues[0].end == 4.25


def test_windows_close_at_sentence_end_after_target():
    chunks = parse_transcript(VTT, target_seconds=60, max_seconds=90)
    assert [(c.ts_start, c.ts_end) for c in chunks] == [(0.0, 65.0), (65.0, 170.0)]
    assert chunks[0].content == "First part of the talk. Second part ends a sentence."
    assert all(c.source_type == "transcript" for c in chunks)


def test_windows_force_close_at_max_duration():
    chunks = parse_transcript(VTT, target_seconds=1000, max_seconds=90)
    assert [(c.ts_start, c.ts_end) for c in chunks] == [(0.0, 100.0), (100.0, 170.0)]
