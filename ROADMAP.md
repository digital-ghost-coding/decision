# Décisions — Roadmap

## Phase 1 — Fondation

### Projet et identité

- [x] Création du projet Expo SDK 54
- [x] Configuration TypeScript
- [x] Direction artistique de base
- [x] Vision produit documentée
- [x] Vision Parcours documentée
- [x] Vision Decision Inbox documentée
- [x] Principes de gamification non intrusive documentés
- [x] Nom visible « Décisions » appliqué à l'application et à la documentation actuelle
- [x] Nom technique `decisions` appliqué au package sans changer les identifiants Expo
- [x] Compatibilité des anciennes données locales préservée

### Architecture

- [x] Architecture évolutive
- [x] Navigation typée avec React Navigation
- [x] Composants d'interface partagés
- [x] Thème visuel centralisé
- [x] Couleurs centralisées
- [x] Hiérarchie typographique cohérente
- [x] Premiers tokens d'espacement et de rayons
- [x] Compatibilité iOS, Android et Web
- [x] Tokens d'animations
- [x] Système d'icônes dédié
- [ ] Configuration du lint
- [ ] Tests automatisés du flux de création

### Navigation principale

- [x] Bottom Navigation
- [x] Accueil
- [x] Mes décisions
- [x] Parcours
- [x] Profil / Paramètres — première version

### Premiers écrans

- [x] Écran d'accueil
- [x] Écran Nouvelle décision
- [x] Validation complète du formulaire
- [x] Navigation fonctionnelle

---

## Phase 2 — Réflexion

### Arguments

- [x] Écran Pour / Contre
- [x] Ajouter les arguments
- [x] Modifier les arguments existants
- [x] Supprimer les arguments
- [x] Validation de l'écran Pour / Contre
- [x] Saisie sans conflit entre le clavier, le champ et l'action d'ajout
- [x] Action d'analyse contextuelle, masquée pendant la saisie
- [x] Touche « Terminé » ajoutant l'argument et fermant le clavier
- [x] Transmission des données vers le résultat
- [x] Importance pondérée des arguments avec trois niveaux visibles

### Résultat et analyse

- [x] Écran Résultat
- [x] Calcul provisoire non pondéré
- [x] Message de résultat
- [x] Barre de progression
- [x] Retour à la modification

### Résultat et engagement compacts

#### Résultat

- [x] Synthèse comparative compacte
- [x] Informations essentielles visibles immédiatement
- [x] Détails accessibles à la demande
- [x] Sections vides supprimées
- [x] Textes répétitifs supprimés
- [x] Surfaces de comparaison plus neutres
- [x] Tendance lisible sans dépendre de la couleur
- [x] Aucune option présélectionnée par la tendance
- [x] Sélection explicite de l'utilisateur
- [x] CTA principal unique
- [x] CTA principal visible pendant le scroll
- [x] Action « Revoir mes arguments » compacte

#### Engagement

- [x] Titre d'engagement raccourci
- [x] Choix acté affiché de manière compacte
- [x] Message de réversibilité simplifié
- [x] Cercle responsive avec tailles centralisées
- [x] Progression et haptics préservés
- [ ] Action « Je veux encore réfléchir » toujours visible — validation visuelle requise
- [x] Safe Area respectée par la structure de l'écran

#### Validation

- [x] Typecheck TypeScript
- [x] Treize tests automatisés du résultat compact, du calcul et du cercle
- [x] Expo Doctor — 18 contrôles sur 18
- [x] Bundles de production Web, iOS et Android
- [ ] Validation visuelle petit iPhone
- [ ] Validation visuelle grand iPhone
- [ ] Validation Android
- [ ] Validation Web mobile
- [ ] Validation Web desktop
- [ ] Validation Dynamic Type
- [ ] Validation Reduce Motion
- [ ] Test utilisateur du nouveau résultat
- [ ] Test utilisateur du cercle compact

Les cases d'implémentation décrivent le code livré. Les validations visuelles, tactiles et utilisateur restent distinctes et ne seront cochées qu'après exécution réelle sur les supports concernés.

## Cadrage de la décision

- [x] Format « Évaluer une option »
- [x] Format « Comparer deux options »
- [x] Sélecteur de format
- [x] Exemples adaptés au format
- [x] Détection des questions ambiguës contenant « ou »
- [x] Suggestion de reformulation
- [x] Modèle de données compatible avec deux options
- [x] Migration des anciennes décisions
- [x] Arguments associés à la bonne option
- [x] Choix concret avant l'engagement
- [ ] Tests utilisateurs des deux parcours

