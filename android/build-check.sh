#!/bin/bash

echo "🔍 Checking Android project structure..."

# Check required files
echo "📁 Checking project files:"
files=(
    "build.gradle"
    "settings.gradle"
    "app/build.gradle"
    "app/src/main/AndroidManifest.xml"
    "app/src/main/java/com/blazeneuro/developer/MainActivity.kt"
    "app/src/main/java/com/blazeneuro/developer/LoginActivity.kt"
    "app/src/main/java/com/blazeneuro/developer/SignupActivity.kt"
    "app/src/main/java/com/blazeneuro/developer/QRScanActivity.kt"
    "app/src/main/java/com/blazeneuro/developer/DashboardActivity.kt"
    "app/src/main/java/com/blazeneuro/developer/api/ApiService.kt"
    "app/src/main/java/com/blazeneuro/developer/api/ApiClient.kt"
    "app/src/main/java/com/blazeneuro/developer/utils/PreferenceManager.kt"
)

missing_files=()
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

# Check layouts
echo -e "\n📱 Checking layout files:"
layouts=(
    "app/src/main/res/layout/activity_main.xml"
    "app/src/main/res/layout/activity_login.xml"
    "app/src/main/res/layout/activity_signup.xml"
    "app/src/main/res/layout/activity_qrscan.xml"
    "app/src/main/res/layout/activity_dashboard.xml"
)

for layout in "${layouts[@]}"; do
    if [ -f "$layout" ]; then
        echo "✅ $layout"
    else
        echo "❌ $layout (missing)"
        missing_files+=("$layout")
    fi
done

# Check resources
echo -e "\n🎨 Checking resource files:"
resources=(
    "app/src/main/res/values/strings.xml"
    "app/src/main/res/values/themes.xml"
    "app/src/main/res/drawable/ic_qr_code.xml"
    "app/src/main/res/drawable/ic_camera.xml"
    "app/src/main/res/drawable/circle_background.xml"
)

for resource in "${resources[@]}"; do
    if [ -f "$resource" ]; then
        echo "✅ $resource"
    else
        echo "❌ $resource (missing)"
        missing_files+=("$resource")
    fi
done

# Summary
echo -e "\n📊 Build Check Summary:"
if [ ${#missing_files[@]} -eq 0 ]; then
    echo "🎉 All required files are present!"
    echo "✅ Project structure is complete"
    echo "✅ Ready for Android Studio import"
    echo -e "\n📋 Next steps:"
    echo "1. Open Android Studio"
    echo "2. Import this project folder"
    echo "3. Sync Gradle files"
    echo "4. Build and run on device/emulator"
    echo -e "\n🔗 API Configuration:"
    echo "- Emulator: Uses http://10.0.2.2:3000 (auto-configured)"
    echo "- Physical device: Update IP in ApiClient.kt"
    exit 0
else
    echo "⚠️  Missing ${#missing_files[@]} files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi
