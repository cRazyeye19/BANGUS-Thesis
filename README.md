# BANGUS-Thesis: Smart Milkfish Farm Management System

## Project Description
The BANGUS-Thesis project is a comprehensive web application designed for the monitoring and management of a bangus (milkfish) farm. It integrates with ESP32 devices to collect real-time sensor data and facilitate automated feeding, aiming to optimize farm operations and improve productivity. This system serves as a smart aquaculture solution, providing farmers with tools to efficiently manage their milkfish farms.

## Features
*   **Real-time Monitoring:** View live sensor data (e.g., water temperature, pH levels, dissolved oxygen) from ESP32 devices deployed in the fish ponds.
*   **Automated Feeding:** Schedule and control automated fish feeding mechanisms remotely.
*   **Data Visualization:** Visualize historical sensor data and feeding patterns through interactive charts and graphs.
*   **User Authentication:** Secure login and user management for farm owners and operators.
*   **Notifications:** Receive alerts and notifications regarding critical sensor readings or feeding events.
*   **Device Management:** Configure and manage connected ESP32 devices.

## Technologies Used

### Frontend
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A superset of JavaScript that adds static typing.
*   **Vite:** A fast build tool for modern web projects.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

### Backend/Database
*   **Firebase:** A platform developed by Google for creating mobile and web applications. Used for:
    *   **Firestore:** NoSQL cloud database for storing sensor data, feeding schedules, and user information.
    *   **Authentication:** User authentication and authorization.
    *   **Cloud Functions:** (Potentially) for backend logic and integrations.

### Hardware
*   **ESP32:** A series of low-cost, low-power system on a chip microcontrollers with integrated Wi-Fi and Bluetooth. Used for:
    *   Sensor data collection (e.g., water quality sensors).
    *   Controlling automated feeding mechanisms.
    *   Communicating with the Firebase backend.

## Installation

### Prerequisites
*   Node.js (LTS version recommended)
*   npm or Yarn
*   Git
*   Arduino IDE or PlatformIO (for ESP32 firmware)
*   A Firebase project set up with Firestore and Authentication enabled.

### Web Application Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/cRazyeye19/BANGUS-Thesis.git
    cd BANGUS-Thesis
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure Firebase:**
    *   Create a `.env` file in the root directory based on `.env.example`.
    *   Add your Firebase configuration details (API Key, Auth Domain, Project ID, etc.) to the `.env` file.
    ```
    VITE_FIREBASE_API_KEY="YOUR_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_APP_ID"
    VITE_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically run on `http://localhost:5173`.

### ESP32 Firmware Setup

1.  **Open `esp32.ino`:** Open the `esp32.ino` file located in the project root using Arduino IDE or PlatformIO.
2.  **Install necessary libraries:** Ensure you have the required ESP32 board definitions and libraries (e.g., Firebase-ESP32, DHT sensor library, etc.) installed in your Arduino IDE/PlatformIO.
3.  **Configure Wi-Fi and Firebase credentials:** Update the `esp32.ino` file with your Wi-Fi SSID, password, and Firebase project details (e.g., API key, database URL).
4.  **Upload to ESP32:** Connect your ESP32 board and upload the firmware.

## Usage
1.  **Register/Login:** Access the web application through your browser and create an account or log in.
2.  **Connect ESP32:** Ensure your ESP32 device is powered on, connected to Wi-Fi, and successfully communicating with your Firebase project.
3.  **Monitor Data:** Navigate to the dashboard to view real-time sensor data and historical trends.
4.  **Manage Feeding:** Use the fish feeding section to set up and manage automated feeding schedules.
5.  **Receive Notifications:** Keep an eye on the notifications section for important alerts.

## Contributing
Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## License
This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact
For any inquiries or support, please open an issue on the GitHub repository.