Le format appartient à chaque décision, jamais au profil de l'utilisateur. Les anciennes décisions sont migrées au chargement : la présence de deux options valides active le mode comparaison ; les autres décisions restent en mode évaluation. Une comparaison conserve sa question, ses deux options, les arguments associés à chacune et le choix finalement acté.

## Comparaison équilibrée

- [x] Atouts pour l'option A
- [x] Freins pour l'option A
- [x] Atouts pour l'option B
- [x] Freins pour l'option B
- [x] Deux options visibles sur le même écran
- [x] Trois niveaux d'importance
- [x] Importance « Important » par défaut
- [x] Calcul comparatif pondéré
- [x] Prise en compte des freins
- [x] Mise en avant des éléments décisifs
- [x] Résultat Option A
- [x] Résultat Option B
- [x] Résultat d'égalité
- [x] Choix concret avant engagement
- [x] Restitution dans la fiche décision
- [x] Migration des anciennes décisions
- [ ] Tests utilisateurs du mode comparaison

La balance d'une option correspond à la somme pondérée de ses atouts moins la somme pondérée de ses freins. Les niveaux visibles utilisent une correspondance unique : Secondaire = 1, Important = 3 et Décisif = 5. Une tendance reste une aide à la lecture ; elle n'impose jamais le choix final.

### Statut de validation de l'itération

- [x] Implémentation technique de « Comparaison équilibrée »
- [x] Typecheck TypeScript
- [x] Compilation des bundles Web, iOS et Android
- [x] Contrôles déterministes du calcul et de la migration par script temporaire
- [ ] Tests automatisés rejouables et enregistrés dans le projet
- [ ] Validation visuelle interactive du mode comparaison
- [ ] Validation sur appareils physiques iOS et Android

Un bundle compilé confirme la compatibilité technique du code. Il ne valide ni le rendu, ni le clavier, ni les gestes, ni la compréhension de l'interface sur un appareil réel.

L'implémentation technique de Comparaison équilibrée est terminée et compilable.

Sa validation UX sur appareils physiques et avec des utilisateurs reste ouverte.

## Stabilité UX — Swipe et clavier

### Swipe des décisions

- [x] Audit de l'implémentation actuelle
- [x] Logique déterministe garantissant une position finale ouverte ou fermée
- [x] Une seule carte ouverte pilotée par le parent
- [x] Fermeture de la carte précédente dès le début d'un nouveau swipe
- [x] Fermeture au début du scroll vertical
- [x] Fermeture au changement de filtre
- [x] Fermeture au changement d'écran et à la perte de focus
- [x] Nettoyage des références et animations lors des re-renders et démontages
- [x] Priorité renforcée du scroll vertical
- [x] Actions Archiver et Supprimer préservées
- [ ] Alternative visible « Archiver la décision » hors du geste de swipe
- [ ] Animation pédagogique affichée une seule fois
- [ ] Validation tactile sur iOS
- [ ] Validation tactile sur Android
- [ ] Validation visuelle et interactive sur Web

L'animation pédagogique reste différée : garantir une seule apparition entre plusieurs visites demanderait une persistance supplémentaire. Elle ne sera ajoutée qu'après validation tactile de la stabilité du geste.

### Clavier des arguments

- [x] Audit du comportement actuel
- [x] Scroll automatique programmé vers le champ actif sur iOS et Android
- [x] Espace inférieur ajouté pendant l'ouverture du clavier
- [x] Bouton d'ajout conservé dans la même ligne que son champ
- [x] Aucun conflit avec l'action principale, masquée pendant la saisie
- [ ] Champ actif toujours visible — validation tactile
- [ ] Bouton d'ajout toujours accessible — validation tactile
- [ ] Mode Une option validé sur appareil
- [ ] Mode Deux options validé sur appareil
- [ ] Modification de tous les types d'arguments validée tactilement
- [ ] Grands iPhone validés
- [ ] Android validé
- [ ] Web validé visuellement
- [ ] Dynamic Type validé

La compilation confirme que les mécanismes sont intégrés sans erreur de type. Elle ne remplace pas la validation du clavier, du toucher ou du scroll sur une plateforme réelle.

La prochaine étape après cette itération est un vrai test utilisateur comprenant au minimum :

- une décision à une option ;
- une comparaison entre deux options ;
- un frein décisif ;
- une égalité.

---

## Phase 3 — Engagement

> Cette interaction est la signature de Décisions.
>
> Le maintien sur le cercle n'est utilisé qu'une seule fois dans tout le produit.
>
> Sa rareté lui donne sa valeur.

Objectif : créer le passage de « Je réfléchis » à « Je décide ».

- [x] Écran « Acter la décision »
- [x] Nouveau statut `acted`
- [x] Transition `reflecting` → `acted`
- [x] Préparation du cercle d'engagement
- [x] Préparation des haptics
- [x] Préparation des animations
- [x] Notification « Décision actée »
- [x] Possibilité d'annuler
- [x] Déplacement automatique dans les décisions actées

### Interaction signature

> Le cercle d’engagement ne doit être utilisé qu’une seule fois dans tout le produit : au moment d’acter une décision importante. Sa rareté lui donne sa valeur symbolique.

- [x] Concevoir le cercle d'engagement
- [x] Maintien progressif d'environ 2 secondes
- [x] Arrêt de la confirmation si relâchement anticipé
- [x] Décroissance visuelle lente après relâchement
- [x] Reprise du maintien à partir de la progression restante
- [x] Progression visuelle circulaire sans pourcentage
- [x] Haptique légère au démarrage et aux paliers sur mobile
- [x] Haptique de confirmation distincte
- [x] Alternative Web visuelle sans vibration
- [x] Empêcher les confirmations accidentelles
- [x] État final avec cercle plein et coche
- [x] Action discrète « Continuer plus tard » conservant le statut `reflecting`
- [x] Action temporaire « Annuler »
- [x] Choix d'une date de suivi
- [ ] Intégration future à la Decision Inbox

### Cycle de vie

Statuts disponibles : `draft`, `reflecting`, `acted`, `tracking`, `completed`, `cancelled`, `archived`.

- [x] Modèle de statuts extensible
- [x] Moteur centralisé de transitions autorisées
- [x] Migration progressive des décisions historiques
- [x] Horodatage de l'acte et de la fin
- [x] Passage `acted` → `tracking` avec date de suivi facultative
- [x] Accès explicite `acted` / `tracking` → bilan → `completed` depuis Mes décisions ; l'ancienne clôture directe a été retirée
- [x] Compatibilité conservée pour les décisions historiquement clôturées sans bilan
- [x] Déverrouillage effectif du jalon « Première décision terminée »
- [x] Conservation du statut précédent lors de l'archivage
- [ ] Interface permettant toutes les transitions
- [ ] Historique horodaté des transitions

---

## Phase 4 — Mes décisions

### Sauvegarde et modification

- [x] Historique local
- [x] Écran « Mes décisions »
- [x] Persistance imbriquée des arguments Pour / Contre
- [x] Réouverture d'une décision existante
- [x] Modification des arguments existants
- [ ] Modification complète (titre compris)
- [ ] Duplication
- [x] Suppression avec possibilité d'annulation

### Organisation de la liste

- [x] Liste locale persistante
- [ ] Recherche
- [ ] Tri
- [x] Filtres Toutes, En cours, Actées, Terminées et Archivées
- [ ] Favoris
- [x] Archivage
- [x] Suppression
- [x] Swipe de droite vers gauche
- [x] Actions Archiver et Supprimer
- [x] Animation discrète du swipe
- [x] Annulation après archivage ou suppression
- [x] Liste dédiée « Décisions actées »
- [x] Liste dédiée « Décisions terminées »

### Archives

- [x] Page Archives
- [x] Restauration
- [x] Suppression définitive avec possibilité d'annulation

---

## Cycle de vie d'une décision

- [x] Statuts complets
- [x] Date d'acte
- [x] Choix de suivi
- [x] Décision en suivi
- [x] Retour d'expérience
- [x] Satisfaction utilisateur
- [ ] Intégration Decision Inbox

Le stockage existant est migré progressivement au chargement : les décisions antérieures conservent leur identifiant, leurs arguments et leur statut, tandis que les dates compatibles sont complétées sans changement de clé de stockage.


## Boucle de suivi complète

- [x] Choix de suivi simplifié
- [x] Fiche décision
- [x] Détection échéance
- [x] Notification persistante
- [x] Bilan décision
- [x] Retour utilisateur
- [x] Statistiques enrichies

