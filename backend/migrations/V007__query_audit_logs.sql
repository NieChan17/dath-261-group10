CREATE TABLE query_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    response_text TEXT,
    similarity_score NUMERIC(6,5) CHECK (
        similarity_score IS NULL OR (similarity_score >= 0 AND similarity_score <= 1)
    ),
    feedback_rating INTEGER CHECK (feedback_rating IS NULL OR feedback_rating BETWEEN 1 AND 5),
    source_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_query_audit_logs_user_id ON query_audit_logs(user_id);
CREATE INDEX idx_query_audit_logs_created_at ON query_audit_logs(created_at DESC);
