# Focus para Android

Focus reduce el scroll infinito en Instagram, TikTok y YouTube. El bloqueo de apps completas se configura aparte, por temporizador, por horario semanal o con contraseña.

## Cómo funciona

- **Normal** y **Estricto** permiten dos bloques de 15 minutos de feed al día, con una pausa de dos horas entre ellos. Focus cuenta el uso automáticamente. Normal se desactiva tras una espera de 15 minutos y Estricto pide un PIN.
- **Sin scroll** bloquea los feeds compatibles desde el primer segundo. Al activarlo puedes elegir la espera o el PIN.
- **Estadísticas** muestra el tiempo de feed que Focus ha medido. Las estadísticas y las reglas se guardan en el dispositivo.

El anti-scroll está en pruebas. Focus usa el servicio de Accesibilidad de Android, con autorización, para identificar la aplicación abierta y reconocer los controles de las pantallas compatibles. La detección puede variar según la versión de cada red y el dispositivo. La versión actual se ha probado en un Pixel 8a.

## Compilar la APK de prueba

Requisitos: Node.js 24, pnpm 11, JDK 21 y Android SDK con la plataforma Android 17 (API 37). Configura la ubicación del SDK en Android Studio o mediante la variable ANDROID_HOME.

```text
pnpm install --frozen-lockfile
pnpm run lint
pnpm run build
cd android
```

Desde la carpeta android, ejecuta `gradlew.bat :app:assembleDebug` en Windows o `./gradlew :app:assembleDebug` en macOS y Linux. La APK de prueba queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

Para probar tu propia compilación en un móvil, puedes usar Android Studio o ADB con depuración USB autorizada. Al abrir Focus, sigue el aviso para activar su servicio de Accesibilidad. La APK de depuración sirve para pruebas. Para distribuir actualizaciones públicas, genera una APK de publicación con una clave de firma que puedas conservar.

## Colaborar

Las pruebas en otras marcas de Android y versiones de Instagram, TikTok y YouTube son bienvenidas. Si encuentras un fallo, indica el modelo, la versión de Android, la versión de la app afectada y los pasos para reproducirlo.
<img width="460" height="816" alt="image" src="https://github.com/user-attachments/assets/77388cdd-15fb-4bc9-9081-79e1e2bc2f11" />
<img width="460" height="813" alt="image" src="https://github.com/user-attachments/assets/41616550-76f4-496a-8ade-bb850007d454" />
