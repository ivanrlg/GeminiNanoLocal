let timeout;
let selectedMode = 'normal';

document.querySelectorAll('.mode-button').forEach(button => {
    button.addEventListener('click', () => {
        selectedMode = button.getAttribute('data-mode');
        document.querySelectorAll('.mode-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Send prompt again when mode is changed
        sendPrompt();
    });
});

document.getElementById('prompt').addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(sendPrompt, 500); // Delay in milliseconds
});

async function sendPrompt() {
    const prompt = document.getElementById('prompt').value;
    const responseDiv = document.getElementById('response');
    const responseTimeDiv = document.getElementById('response-time');
    
    if (prompt.trim() === '') {
        responseDiv.textContent = '';
        responseTimeDiv.textContent = '';
        return;
    }

    responseDiv.textContent = 'Waiting for response...';

    try {
        const startTime = new Date().getTime();
        const canCreate = await window.ai.canCreateTextSession();
        
        if (canCreate !== "no") {
            const session = await window.ai.createTextSession();
            responseDiv.textContent = ''; // Clear previous response
            const stream = session.promptStreaming(`${selectedMode}: ${prompt}`);

            let result = '';
            let previousLength = 0;
            for await (const chunk of stream) {
                const newContent = chunk.slice(previousLength);
                previousLength = chunk.length;
                result += newContent;
                responseDiv.textContent = result;

                // Scroll to the bottom after updating the text content
                const scrollDiv = document.createElement('div');
                responseDiv.appendChild(scrollDiv);
                scrollDiv.scrollIntoView({ behavior: 'smooth' });
            }
            const endTime = new Date().getTime();
            const responseTime = endTime - startTime;
            responseTimeDiv.textContent = `${responseTime}ms`;
        } else {
            responseDiv.textContent = 'Cannot create text session.';
            responseTimeDiv.textContent = '';
        }
    } catch (error) {
        console.error(error);
        responseDiv.textContent = 'Error: ' + error.message;
        responseTimeDiv.textContent = '';
    }
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds} PM`;
    document.getElementById('clock').textContent = timeString;
    
    const dateString = now.toDateString();
    document.getElementById('date').textContent = dateString;

    const userAgent = navigator.userAgent;
    const chromeVersion = userAgent.match(/Chrome\/[\d.]+/)[0];
    document.getElementById('browser-info').textContent = chromeVersion;
}

async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('ip-address').textContent = `IP Address: ${data.ip}`;
    } catch (error) {
        console.error('Error fetching IP address:', error);
    }
}

setInterval(updateClock, 1000);
updateClock(); // Initial call to set the clock immediately
getIPAddress(); // Fetch IP address on load
