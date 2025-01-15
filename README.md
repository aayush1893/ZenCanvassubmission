# ZenCanvas

**ZenCanvas** is a mindfulness app designed to help users express their emotions through art and relaxation. It features tools to create symmetrical mandalas, calming breathing exercises, grounding games, and a gallery to store and revisit your artwork.

---

## Table of Contents

- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [How to Use ZenCanvas](#how-to-use-zencanvas)
  - [Creating a Mandala](#creating-a-mandala)
  - [Gallery](#gallery)
  - [Breathing Game](#breathing-game)
  - [Grounding Game](#grounding-game)
- [Technologies Used](#technologies-used)
- [Troubleshooting](#troubleshooting)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Mandala Drawing**: Create intricate symmetrical patterns using custom brush sizes, colors, and symmetry settings.
- **Gallery**: Save and view your artwork.
- **Breathing Exercises**: Follow a guided breathing exercise to relax and center yourself.
- **Grounding Games**: Engage in mindfulness exercises to stay grounded.
- **Background Music**: Continuous calming music with a toggle mute feature.
- **User Management**: Users are prompted to enter a unique ID or name at every session start.

---

## Setup and Installation

### Prerequisites

1. Node.js and npm installed on your system.
2. Git installed for cloning the repository.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/aayush1893/ZenCanvassubmission.git
   cd ZenCanvassubmission

2. Install dependencies:

bash
Copy code
npm install
Start the application:

bash
Copy code
npm start
The app will open in your default browser at http://localhost:3000.

How to Use ZenCanvas
1. Creating a Mandala
Navigate to the ZenPattern section.
Customize your brush size, symmetry settings, and color palette.
Start drawing on the canvas, and the app will mirror your strokes symmetrically.
Save your artwork to the Gallery using the Save Mandala button.
2. Gallery
Access the Gallery to view your saved mandalas.
Files are listed with thumbnails, and you can download them or revisit your creations.
3. Breathing Game
Choose the Ocean Breathing option.
Follow the guided visual cues to inhale, hold, and exhale.
Use the breathing exercise to relax and reduce stress.
4. Grounding Game
Select the Grounding Game to engage in a simple mindfulness activity.
Focus on sensory inputs (what you see, hear, feel) to stay present.
5. Background Music
Calming background music plays automatically when the app starts.
Use the Mute/Unmute button in the header to toggle music.
Technologies Used
Frontend: React.js, TypeScript
State Management: React Hooks
Styling: CSS, Tailwind
Animations: Framer Motion
Backend: AWS S3 for storing mandalas
Storage: LocalStorage for gallery and user management
Music: Background audio loop using HTML5 audio API
Troubleshooting
Issue: Gallery not showing saved files
Ensure you’re logged in with the same user ID.
Verify that saved files are stored in LocalStorage or AWS S3.
Issue: Music not playing
Check if your browser has blocked autoplay for audio.
Refresh the app or unmute using the toggle button.
Issue: Unable to save mandala
Ensure proper permissions are set for AWS S3 bucket.
Verify network connectivity.
Acknowledgments
ZenCanvas is inspired by my journey as a former dentist turned data analyst and my desire to help individuals improve their mental well-being. This app is a step toward making mindfulness accessible and engaging.

Thank you for using ZenCanvas. If you have any questions or feedback, feel free to raise an issue in the repository or contact me directly.
  
