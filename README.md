# Insta No Reels

Une app Instagram sans scroll de Reels. Bloque l'accès au feed infini des Reels à la route `/reels/`, mais permet toujours de regarder les reels envoyés en DM ou via lien direct (`/reel/ABC123/`).

## Installation

### Prérequis
- Node.js 18+
- Expo CLI
- Android Phone avec Expo Go installée (ou émulateur Android)

### Setup local
```bash
npm install
npx expo start --android
```

### Build APK standalone
```bash
eas build -p android
```

## Comment ça marche

L'app ouvre Instagram web dans une WebView et injecte du JavaScript qui :
1. Détecte les changements de route (Instagram est une SPA React)
2. Affiche un overlay gris quand la route est `/reels/`
3. Supprime l'overlay sur toutes autres routes

## Limitations

- Version web d'Instagram (pas la native app)
- Pas de caméra pour poster
- Les notifications push ne sont pas disponibles