La première boucle locale est opérationnelle : une échéance est détectée au démarrage et au retour au premier plan, un rappel interne persistant est créé sans doublon, puis le bilan conserve la satisfaction et la note personnelle avant de terminer la décision. Les notifications système et la page complète Decision Inbox restent hors périmètre.
## Decision Inbox — Fondations

- [x] Architecture notification
- [x] Premiers rappels internes persistants
- [ ] Jalons
- [ ] Insights futurs

Le modèle commun prend désormais en charge `decision_followup_due` en plus de `decision_followup`, `milestone_unlocked`, `achievement`, `insight` et `reminder`. La page Decision Inbox et les notifications système restent volontairement futures.

---

## Phase 5 — Parcours & engagement responsable

> Objectif : encourager l'utilisateur à revenir et à apprendre de ses décisions sans transformer l'application en jeu.

### Première version

- [x] Première version de la page Parcours
- [x] Niveau actuel — prototype remplacé par une narration en chapitres
- [x] Statistiques issues d'un service dédié
- [x] Statistiques personnelles — première version locale
- [x] Jalons issus d'un moteur réutilisable
- [x] Définitions des jalons séparées des composants
- [x] Persistance de la date de déverrouillage
- [x] Évolution du profil — prototype initial remplacé par des compétences racontées en chapitres

### Évolutions futures

- [ ] Journal des décisions
- [ ] Historique des résultats réels
- [ ] Satisfaction après plusieurs mois
- [ ] Défis discrets
- [ ] Collection de jalons élégants
- [ ] Jardin de décisions (visualisation de la progression)
- [ ] Insights générés automatiquement
- [ ] Timeline des décisions
- [ ] Bilan annuel
- [ ] Historique détaillé de progression

---

## Guidage des jalons

- [x] Carte "Prochaine étape"
- [x] Boutons contextuels
- [x] Navigation directe
- [x] Architecture nextAction
- [x] Textes clarifiés
- [x] Suppression des statuts ambigus

Chaque jalon non terminé indique désormais la progression réelle, l'action attendue et le raccourci vers l'écran pertinent. La destination, le libellé et l'éventuelle décision cible sont déterminés par le moteur des jalons, jamais par les composants visuels.

---

## Première expérience Parcours

- [x] Hero de chapitre
- [x] Carte prochaine étape
- [x] Jalons enrichis
- [x] Illustration intégrée
- [x] Animations légères

La première hiérarchie narrative de la page est en place : chapitre actuel, prochaine action, progression entre les chapitres puis historique des jalons. Elle réutilise les illustrations et les fondations de mouvement existantes sans introduire de mécanique de jeu.

## Refonte narrative Parcours

- [x] Synthèse unique du chemin actuel
- [x] Progression globale intégrée
- [x] Prochaine étape intégrée à la synthèse
- [x] Chapitres présentés comme un voyage
- [x] États « Terminé », « En cours » et « Prochain »
- [x] Compétence propre à chaque chapitre
- [x] Jalons recentrés sur l'action concrète
- [x] Suppression des répétitions de chapitre
- [x] Retrait du tableau de statistiques de la page

Le moteur de statistiques reste actif pour calculer les chapitres et les jalons. L'interface privilégie désormais le récit, la compétence développée et la prochaine action plutôt que l'exposition de chiffres.

---

# PARCOURS

> Le Parcours raconte l'évolution personnelle de l'utilisateur dans sa manière de décider. Ce n'est ni une suite de niveaux, ni une barre d'XP, ni un classement.

## Chapitre 1 — 🌱 Explorateur · Comprendre avant de choisir

Objectif : observer sa question et poser les premiers repères avant de choisir.

- [x] Chapitre visible dans le Parcours
- [x] Emplacement réservé pour une illustration dédiée
- [x] Jalon « Première décision »
- [x] Jalon « Première décision actée »
- [x] Jalon « Première décision terminée »
- [x] Jalon « Première décision archivée »

## Chapitre 2 — 🧭 Analyste · Explorer les options

Objectif : ouvrir le champ des possibles sans chercher trop vite une réponse.

- [x] Chapitre visible et verrouillé jusqu'à la fin du chapitre précédent
- [x] Jalons rattachés au chapitre
- [x] Emplacement réservé pour une illustration dédiée
- [ ] Illustration définitive

