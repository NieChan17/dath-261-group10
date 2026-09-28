import pytest


@pytest.fixture
def make_hit():
    from app.retrieval import Hit

    def factory(id_, **kwargs):
        fields = dict(
            material_id="m", lesson_id=None, source_type="notes", content="text", slide_no=None, page_no=None,
            ts_start=None, ts_end=None, heading_path=None, cosine=0.5,
        )
        fields.update(kwargs)
        return Hit(id_, **fields)

    return factory
