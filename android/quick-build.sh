#!/bin/bash
echo "🚀 Quick APK Build"
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
./gradlew assembleDebug --no-daemon --quiet --parallel