## Chapitre 3 — 💡 Stratège · Identifier ce qui compte

Objectif : mettre les arguments en perspective et reconnaître ses priorités.

- [x] Chapitre visible avec progression et jalons
- [x] Emplacement réservé pour une illustration dédiée
- [ ] Illustration définitive

## Chapitre 4 — 🎯 Décideur · Passer à l'action

Objectif : transformer une réflexion structurée en action assumée.

- [x] Chapitre visible avec progression et jalons
- [x] Emplacement réservé pour une illustration dédiée
- [ ] Illustration définitive

## Chapitre 5 — 👑 Visionnaire · Apprendre de ses choix

Objectif : relier les décisions dans le temps et transformer l'expérience en repères utiles.

- [x] Chapitre visible avec progression et jalons
- [x] Emplacement réservé pour une illustration dédiée
- [ ] Illustration définitive

### Fondations communes

- [x] États `unlocked`, `current` et `locked`
- [x] Moteur réutilisable des chapitres et jalons
- [x] Modèle de jalon avec `id`, `title`, `description`, `condition`, `status`, `dateUnlocked` et `chapterId`
- [x] Conservation des dates de déverrouillage existantes
- [x] Chapitres verrouillés visibles sans interaction punitive
- [x] Carrousel horizontal centré automatiquement sur le chapitre en cours
- [x] Chapitres accomplis accessibles à gauche et chapitres futurs accessibles à droite
- [x] Indicateurs du carrousel tactiles et cliquables sur mobile et Web
- [x] Jalons présentés dans des cartes compactes sous le chapitre sélectionné
- [x] Progression des jalons sans cadeau, monnaie ni récompense à réclamer
- [x] Progression visuelle par points cochés et segments reliés
- [x] Progression séquentielle cohérente entre chapitres passés, actuel et futurs
- [x] Compteur de jalons placé sous la ligne d'évolution
- [x] Statistiques retirées de l'interface mais conservées dans le moteur du Parcours
- [x] Dossier d'illustrations préparé
- [ ] Illustrations finales réalisées par un illustrateur

### Illustrations

- [x] Architecture des illustrations
- [x] Chargement automatique Light / Dark
- [x] Mapping centralisé
- [x] Illustration plein bord en tête des cartes du Parcours
- [ ] Illustration Explorateur définitive validée
- [ ] Illustration Analyste définitive validée
- [ ] Illustration Stratège définitive validée
- [ ] Illustration Décideur définitive validée
- [ ] Illustration Visionnaire définitive validée

---

## Phase 6 — Decision Inbox

- [ ] Page Decision Inbox
- [x] Notifications internes persistantes
- [x] Rappels internes à échéance
- [ ] Jalons
- [ ] Résultats IA
- [ ] Conseils
- [ ] Décisions à revoir
- [x] Composant de notification unifié
- [x] Notification discrète interne
- [x] Fermeture par croix
- [x] Fermeture automatique
- [x] Positionnement sous la barre de statut et la Dynamic Island
- [x] Swipe horizontal pour fermer les notifications

---

## Phase 7 — App Polish

Objectif : faire de chaque détail une expression cohérente, calme et premium de Décisions, sans ajouter de complexité métier.

### Animations

- [x] Apparition douce des contenus et des cartes principales
- [x] Pression animée avec ressort naturel sur les actions partagées
- [x] Animation progressive de la barre de résultat
- [x] Transitions de pile cohérentes avec le geste de retour
- [x] Respect du réglage système « Réduire les animations »

### Accessibilité

- [x] Zones tactiles principales d'au moins 44 points
- [x] Focus Web visible et centralisé
- [x] Titres structurants annoncés comme en-têtes
- [x] Valeurs accessibles pour les barres de progression
- [x] Actions alternatives VoiceOver pour les gestes de swipe
- [x] Écrans fixes rendus scrollables pour Dynamic Type
- [ ] Audit VoiceOver et TalkBack sur appareils physiques
- [ ] Audit complet avec les tailles de texte d'accessibilité maximales

### Design system

- [x] Couleurs sémantiques centralisées
- [x] Tokens d'espacement, rayons et largeurs de contenu
- [x] Ombres partagées
- [x] Durées, courbes et ressorts d'animation partagés
- [x] Motifs haptiques partagés
- [x] Composants d'apparition et de pression réutilisables
- [x] Tokens typographiques complets

