CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    file_url TEXT,
    transcript TEXT,
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_materials_file_or_transcript
        CHECK (file_url IS NOT NULL OR transcript IS NOT NULL)
);

CREATE TABLE material_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    chunk_content TEXT NOT NULL,
    embedding VECTOR,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_lesson_id ON materials(lesson_id);
CREATE INDEX idx_material_embeddings_material_id ON material_embeddings(material_id);
CREATE INDEX idx_material_embeddings_metadata ON material_embeddings USING GIN(metadata_json);
