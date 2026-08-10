# 📱 Gain Train Mobile App - Testing & Google Play Store Deployment Guide

This guide provides step-by-step instructions for testing the **Gain Train** React Native app locally, generating standalone `.apk` files, and publishing the app to the **Google Play Store**.

---

## 📑 Table of Contents

1. [Local Testing & Live Preview](#1-local-testing--live-preview)
2. [Generating Standalone `.apk` Files](#2-generating-standalone-apk-files)
3. [Publishing to the Google Play Store](#3-publishing-to-the-google-play-store)

---

## 1. Local Testing & Live Preview

### Step 1: Open Terminal & Install Dependencies

Navigate to the `mobile/` project directory and install the node dependencies:

```bash
cd mobile
npm install
```

### Step 2: Start the Expo Development Server

```bash
npx expo start
```

### Step 3: Choose Testing Method

#### Option A: On a Physical Android Phone (Easiest)
1. Download the **Expo Go** app from the Google Play Store on your Android device.
2. Ensure your phone and computer are connected to the same Wi-Fi network.
3. Scan the **QR code** displayed in your terminal using the Expo Go app.

#### Option B: On an Android Emulator (Android Studio)
1. Launch your Android Emulator in Android Studio.
2. Press **`a`** in your terminal window to automatically open Gain Train on the emulator.

#### Option C: In Web Browser
1. Press **`w`** in your terminal window to open a web browser preview (`npx expo start --web`).

---

## 2. Generating Standalone `.apk` Files

An `.apk` file lets you install Gain Train directly on any Android device without needing Expo Go or a computer.

### Method A: EAS Cloud Build (Recommended & Free)

1. **Install EAS CLI globally**:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to Expo** (or register a free account):
   ```bash
   eas login
   ```

3. **Configure Build Settings**:
   ```bash
   eas build:configure
   ```

4. Ensure your `eas.json` file contains the `preview` profile for `.apk` builds:
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

5. **Generate the `.apk` File**:
   ```bash
   eas build -p android --profile preview
   ```
   *Expo will compile your APK in the cloud and provide a direct download link when finished!*

---

### Method B: Local Offline APK Build

If you have Android SDK and Java JDK installed locally:

```bash
# 1. Generate native Android project files
npx expo prebuild

# 2. Compile release APK
cd android
./gradlew assembleRelease
```

The finished `.apk` file will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 3. Publishing to the Google Play Store

### Step 1: Create a Google Play Console Developer Account
- Visit the [Google Play Console](https://play.google.com/console/signup).
- Register your developer account (one-time $25 fee charged by Google).

### Step 2: Build a Production `.aab` (Android App Bundle)
Google Play requires an **`.aab`** file for store uploads.

Run the production build command:
```bash
eas build -p android --profile production
```
*Expo automatically signs your application with a secure production Keystore and outputs the `.aab` file.*

### Step 3: Prepare Store Graphics & Metadata
In your Google Play Console store listing, prepare the following required assets:
- **App Title**: Gain Train Fitness Tracker
- **Short Description**: Offline-first workout tracking and progressive overload logger.
- **App Icon**: 512×512 PNG (transparent or solid background).
- **Feature Graphic**: 1024×500 PNG banner image.
- **Phone Screenshots**: 2 to 8 screenshots of your app screens (HomeScreen, WorkoutLogger, Calendar, Stats).

### Step 4: Submit to Google Play Console
1. In Google Play Console, click **Create App**.
2. Go to **Production** (or **Closed Testing**) -> **Create new release**.
3. Upload your generated `.aab` file.
4. Complete the brief **Content Rating** and **Data Safety** questionnaires.
5. Click **Save** and **Send for Review**.

Google typically reviews and approves new apps within **24 to 48 hours**, after which *Gain Train* will be publicly available on the Google Play Store!
