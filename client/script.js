document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('file');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.text();
        document.getElementById('message').textContent = result;
    } catch (error) {
        document.getElementById('message').textContent = 'Failed to upload file';
    }
});

document.getElementById('runScript').addEventListener('click', async () => {
    const script = document.getElementById('script').value;

    try {
        const response = await fetch('/run-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ script })
        });

        const result = await response.json();
        document.getElementById('output').textContent = result.output || result.error;
    } catch (error) {
        document.getElementById('output').textContent = 'Failed to run script';
    }
});

const socket = io();
socket.on('script-output', (output) => {
    document.getElementById('output').textContent = output;
});
