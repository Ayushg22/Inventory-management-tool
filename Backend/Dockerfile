# Use official Python base image
FROM python:3.10

# Set working directory in container
WORKDIR /app

# Copy all app code
COPY . .

# Copy GCP credentials file (already done correctly)
COPY nice-height-460409-m5-07d79cfef52b.json /app/credentials.json

# Set environment variable for Google Cloud SDK
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Make Flask listen on all interfaces
ENV FLASK_RUN_HOST=0.0.0.0

# Optional: explicitly expose the port
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]