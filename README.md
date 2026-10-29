# Poliken Escape — Android (Capacitor) प्रोजेक्ट

## फोल्डर संरचना
```
poliken-escape-android/
├─ package.json            npm dependencies र scripts
├─ capacitor.config.json   appId (package name), appName, webDir
├─ scripts/fetch-three.js  Three.js r128 offline डाउनलोड
├─ assets/                 icon (तपाईंको logo) र splash (capacitor-assets ले प्रयोग गर्छ)
└─ www/                    गेम (WebView भित्र चल्छ)
   ├─ img/logo.webp       (मेनुमा देखिने logo)
   ├─ index.html
   ├─ css/style.css
   └─ js/ game.js  +  three.min.js (npm run setup ले आउँछ)
```
`android/` फोल्डर तपाईंको कम्प्युटरमा `npx cap add android` ले बन्छ।

## आवश्यकता
Node.js 20+, Android Studio (नयाँ संस्करण, JDK सहित), इन्टरनेट (पहिलो पटक मात्र)।

## चरण १: package name बदल्नुहोस् (अनिवार्य, Play मा प्रकाशित भएपछि बदल्न मिल्दैन)
`capacitor.config.json` मा `appId` लाई आफ्नो अद्वितीय नाममा बदल्नुहोस्, जस्तै `com.sunilgames.polikenescape`।

## चरण २: setup
```
npm install
npm run setup          # www/js/three.min.js डाउनलोड
npx cap add android    # android/ प्रोजेक्ट बनाउँछ
npm run assets         # icon/splash बनाउँछ (आफ्नै 1024x1024 icon-only.png राख्न सक्छन्)
npm run sync           # www/ लाई android मा कपी
npx cap open android   # Android Studio खुल्छ
```

## चरण ३: फोनमा परीक्षण (debug APK)
```
cd android
./gradlew assembleDebug        # Windows: gradlew.bat assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk` — फोनमा install गरेर जाँच्नुहोस्।
(वा Android Studio मा USB-debugging गरेको फोन जोडेर ▶ Run)

## चरण ४: signing key बनाउनुहोस् (एक पटक; सुरक्षित राख्नुहोस्)
```
keytool -genkey -v -keystore jungle-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias jungle
```
पासवर्ड र `.jks` फाइलको ब्याकअप राख्नुहोस्। Git मा नहाल्नुहोस्।

## चरण ५: AAB (Play Store) र release APK
सजिलो तरिका: Android Studio → Build → Generate Signed App Bundle / APK → Android App Bundle → आफ्नो keystore चुन्नुहोस् → release।
AAB: `android/app/release/app-release.aab`

कमान्डबाट गर्न `android/app/build.gradle` को `android { }` भित्र थप्नुहोस्:
```
signingConfigs { release {
  storeFile file("../../jungle-release.jks")
  storePassword System.getenv("KS_PASS")
  keyAlias "jungle"
  keyPassword System.getenv("KS_PASS") } }
buildTypes { release { signingConfig signingConfigs.release; minifyEnabled false } }
```
फेरि: `./gradlew bundleRelease` (AAB) वा `./gradlew assembleRelease` (APK)।

## चरण ६: Google Play Console
1. Play Developer खाता (एक पटकको शुल्क) खोल्नुहोस्।
2. नयाँ app बनाउनुहोस् → AAB upload (Internal/Closed testing बाट सुरु)।
3. Play App Signing खुला राख्नुहोस्।
4. चाहिने: app icon 512x512, feature graphic 1024x500, screenshots, छोटो/लामो विवरण, content rating प्रश्नावली, Data safety (यो गेमले व्यक्तिगत डेटा सङ्कलन गर्दैन), privacy policy URL।
5. `android/variables.gradle` मा targetSdkVersion Play को हालको आवश्यकता अनुसार छ कि जाँच्नुहोस् (नयाँ Capacitor ले सामान्यतया मिलाएको हुन्छ)।
6. नयाँ व्यक्तिगत खाताका लागि closed-testing आवश्यकता (परीक्षक सङ्ख्या/दिन) Play Console मा हालको नियम हेर्नुहोस्।

## समस्या समाधान
- सेतो/कालो स्क्रिन: `www/js/three.min.js` छ कि जाँच्नुहोस्, फेरि `npm run sync`।
- सफ्टवेयर रेन्डरिङमा ढिलो: वास्तविक फोनमा जाँच्नुहोस्, emulator मा WebGL ढिलो हुन सक्छ।
- गेम परिवर्तन गरेपछि: `www/` सम्पादन → `npm run sync` → पुन: build।
