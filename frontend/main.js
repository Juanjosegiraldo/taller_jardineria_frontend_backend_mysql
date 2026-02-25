/**
 * Dom Elements
 * Selecting the core UI components for interaction
 */
const queryInput = document.getElementById('query-input');
const sendBtn = document.getElementById('send-btn');
const errorDisplay = document.getElementById('error-display');
const tableHead = document.getElementById('table-head');
const tableBody = document.getElementById('table-body');
const historyList = document.getElementById('history-list');

// Command History State
let commandHistory = [];
let historyIndex = -1;

/**
 * addToHistory
 * Updates the local history array and triggers a re-render of the history pane.
 * Ensures the index is reset to the end of the list.
 */
const addToHistory = (query) => {
    if (!query || commandHistory[commandHistory.length - 1] === query) return;
    commandHistory.push(query);
    historyIndex = commandHistory.length;
    renderHistory();
};

/**
 * renderHistory
 * Displays clickable history items in the sidebar/bottom section.
 */
const renderHistory = () => {
    historyList.innerHTML = '';
    commandHistory.forEach((cmd, idx) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = cmd;
        item.onclick = () => {
            queryInput.value = cmd;
            historyIndex = idx;
        };
        historyList.appendChild(item);
    });
};

/**
 * Keyboard Event Listener: Navigation
 * Mimics SQL Terminal behavior:
 * - ArrowUp: Goes back in command history.
 * - ArrowDown: Goes forward in command history.
 */
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            queryInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            queryInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            queryInput.value = ''; // Reset when reaching the bottom
        }
    }
});

/**
 * renderTable
 * Dynamically builds a HTML table based on the database response fields and rows.
 */
const renderTable = (data, fields) => {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // If no results are returned (empty set)
    if (!data || data.length === 0) {
        errorDisplay.textContent = 'Empty set (0.00 sec)';
        errorDisplay.style.color = 'var(--text-secondary)';
        return;
    }

    // Headers: Mapping the column names
    const headRow = document.createElement('tr');
    fields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field;
        headRow.appendChild(th);
    });
    tableHead.appendChild(headRow);

    // Body: Mapping the row data
    data.forEach(row => {
        const tr = document.createElement('tr');
        fields.forEach(field => {
            const td = document.createElement('td');
            td.textContent = row[field];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    // Status line: Similar to MySQL CLI success message
    errorDisplay.textContent = `${data.length} rows in set`;
    errorDisplay.style.color = 'var(--text-secondary)';
};

/**
 * sendQuery
 * Main logic to communicate with the Express server.
 * Handles the POST request and UI state updates.
 */
const sendQuery = async () => {
    const query = queryInput.value.trim();
    if (!query) return;

    // Reset UI before request
    errorDisplay.textContent = 'Executing query...';
    errorDisplay.style.color = 'var(--accent)';

    try {
        const response = await fetch('http://localhost:3000/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        // Handle logical errors (SQL syntax, forbidden commands)
        if (!response.ok) {
            errorDisplay.textContent = result.error || 'Unknown error occurred.';
            errorDisplay.style.color = 'var(--error-red)';
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';
            return;
        }

        // Handle success
        addToHistory(query);
        renderTable(result.data, result.fields);

    } catch (err) {
        // Handle network/connection errors
        errorDisplay.textContent = `Failed to connect to server: ${err.message}`;
        errorDisplay.style.color = 'var(--error-red)';
    }
};

// Button Click Event
sendBtn.addEventListener('click', sendQuery);

/**
 * Allow Ctrl+Enter shortcut for power users
 */
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        sendQuery();
    }
});
