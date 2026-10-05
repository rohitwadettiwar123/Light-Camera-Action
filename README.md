# 🎂 Light Camera Action - Birthday Special

A deeply personalized, interactive 3D birthday celebration web application created as a special gift for a best friend. 

This project transforms a traditional birthday greeting into an immersive web experience using modern web technologies, 3D graphics, and interactive elements.

## ✨ Features

*   **🔒 Secure Passcode Entry**: A beautiful lock screen protecting the surprise.
*   **🌌 3D Photo Constellation**: An interactive galaxy of floating memories. Drag and tilt the device to explore the photos in 3D space using gyroscope controls.
*   **✨ Particle Morphing Intro**: A cinematic opening where glowing particles morph to reveal the birthday message.
*   **✉️ 3D Interactive Letter**: A realistic, debossed envelope that opens to reveal a personalized letter written in a live typewriter effect.
*   **🎂 Interactive Cake**: A highly realistic 3D birthday cake experience where you can blow out the candles and cut the cake.
*   **🎈 Balloon Pop Game & Trivia**: A fun interactive quiz testing how well you know the birthday star, complete with haptic feedback and confetti.
*   **📱 Fully Responsive**: Optimized for both high-end desktops and mobile devices with adaptive quality scaling to ensure smooth performance everywhere.

## 🛠️ Built With

*   **React**: UI Framework
*   **Vite**: Next-generation frontend tooling
*   **Three.js & React Three Fiber**: For stunning 3D rendering and particle effects
*   **Tailwind CSS**: For beautiful, responsive styling
*   **Framer Motion**: For fluid page transitions and UI animations

## 🚀 Running Locally

To run this project on your local machine:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    *   Create a `.env.local` file in the root directory.
    *   Add the necessary environment variables (passcode, name, custom messages, and photo paths) as defined in the configuration setup.

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5000`.

## 📸 Adding Media

Photos for the 3D Constellation are stored in the `public/photos/` directory. Ensure your environment variables point to these assets correctly (e.g., `VITE_PHOTO_1="/photos/1.jpg"`).
