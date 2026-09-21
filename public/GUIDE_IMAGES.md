# 📁 Guide des Images et Médias KribiLand

Ce dossier `public/` est le dossier racine de tous les fichiers statiques de votre application Next.js (images, logos, icônes, fonds d'écran, etc.). 

Tout fichier placé dans ce dossier est **directement accessible par le site** via son chemin relatif (commençant par `/`).

---

## 📂 Structure des Dossiers Créés

```text
KRIBILAND/
└── public/
    ├── favicon.ico                  <-- Icône affichée dans l'onglet du navigateur
    └── images/
        ├── logo/
        │   ├── logo.png             <-- Logo principal KribiLand (fond clair)
        │   ├── logo-white.png       <-- Logo blanc (pour fonds sombres navy)
        │   └── icon.png             <-- Symbole ou favicon 512x512
        │
        ├── backgrounds/
        │   ├── hero-bg.jpg          <-- Image de fond de la bannière d'accueil (Hero)
        │   ├── auth-bg.jpg          <-- Arrière-plan des pages de connexion/inscription
        │   └── pattern-bg.png       <-- Motifs d'arrière-plan
        │
        ├── slides/
        │   ├── slide-1.jpg          <-- Photo 1 du carrousel d'accueil (ex: Plage de Kribi)
        │   ├── slide-2.jpg          <-- Photo 2 (ex: Chutes de la Lobé)
        │   └── slide-3.jpg          <-- Photo 3 (ex: Villas de luxe)
        │
        └── placeholders/
            ├── property-default.jpg <-- Image par défaut si un logement n'a pas de photo
            └── service-default.jpg  <-- Image par défaut si un service n'a pas de photo
```

---

## 🏷️ Recommandations de Nommage et Formats

| Type d'image | Nom conseillé | Format recommandé | Dimensions idéales |
|---|---|---|---|
| **Logo principal** | `logo.png` ou `logo.svg` | PNG transparent ou SVG | ~ 400 × 120 px |
| **Logo blanc** | `logo-white.png` | PNG transparent | ~ 400 × 120 px |
| **Favicon** | `favicon.ico` (à la racine `public/`) | ICO ou PNG | 32 × 32 px |
| **Fond d'accueil (Hero)** | `hero-bg.jpg` ou `hero-bg.webp` | JPG ou WebP | 1920 × 1080 px (< 400 Ko) |
| **Slides / Carrousel** | `slide-1.jpg`, `slide-2.jpg` | JPG ou WebP (16:9) | 1600 × 900 px |
| **Photos par défaut** | `property-default.jpg` | JPG ou WebP | 1200 × 800 px |

> ⚠️ **Règles importantes :**
> 1. Évitez les majuscules, les espaces et les accents dans les noms de fichiers (ex: utilisez `hero-bg.jpg` et **PAS** `Hero Background 1.jpg`).
> 2. Compressez vos images (via [TinyPNG.com](https://tinypng.com)) pour que le site charge très rapidement sur téléphone portable.

---

## 💻 Comment utiliser vos photos dans le code Next.js

Une fois vos photos déposées dans les dossiers ci-dessus :

### 1. Dans une balise HTML / React `<img />`
```tsx
<img src="/images/logo/logo.png" alt="KribiLand Logo" className="h-10 w-auto" />
```

### 2. Dans un composant Next.js `<Image />` (Optimisé)
```tsx
import Image from 'next/image';

<Image 
  src="/images/backgrounds/hero-bg.jpg" 
  alt="Kribi Beach" 
  width={1920} 
  height={1080} 
  className="object-cover w-full"
/>
```

### 3. En image de fond CSS (Tailwind)
```tsx
<div className="bg-[url('/images/backgrounds/hero-bg.jpg')] bg-cover bg-center">
  {/* Contenu */}
</div>
```

---

## 🚀 Que devez-vous faire maintenant ?

Vous pouvez dès à présent déposer vos propres images dans les dossiers créés sous :
`c:\Users\THE BIG BOSS\Documents\KRIBILAND\public\images\`
