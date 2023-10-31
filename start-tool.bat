@ECHO OFF
ECHO Running Docker images
docker run -p 5173:5173 --rm -d ai-tool-frontend
docker run -p 5000:5000 --rm -d ai-tool-backend
ECHO Press Enter to EXIT
PAUSE
