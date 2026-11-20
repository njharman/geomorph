port := "8000"

# Serve the site locally and print the URL
serve:
    @echo "http://localhost:{{port}}/"
    python3 -m http.server -d cube {{port}}

# Run the model tests (Node 20+)
test:
    npm test