### Typographie

- [x] Familles `display` et `body` remplaçables indépendamment
- [x] Tokens `displayLarge` et `displayMedium`
- [x] Tokens `headingLarge` et `headingMedium`
- [x] Tokens `bodyLarge` et `bodyMedium`
- [x] Token `caption`
- [x] Hiérarchie premium typée pour React Native
- [ ] Migration progressive des écrans vers les tokens centralisés
- [ ] Sélection et intégration de la police de marque définitive

### Qualité et optimisation

- [x] Qualité des textes et formulations raccourcies
- [x] Cohérence des gestes de swipe, maintien, retour et scroll
- [x] Mémorisation des composants partagés pertinents
- [x] Mémorisation des calculs et callbacks des listes
- [x] Abonnement unique au réglage de réduction des animations
- [ ] Profilage sur appareils physiques d'entrée de gamme
- [ ] Tests automatisés des micro-interactions

---

## Cohérence des icônes

- [x] Phosphor Icons installé
- [x] composant AppIcon centralisé
- [x] tokens de tailles et poids
- [x] bottom navigation uniformisée
- [x] audit global des icônes
- [x] suppression des emojis fonctionnels
- [x] accessibilité des icônes
- [x] séparation documentée entre icônes et illustrations

Règles du Design System : les icônes de navigation utilisent toutes le token `lg`, les icônes d'action utilisent `md` ou `lg` selon leur conteneur, et leur taille ne change jamais entre les états actif et inactif. Les icônes fonctionnelles passent par `AppIcon`. Une icône décorative ne remplace jamais une illustration narrative.

---

## Expérience vivante

Ces tâches décrivent le niveau cible pour l'ensemble de l'application. Elles restent ouvertes tant que leur cohérence n'a pas été validée sur tout le parcours.

- [ ] Transitions organiques entre les écrans
- [ ] Les cartes semblent évoluer plutôt que disparaître
- [ ] L'illustration réagit lors d'un jalon débloqué
- [ ] Les chapitres se découvrent progressivement
- [ ] Les notifications deviennent plus discrètes et naturelles
- [ ] Les retours haptiques accompagnent uniquement les moments importants
- [ ] Les animations racontent une intention
- [ ] Les transitions restent fluides à 60 fps
- [ ] Réduire les animations lorsque « Reduce Motion » est activé
- [ ] Toutes les animations sont interrompables

---

## Phase 8 — Expérience émotionnelle

Objectif : faire ressentir une évolution continue sans transformer Décisions en jeu ni ajouter de stimulation gratuite.

- [ ] Illustrations évolutives
- [ ] Micro-interactions
- [ ] Transitions organiques
- [ ] Feedback haptique intelligent
- [ ] Motion Design
- [ ] Ambiance sonore — future réflexion
- [ ] Empty states illustrés
- [ ] Onboarding narratif
- [ ] Animation des chapitres

---

## Decision Journey

Objectif : rendre perceptible un chemin continu entre la première question et l'apprentissage tiré d'une décision. Les fondations techniques du suivi, du bilan et du cercle existent déjà, mais cette phase reste ouverte tant que l'expérience complète n'est pas cohérente et validée de bout en bout.

- [ ] Flow utilisateur clarifié
- [ ] Vocabulaire produit harmonisé
- [x] Actions explicites — passage Résultat → Acter
- [x] Moment Acter redesigné — bilan préalable et wording d'engagement
- [ ] Cercle haptique finalisé
- [ ] Suivi intégré
- [ ] Retour d'expérience

### Écarts identifiés par l'audit

- [ ] Enregistrer une réflexion avant l'étape d'engagement afin de protéger le travail interrompu
- [ ] Donner un rôle clair à l'étape « Clarifier » au-delà du score provisoire
- [x] Remplacer l'action générique « Continuer » entre Résultat et Acter par l'intention réelle
- [x] Annoncer le passage vers l'engagement depuis l'écran Résultat
- [x] Expliquer clairement ce qu'acter signifie sur l'écran d'engagement
- [ ] Offrir un chemin visible pour reprendre sa réflexion après avoir acté
- [x] Faire passer toutes les actions « Terminer » par le retour d'expérience
- [x] Rendre l'action principale de suivi contextuelle à l'option choisie
- [ ] Faire de Mes décisions un point de reprise du parcours, pas seulement une liste de statuts
- [ ] Aligner les libellés accessibles des cartes avec leur destination réelle
- [ ] Valider le maintien, le relâchement et les haptics du cercle sur appareils physiques et sur Web

