# Acme Explorer

Acme Explorer is a web application designed for explorers, managers, sponsors, and administrators to manage trips, sponsorships, and applications. It provides features such as trip management, saved trips, user authentication, and more.

---

## Features

- **Explorers**: Search and save trips, manage applications.
- **Managers**: Create and manage trips, view applications.
- **Sponsors**: Manage sponsorships.
- **Administrators**: Access dashboards, manage users, and more.
- **Dark Mode**: Toggle between light and dark themes.
- **Multi-language Support**: Switch between English (EN) and Spanish (ES).

---

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v16 or higher) and **npm** (Node Package Manager)
   - [Download Node.js](https://nodejs.org/)
2. **Angular CLI** (v14 or higher)
   - Install globally using:
     ```bash
     npm install -g @angular/cli
     ```

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Acme-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Starting the Project

The project requires both the Angular frontend and the JSON server to run simultaneously. Follow these steps:

1. **Start the Development Server**:
   Run the following command to start both the Angular app and the JSON server:
   ```bash
   npm start
   ```
   This will:
   - Start the Angular app at `http://localhost:4200`
   - Start the JSON server at `http://localhost:3000`

2. **Access the Application**:
   Open your browser and navigate to:
   - Angular App: [http://localhost:4200](http://localhost:4200)
   - JSON Server: [http://localhost:3000](http://localhost:3000)

---

## Key Scripts

- **Start the project**:
  ```bash
  npm start
  ```
- **Run only the Angular app**:
  ```bash
  ng serve
  ```
- **Run only the JSON server**:
  ```bash
  npm run json-server
  ```
- **Build the project**:
  ```bash
  npm run build
  ```
- **Run tests**:
  ```bash
  npm test
  ```

---

## Mock Backend (JSON Server)

The JSON server is used to simulate a backend for development purposes. The mock data is stored in `src/assets/json-server/db.json`.

- To modify the mock data, edit the `db.json` file.
- Restart the JSON server after making changes:
  ```bash
  npm run json-server
  ```

---

## Authentication

The project uses Firebase Authentication for user login and registration. Ensure you have configured Firebase in the project:

1. Go to the Firebase Console: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Create a new project and enable Authentication.
3. Replace the Firebase configuration in `src/environments/environment.ts` with your Firebase project details.

---

## Troubleshooting

- **Port Conflicts**: If `http://localhost:4200` or `http://localhost:3000` is already in use, stop the conflicting process or change the port in the respective configurations.
- **Missing Dependencies**: Run `npm install` to ensure all dependencies are installed.
- **JSON Server Issues**: Ensure `db.json` is correctly formatted as valid JSON.

---

## License

This project is licensed under the MIT License.