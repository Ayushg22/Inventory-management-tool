# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose Cloud Run default port
ENV PORT=8080

# Start with Gunicorn (production WSGI server)
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]