### Vocabulaire cible

- **Explorer — Explorateur** : créer une réflexion et formuler la question.
- **Analyser — Analyste** : comparer ses arguments.
- **Clarifier — Stratège** : comprendre ce qui compte réellement.
- **Acter — Décideur** : choisir d'avancer avec une décision.
- **Suivre** : observer la décision et préparer le recul nécessaire.
- **Apprendre — Visionnaire** : faire le bilan et transformer l'expérience en repère.

« Suivre » constitue le pont temporel entre Décideur et Visionnaire. Il ne crée pas un sixième rang : il rend possible l'apprentissage.

---

## Boucle Acter → Suivre → Apprendre

Objectif : rendre la sortie de l'acte, le suivi facultatif et le retour d'expérience immédiatement compréhensibles, sans construire toute la Decision Inbox.

- [x] Transition après l'acte clarifiée et retour involontaire vers le cercle empêché
- [x] Question de suivi sans ambiguïté
- [x] Action « Oui, choisir un moment »
- [x] Action « Pas maintenant » sans création de rappel
- [x] Date personnalisée dans un calendrier commun à iOS, Android et Web
- [x] Validation des dates strictement futures
- [x] Gestion locale du jour et sérialisation ISO à midi pour éviter un décalage UTC
- [x] Statut `acted` sans rappel et conservation de `actedAt` et du choix acté
- [x] Statut `tracking` avec une `trackingDate`
- [x] Statut « En suivi » et date de retour visibles dans Mes décisions
- [x] Modification d'un suivi avec affichage de la date actuelle
- [x] Suppression explicite d'un suivi sans suppression de la décision
- [x] Détection centralisée des échéances au démarrage et au retour au premier plan
- [x] Notification interne persistante et dédupliquée par décision et échéance
- [x] Navigation directe du rappel vers le bilan
- [x] Nettoyage des anciennes notifications après modification, suppression ou bilan
- [x] Toutes les fins accessibles passent par le bilan
- [x] Satisfaction, note facultative et `completedAt` enregistrés par le bilan
- [x] Retour vers Mes décisions après le bilan
- [x] Ouverture automatique du filtre « Terminées »
- [x] Décision terminée mise en évidence calmement et temporairement
- [x] Paramètres temporaires de navigation consommés une seule fois
- [x] Statut « Terminée » et coche visibles dans la liste
- [x] Notification « Décision actée » avec action « Voir ma progression » vers Parcours
- [x] Notification d'échéance « Faire le bilan » conservée vers `DecisionReviewScreen`
- [x] Compatibilité des anciennes décisions déjà terminées sans bilan
- [x] Statistiques réelles du Parcours et jalon « Première décision terminée » alimentés par le stockage
- [x] Contrôles automatisés des dates et de la clôture par le bilan
- [x] Douze tests déterministes de la boucle, du service de rappel, de la normalisation et des contrats de navigation
- [ ] Test automatisé intégré avec AsyncStorage natif et navigation rendue
- [ ] Validation de l'annulation et de la sélection existante dans le calendrier interactif
- [ ] Validation de l'absence de doublon après plusieurs cycles réels de modification
- [ ] Validation visuelle Web
- [ ] Validation physique iOS
- [ ] Validation physique Android
- [ ] Test utilisateur du parcours complet

Une compilation valide la cohérence du code, pas le rendu, les gestes, le bouton Retour ou le comportement réel du calendrier sur appareil.

---

## Phase — Expérience premium

Objectif : faire passer Décisions d'un prototype fonctionnel à une bêta cohérente, identifiable et digne de confiance. Cette phase consolide l'expérience existante ; elle ne doit pas ajouter de complexité métier avant que le parcours principal soit fiable et compréhensible.

Constat de départ : le flux principal et la boucle locale de suivi sont fonctionnels, mais l'identité visuelle reste concentrée dans Parcours et dans le cercle d'engagement. Les tokens typographiques ne sont pas encore appliqués aux écrans, les illustrations doivent être optimisées, la Decision Inbox n'a pas d'interface dédiée et certaines actions permettent encore de terminer une décision sans bilan.

### Typographie de marque

