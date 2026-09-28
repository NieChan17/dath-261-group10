import pytest

from app.retrieval import apply_boosts, rrf_fuse


def test_rrf_rewards_items_found_by_both_rankers():
    scores = rrf_fuse([[1, 2, 3], [3, 4]], k=60)
    assert max(scores, key=scores.get) == 3
    assert scores[1] == pytest.approx(1 / 61)


def test_lesson_and_video_boosts(make_hit):
    in_lesson = make_hit(1, lesson_id="L1", source_type="transcript", ts_start=60.0, ts_end=120.0)
    other = make_hit(2, lesson_id="L2")
    apply_boosts([in_lesson, other], "L1", 100.0, lesson_boost=0.01, video_window_boost=0.02)
    assert in_lesson.score == pytest.approx(0.03)
    assert other.score == 0.0
