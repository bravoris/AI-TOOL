ECHO Running Docker images
docker run -p 5173:5173 -d ai-tool-frontend
docker run -p 5000:5000 -d ai-tool-backend
PAUSE