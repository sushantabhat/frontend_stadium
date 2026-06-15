---

### **2. Frontend Repository (`/frontend/README.md`)**

```markdown
# Smart Stadium Mobile App 📱

The mobile application built with React Native and Expo for stadium ticket booking.

## 🚀 Quick Start

1. **Prerequisites:**
   - Install [Node.js](https://nodejs.org/).
   - Install [Expo Go](https://expo.dev/tools) on your physical phone (or have iOS Simulator ready).

2. **Installation:**
   ```bash
   cd frontend
   npm install
Configuration:

Open src/context/AuthContext.js.

Update the axios.post URL to your Mac's local IP address so the app can talk to the backend:
const API_URL = 'http://192.168.1.XX:5000';

Launch the App:

Bash
npx expo start
Press i to open the iOS Simulator, or scan the QR code with your phone.
