plugins { id("com.android.application") version "9.5.1" }

android {
    namespace = "com.focus.antiscroll"
    compileSdk = 37
    defaultConfig {
        applicationId = "com.focus.antiscroll"
        minSdk = 26
        targetSdk = 36
        versionCode = 22
        versionName = "0.1.21"
    }
    sourceSets["main"].assets.srcDir("../../dist")
}
