# Illustrations du Parcours

Ce dossier contient les emplacements définitifs des illustrations des cinq niveaux. Les PNG présents sont des placeholders temporaires : l'illustrateur peut les remplacer à l'identique, sans aucune modification de code.

## Fichiers à remplacer

- `journey/explorer/chapter-1-light.png`
- `journey/explorer/chapter-1-dark.png`
- `journey/analyst/chapter-2-light.png`
- `journey/analyst/chapter-2-dark.png`
- `journey/strategist/chapter-3-light.png`
- `journey/strategist/chapter-3-dark.png`
- `journey/decision-maker/chapter-4-light.png`
- `journey/decision-maker/chapter-4-dark.png`
- `journey/visionary/chapter-5-light.png`
- `journey/visionary/chapter-5-dark.png`

Conserver exactement les noms, le format PNG et les dossiers. Une proportion de 2:1 est recommandée ; les placeholders utilisent 1200 × 600 pixels.

Le registre unique `src/constants/journeyIllustrations.ts` sélectionne automatiquement la variante claire ou sombre. Aucun composant ne référence directement un fichier image.

## Direction artistique

- Minimaliste et chaleureuse.
- Formes simples et lisibles sur mobile.
- Couleurs douces compatibles avec la palette de Décisions.
- Une personnalité forte sans surcharge.
- Une scène ou une métaphore propre à chaque chapitre.
- Aucun élément purement décoratif.
- Aucun code visuel de jeu, trophée, monnaie ou compétition.
