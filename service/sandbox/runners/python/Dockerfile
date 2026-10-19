FROM python:3.11-alpine

# Create a restricted non-root group and user
RUN addgroup -S runner && adduser -S runner -G runner

# Set working directory and switch user
WORKDIR /workspace
USER runner

# Disable bytecode caching and unbuffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

CMD ["python3"]