# MySQL Web Client

A modern, web-based interface to execute MySQL queries with ease. This project features a secure Express backend and a premium Vite frontend with command history support.

## Features

- **Secure Execution**: Only allows `SELECT` queries to prevent accidental or malicious data modification.
- **Command History**: Navigate through your previous queries using `Arrow Up` and `Arrow Down` keys, just like a real SQL terminal.
- **Real-time Results**: Renders database rows automatically into a clean, modern table.
- **MySQL Error Emulation**: Displays detailed error messages (Error Code, SQL State) when a query fails.
- **Premium Design**: Dark mode aesthetic with glassmorphism effects.

## Setup

1.  **Clone the project** to your local machine.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure environment variables**:
    Create or edit the `.env` file in the root directory with your MySQL credentials:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=your_database
    PORT=3000
    ```

## Launch

### Start the Backend
```bash
npm run server
```

### Start the Frontend
```bash
npm run front
```

Open your browser at the URL provided by Vite (usually `http://localhost:5173`).

## Note
Currently, this tool is restricted to `SELECT` operations for security and demonstration purposes.

TEAM MEMBERS: PAULA ANDREA RODRIGUEZ
              JUAN JOSE GIRALDO MUÑOZ
