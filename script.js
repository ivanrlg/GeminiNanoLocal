let timeout;

document.getElementById('prompt').addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const prompt = document.getElementById('prompt').value;
        const responseDiv = document.getElementById('response');
        
        if (prompt.trim() === '') {
            responseDiv.textContent = '';
            return;
        }

        responseDiv.textContent = 'Waiting for response...';

        try {
            const canCreate = await window.ai.canCreateTextSession();
            
            if (canCreate !== "no") {
                const session = await window.ai.createTextSession();
                responseDiv.textContent = ''; // Clear previous response
                const stream = session.promptStreaming(prompt);

                let result = '';
                let previousLength = 0;
                for await (const chunk of stream) {
                    const newContent = chunk.slice(previousLength);
                    previousLength = chunk.length;
                    result += newContent;
                    responseDiv.textContent = result;
                }
            } else {
                responseDiv.textContent = 'Cannot create text session.';
            }
        } catch (error) {
            console.error(error);
            responseDiv.textContent = 'Error: ' + error.message;
        }
    }, 500); // Delay in milliseconds
});
