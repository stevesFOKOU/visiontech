# OPTIMISATION RAPIDE POUR NETLIFY

## 🎯 Objectif
Réduire le poids du projet de 311 MB à 50-70 MB pour un déploiement optimal sur Netlify.

## 📊 État actuel
- **Poids total** : 311 MB
- **Images** : 18 MP4 (887 MB) + JPG (très lourds)
- **Problème** : Trop lourd pour Netlify

## 🗑️ Plan d'action

### 1. Suppression des vidéos MP4
- **18 fichiers MP4** à supprimer
- **Gain** : -887 MB
- **Nouveau poids** : ~387 MB

### 2. Optimisation des images
- **Conserver 15 images** par section maximum
- **Compression** des images restantes
- **Gain estimé** : -200 MB

### 3. Structure finale
- **Poids cible** : 50-70 MB
- **Sections** : 4 services avec 15 images chacun
- **Performance** : Chargement rapide

## 📁 Fichiers à conserver par section

### Électricité (15 images + 1 présentation)
- `elec.jpeg` (image principale)
- 15 meilleures images de projets

### Vidéosurveillance (15 images + 1 présentation)  
- `camera.jpg` (image principale)
- 15 meilleures images de projets

### Solaire (15 images + 1 présentation)
- `solaire.jpeg` (image principale)
- 15 meilleures images de projets

### Climatisation (15 images + 1 présentation)
- `clim.jpeg` (image principale)
- 15 meilleures images de projets

## 🚀 Résultat attendu
- **Poids final** : ~60 MB
- **Images totales** : 64
- **Déploiement Netlify** : 1-2 minutes
- **Performance** : Excellente

## ✅ Validation
- [ ] Supprimer tous les MP4
- [ ] Sélectionner 15 images par section
- [ ] Compresser les images
- [ ] Tester le poids final
- [ ] Déployer sur Netlify
