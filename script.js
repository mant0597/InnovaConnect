// Developer: Add Log
document.getElementById('logForm')?.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const progress = document.getElementById('progress').value;
    const createdBy = document.getElementById('createdBy').value;
    const projectId = document.getElementById('projectId').value;

    fetch('/logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            description,
            progress,
            createdBy,
            projectId
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);  // Display a success message
        // Optional: Clear form or refresh logs
        document.getElementById('logForm').reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add log');
    });
});

// Investor: Subscribe to Project
document.getElementById('subscribeForm')?.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission

    const investorId = document.getElementById('investorId').value;
    const projectId = document.getElementById('projectId').value;

    fetch('/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            investorId,
            projectId
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);  // Display a success message
        // Automatically fetch logs after subscribing
        fetchInvestorLogs(investorId);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to subscribe');
    });
});

// Function to fetch logs for subscribed projects
function fetchInvestorLogs(investorId) {
    if (!investorId) return;

    fetch(`/investor/logs/${investorId}`)
        .then(response => response.json())
        .then(data => {
            const logsContainer = document.getElementById('investorLogs');
            if (logsContainer) {
                logsContainer.innerHTML = '';  // Clear previous logs
                if (data.length === 0) {
                    logsContainer.innerHTML = '<p>No logs found for your subscribed projects.</p>';
                } else {
                    data.forEach(log => {
                        logsContainer.innerHTML += `
                            <div class="log-entry">
                                <h3>${log.title}</h3>
                                <p>${log.description}</p>
                                <p>Progress: ${log.progress || 'N/A'}</p>
                                <p>Created by: ${log.created_by}</p>
                                <p>Project ID: ${log.project_id}</p>
                            </div>
                        `;
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching logs:', error);
            alert('Failed to fetch logs');
        });
}

// Auto-fetch logs on investor page load
document.addEventListener('DOMContentLoaded', () => {
    const investorId = document.getElementById('investorId');
    if (investorId) {
        investorId.addEventListener('change', () => {
            fetchInvestorLogs(investorId.value);
        });
    }
});