- [x] Hiérarchie et tokens typographiques centralisés
- [x] Familles `display` et `body` remplaçables indépendamment
- [ ] Choix de la police de marque définitive
- [ ] Chargement optimisé de la police sur iOS, Android et Web
- [ ] Migration de tous les écrans vers les tokens typographiques
- [ ] Validation avec Dynamic Type et les tailles de texte d'accessibilité

### Illustrations chapitres

- [x] Illustrations Light et Dark présentes pour les cinq chapitres
- [x] Mapping centralisé et intégration dans le carrousel Parcours
- [ ] Validation artistique de la série complète dans son contexte réel
- [ ] Optimisation du poids et des dimensions des dix fichiers PNG
- [ ] Cohérence entre variante d'illustration et thème réel de l'interface
- [ ] États illustrés de découverte et d'accomplissement d'un chapitre

### Système d'icônes

- [x] Bibliothèque Phosphor et composant `AppIcon` centralisé
- [x] Tailles, poids et rôles fonctionnels documentés
- [ ] Revue sémantique finale de chaque icône avant bêta
- [ ] Vérification du contraste et des libellés accessibles sur appareils physiques

### Amélioration Parcours

- [x] Synthèse du chemin actuel et prochaine étape contextuelle
- [x] Chapitres présentés comme une évolution de compétences
- [x] Jalons reliés aux données réelles et à des actions directes
- [x] Réduire les répétitions restantes entre progression globale, chapitre et jalons
- [ ] Validation visuelle de Parcours dans son contexte réel
- [ ] Compréhension du changement de chapitre
- [ ] Validation visuelle du lien entre une carte de chapitre et ses jalons
- [ ] Test utilisateur de la prochaine étape avec des utilisateurs externes
- [ ] Validation mobile de Parcours : petits écrans, tablette, gestes et lecture
- [ ] Validation Web de Parcours : carrousel, focus, gestes et lecture
- [ ] Retirer les composants Parcours hérités devenus inutilisés

### Decision Inbox

- [x] Modèle, stockage et détection des rappels internes persistants
- [x] Actions directes « Voir la décision » et « Faire le bilan »
- [ ] Page Decision Inbox avec historique et états lus / non lus
- [ ] Point d'entrée visible et badge discret dans la navigation
- [ ] Regroupement des rappels, jalons et futurs insights
- [ ] Notifications système locales et préférences de rappel

### Boucle retour d'expérience

- [x] Choix d'une échéance de suivi
- [x] Détection d'une échéance au démarrage et au retour au premier plan
- [x] Bilan avec satisfaction, note personnelle et date de complétion
- [x] Garantir un parcours cohérent vers le bilan depuis chaque action « Terminer »
- [ ] Expliquer clairement la différence entre décision actée, suivie et terminée
- [ ] Restituer l'apprentissage passé dans la fiche décision et le Parcours
- [ ] Tester les migrations, changements d'échéance et rappels sans doublon

### Préparation de la première bêta

- [ ] Onboarding court centré sur la promesse « apprendre à mieux décider »
- [ ] Empty states narratifs et actions de reprise cohérentes
- [ ] Gestion visible des erreurs et récupération des données locales
- [ ] Tests automatisés du cycle création → réflexion → acte → suivi → bilan
- [ ] Audit accessibilité VoiceOver, TalkBack, clavier et focus Web
- [ ] Profilage des listes, illustrations et animations sur appareils physiques
- [ ] Validation iOS, Android et Web sur une matrice de tailles représentative
- [ ] Instrumentation minimale des erreurs et retours de bêta

### Extensions premium ultérieures

- [ ] Animations organiques sur l'ensemble du parcours
- [ ] Haptics contextuels finalisés
- [ ] Dark Mode complet
- [ ] Responsive tablette dédié
- [ ] Widgets
- [ ] Accessibilité validée de bout en bout

---

## Phase 10 — Intelligence Artificielle

- [ ] Génération automatique des Pour
- [ ] Génération automatique des Contre
- [ ] Challenge de la décision
- [ ] Simulation des conséquences
- [ ] Résumé intelligent

---

## Phase 11 — Collaboration

- [ ] Partage
- [ ] Votes
- [ ] Commentaires
- [ ] Travail collaboratif

---

## Phase 12 — Publication

- [ ] Auth Google
- [ ] Auth Apple
- [ ] Cloud
- [ ] Export PDF
- [ ] Préparation App Store
- [ ] Préparation Google Play
