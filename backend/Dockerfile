FROM python:3.13-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install dependencies (no venv in container)
RUN poetry config virtualenvs.create false && \
    poetry install --no-root

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["poetry", "run", "python", "main.py"]
