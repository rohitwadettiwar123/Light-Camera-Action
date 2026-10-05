# 🎂 Light Camera Action - 3D Birthday Experience

A deeply personalized, interactive 3D birthday celebration web application created as a special gift for a best friend. 

This project pushes the boundaries of a traditional birthday greeting by transforming it into an immersive, hardware-accelerated 3D WebGL experience using React Three Fiber.

## 🚀 The 3D Experience

This application features multiple intersecting 3D scenes rendered in real-time:

*   **🌌 3D Photo Constellation Galaxy**: 
    *   **Interactive Camera**: A fully navigable 3D space where photos float like stars. 
    *   **Gyroscope Parallax**: On mobile, tilting the device physically shifts the 3D camera perspective.
    *   **Dynamic Depth**: Photos scale and blur based on their Z-axis distance from the camera, creating a hyper-realistic depth of field.
*   **✨ Physics-Based Particle Morphing**: 
    *   **Spring Physics**: Thousands of individual glowing particles driven by `@react-spring/three`.
    *   **Geometry Morphing**: Particles seamlessly transition from spelling out the birthday star's name, to forming a glowing 3D heart, to a birthday cake silhouette.
*   **🎆 GLSL Aurora Shader**: 
    *   **Custom Fragment Shaders**: A stunning, real-time math-generated aurora borealis background that constantly shifts and reacts to the scene.
*   **✉️ Realistic 3D Envelope**: 
    *   **Material Rendering**: A 3D debossed envelope with realistic shadows, glowing wax seals, and physical lighting that responds to user interaction.
*   **🎂 Interactive 3D Cake**: 
    *   **Lighting Effects**: A beautifully rendered birthday cake with dynamic point lights attached to the candles that cast real-time shadows across the icing.

## ✨ Additional Features

*   **🔒 Secure Passcode Entry**: A beautiful lock screen protecting the surprise.
*   **🎈 Balloon Pop Game & Trivia**: A fun interactive quiz testing how well you know the birthday star, complete with haptic feedback.
*   **📱 Adaptive 3D Scaling**: A custom quality hook monitors hardware concurrency and FPS to automatically downgrade 3D fidelity on older phones, ensuring a smooth 60fps experience everywhere.

## 🛠️ Built With

*   **React & Vite**: High-performance UI Framework and tooling.
*   **Three.js & React Three Fiber**: The core engine driving all WebGL 3D rendering.
*   **Tailwind CSS & Framer Motion**: For beautiful styling and fluid 2D DOM transitions.

## 🚀 Running Locally

To run this 3D project on your local machine:

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
