# Decisionly Changelog

Toutes les évolutions notables du produit sont conservées dans ce fichier.

## [Non publié] — Cadrage d'une décision — 2026-08-08

### Ajouté

- Choix par décision entre « Évaluer une option » et « Comparer deux options ».
- Exemples, validation et champs d'options adaptés au format sélectionné.
- Détection d'une formulation ambiguë contenant « ou », avec explication et suggestion de reformulation.
- Champ `format` dans le modèle et association explicite des arguments à `optionA` ou `optionB`.
- Migration progressive : les décisions historiques possédant deux options valides deviennent des comparaisons, les autres restent des évaluations.

### Corrigé

- Le résultat transmet désormais l'option réellement choisie au cercle d'engagement au lieu de remplacer temporairement le titre de la décision.
- Le cercle affiche et sauvegarde le choix concret dans `chosenOption`.
- La fiche décision présente les arguments sous le nom de chaque option et restitue le choix retenu.
- Mes décisions et l'écran de suivi conservent la visibilité du choix acté.

### Conservé

- Direction artistique, calcul provisoire non pondéré, cercle d'engagement, stockage local et compatibilité Expo SDK 54.
- Les tests utilisateurs des deux formats restent nécessaires avant de considérer le cadrage comme validé par le terrain.

## [Non publié] — Passage de la réflexion à l'engagement — 2026-08-02

### Amélioré

- L'écran Résultat devient une étape de bilan intitulée « Votre décision est prête ».
- La décision, les arguments Pour et Contre, la tendance actuelle et un message de recul préparent désormais explicitement l'engagement.
- Le bouton générique « Continuer » devient « Acter ma décision ».
- L'écran de maintien adopte un ton plus intentionnel avec « Prenez un instant ».
- L'action secondaire devient « Je veux encore réfléchir » et conserve son comportement existant.
- L'instruction du cercle privilégie la confirmation du choix tout en restant explicite sur le maintien.

### Conservé

- Navigation Résultat → Engagement → Suivi.
- Maintien circulaire, progression, haptics, stockage et transitions de statut existants.

## [Non publié] — Audit Decision Journey — 2026-08-02

### Documenté

- Chemin cible « Explorer → Analyser → Clarifier → Acter → Suivre → Apprendre ».
- Correspondance entre les étapes d'une décision et les chapitres Explorateur, Analyste, Stratège, Décideur et Visionnaire.
- Principe selon lequel une action principale décrit sa conséquence réelle plutôt qu'un générique « Continuer ».
- Expérience attendue du passage entre résultat, engagement, suivi et retour d'expérience.

### Écarts identifiés

- Une réflexion interrompue avant l'écran d'engagement n'est pas encore persistée.
- L'étape « Clarifier » reste limitée par un score où les arguments comptent de manière égale.
- Le résultat et le suivi utilisent encore une action principale « Continuer » trop générique.
- Certaines actions permettent de terminer une décision sans passer par le bilan.
- Le retour vers la réflexion après avoir acté n'est pas exposé clairement dans l'interface.
- Le cercle est fonctionnel mais nécessite encore une validation comportementale et haptique sur appareils physiques.

### Code

- Aucun écran, composant, service ou comportement n'a été modifié pendant cet audit.

## [Non publié] — Design System typographique — 2026-08-02

### Ajouté

- Familles centralisées `display` et `body`, remplaçables indépendamment.
- Sept tokens sémantiques : `displayLarge`, `displayMedium`, `headingLarge`, `headingMedium`, `bodyLarge`, `bodyMedium` et `caption`.
- Échelle premium avec titres en poids 700/800, tracking négatif discret et corps plus calme.
- Typage React Native garantissant la validité de chaque style typographique.

### Préparé

- Remplacement futur de la police de marque depuis `theme.ts` uniquement.
- Migration progressive des écrans, sans modification visuelle ni structurelle dans cette itération.

## [Non publié] — Parcours comme évolution personnelle — 2026-08-02

### Ajouté

- Synthèse unique réunissant le chapitre actuel, la progression globale et la prochaine étape.
- Compétence narrative propre à chaque chapitre : comprendre, explorer, identifier, agir puis apprendre.
- États de voyage explicites « Terminé », « En cours » et « Prochain ».

### Amélioré

- Le carrousel devient la seule zone illustrée du Parcours afin de donner un rôle clair aux images.
- Les jalons sont introduits par « Comment avancer » et conservent leurs actions contextuelles directes.
- Les cartes de chapitre sont plus compactes et racontent une évolution plutôt qu'un rang.
- Le wording et la hiérarchie privilégient « J'apprends à mieux décider » plutôt qu'une lecture de dashboard.

### Simplifié

- Suppression de la grande carte illustrée qui répétait le chapitre actuel.
- Intégration de l'ancienne carte « Prochaine étape » dans la synthèse supérieure.
- Retrait du tableau de statistiques visible ; ses données continuent d'alimenter le moteur des jalons.

### Documenté

- Réflexion sur le nom final autour de la réflexion, l'évolution, la confiance, l'apprentissage et la progression.

## [Non publié] — Boucle de suivi complète — 2026-08-02

### Ajouté

- Fiche décision centrale avec statut, dates, arguments et actions adaptées au cycle de vie.
- Écran de bilan avec trois ressentis, note personnelle facultative et message de clôture calme.
- Service de détection des suivis arrivés à échéance au démarrage et au retour au premier plan.
- Stockage local persistant des notifications internes avec déduplication par décision et échéance.
- Notification « Il est temps de refaire le point » menant directement au bilan.
- Compteurs locaux pour les suivis planifiés et les bilans réalisés dans Parcours.

### Modifié

- Le choix de suivi propose uniquement une semaine, un mois, trois mois, six mois ou « Je choisirai plus tard ».
- « Je choisirai plus tard » conserve le statut `acted` et ne crée aucune `trackingDate`.
- « Voir la décision » ouvre désormais la fiche décision au lieu de l'écran d'édition Pour / Contre.
- Une décision en suivi permet de modifier son échéance, faire son bilan ou la terminer.
- Un bilan enregistré renseigne `reviewNote`, `satisfaction` et `completedAt`, puis passe la décision à `completed`.
- Le stockage corrige progressivement une ancienne décision `tracking` sans date en décision `acted`.

### Limites conservées

- Aucune notification système n'est programmée : les rappels sont internes à Decisionly.
- La page complète Decision Inbox reste à construire.
- Aucun traitement ne s'exécute lorsque l'application est entièrement fermée ; le rappel est créé à la prochaine ouverture ou au prochain retour au premier plan.


## [Non publié] — Suivi des décisions — 2026-08-02

### Ajouté

- Statut `tracking` et dates `actedAt`, `trackingDate` et `completedAt` dans le modèle Decision.
- Champs préparés `reviewNote` et `satisfaction` pour le futur retour d'expérience.
- Migration progressive des décisions locales existantes, sans changement de clé de stockage.
- Écran facultatif « Quand souhaitez-vous faire le point ? » après l'engagement.
- Choix de suivi à une semaine, un mois, trois mois ou six mois, ainsi que les options sans échéance.
- Filtres Toutes, En cours, Actées, Terminées et Archivées dans Mes décisions.
- Présentation centralisée de tous les statuts sur les cartes de décision.
- Modèle commun `AppNotification` et types préparés pour la future Decision Inbox.
- Notification « Décision actée » avec accès direct à la décision concernée.

### Modifié

- Le parcours devient Réflexion → Décision → Action → Retour d'expérience.
- Une décision suivie peut être marquée comme terminée depuis Mes décisions.
- Les statistiques du Parcours comptabilisent désormais le statut `tracking` à partir des données réellement stockées.
- L'édition d'une décision conserve ses dates et futurs champs de retour d'expérience.
- Les notifications internes distinguent désormais un titre, un message, un type, une date, un état de lecture et une action structurée.

### Corrigé

- Rotation du cercle d'engagement rendue compatible avec le DOM Web sans propriété SVG invalide.

### Préparé, non livré

- Aucun rappel système n'est encore programmé.
- La Decision Inbox, la note de retour d'expérience et la satisfaction restent à implémenter.
- Aucune IA ni nouvel écran hors du suivi demandé n'a été ajouté.

## [Non publié] — Première expérience Parcours — 2026-08-02

### Ajouté

- Hero « Mon parcours » présentant le chapitre actuel, sa phrase, son illustration et sa progression.
- Hiérarchie narrative : chapitre, prochaine étape, progression des chapitres puis historique des jalons.
- Intégration du mapping Light / Dark existant dans le nouveau hero, avec les placeholders déjà préparés.
- Date d'accomplissement visible pour les jalons terminés.

### Amélioré

- Carte « Votre prochaine étape » renforcée avec une icône fonctionnelle et le système `nextAction` existant.
- Jalons accomplis mieux différenciés et jalons disponibles orientés vers une action concrète.
- Apparitions douces du hero, de la prochaine étape et des jalons, avec respect de « Réduire les animations ».
- Couleurs d'ambiance des illustrations centralisées pour les cartes du Parcours.

### Non modifié

- Règles des jalons, navigation principale, stockage et autres écrans de l'application.

## [Non publié] — Fondations émotionnelles — 2026-08-02

### Défini

- Mission centrale : aider progressivement chacun à devenir un meilleur décideur, sans fournir de réponse à sa place.
- Réussite produit mesurée par la confiance et les compétences développées, pas uniquement par les décisions terminées.
- Principe UX « Je progresse » plutôt que « Je remplis un formulaire ».
- Règles non négociables pour des animations intentionnelles, calmes, compréhensibles et accessibles.

### Clarifié

- Le Parcours représente l'évolution de la manière de réfléchir, jamais une suite de niveaux.
- Les cinq chapitres sont associés aux compétences Découvrir, Comprendre, Comparer, S'engager et Transmettre.
- Les illustrations représentent des étapes du Parcours et ne servent jamais de décoration gratuite.

### Planifié

- Section « Expérience vivante » consacrée aux transitions, micro-interactions, haptics, performances et préférences de mouvement.
- Nouvelle phase « Expérience émotionnelle » regroupant les futures illustrations évolutives, l'onboarding narratif et le Motion Design.

### Non modifié

- Aucun écran, composant, comportement, contenu stocké ou parcours de navigation.

## [Non publié] — Guidage des jalons — 2026-08-02

### Ajouté

- Carte « Prochaine étape » affichant automatiquement le premier jalon restant du chapitre courant.
- Actions contextuelles menant directement à la création, à une décision en cours ou à Mes décisions.
- Modèle `nextAction` avec libellé, écran cible et identifiant de décision optionnel.
- Sélection automatique par le moteur de la décision en cours ou la plus avancée.
- Progression chiffrée visible sur chaque carte de jalon.

### Clarifié

- Consignes des jalons reformulées comme des actions concrètes et compréhensibles dès la première utilisation.
- Remplacement de l'état ambigu « En chemin » par « Action disponible ».
- Les jalons terminés restent inchangés et ne proposent aucune action supplémentaire.

### Non modifié

- Navigation principale, règles de déverrouillage, statistiques et direction artistique du Parcours.

## [Non publié] — Cohérence des icônes — 2026-08-02

### Ajouté

- Phosphor React Native comme source unique des icônes fonctionnelles.
- Composant centralisé `AppIcon` avec mapping typé, tailles, poids, états et comportement d'accessibilité.
- Tokens `iconSizes` et `iconWeights` dans le Design System.

### Harmonisé

- Bottom navigation avec `House`, `ListChecks`, `Compass` et `UserCircle`, tous en 24 points.
- États inactifs en trait régulier et états actifs pleins, sans changement de taille ni déplacement.
- Icônes de retour, ajout, suppression, archivage, fermeture, confirmation, profil, données locales et états de décision.
- Alignement des labels, zones tactiles et libellés accessibles de la navigation principale.

### Documenté

- Séparation durable entre les icônes fonctionnelles Phosphor et les illustrations narratives sur mesure.
- Icons8 Ouch! limité aux placeholders temporaires de test, sans intégration dans cette itération.

### Non modifié

- Navigation, fonctionnalités métier et illustrations du Parcours.

## [Non publié] — Décisions terminées — 2026-08-02

### Ajouté

- Action visible « Marquer comme terminée » sur chaque décision actée.
- Transition persistée `acted` → `completed` avec notification « Décision terminée ».
- Action temporaire « Annuler » restaurant la décision actée.
- Section dédiée « Décisions terminées » et badge de statut associé.

### Corrigé

- Le jalon « Première décision terminée » peut désormais être réellement débloqué depuis l'interface.

## [Non publié] — Architecture des illustrations — 2026-08-02

### Ajouté

- Arborescence définitive des illustrations du Parcours pour les cinq niveaux et leurs variantes Light / Dark.
- Mapping centralisé des sources d'images dans `journeyIllustrations.ts`.
- Sélection automatique de la variante adaptée au thème système.
- Placeholders PNG remplaçables sans modification du code.

### Modifié

- Les niveaux retrouvent les intitulés Explorateur, Analyste, Stratège, Décideur et Visionnaire.
- Les jalons existants restent tous conservés ; ceux de l'ancien sixième chapitre rejoignent Visionnaire.
- Les illustrations occupent désormais toute la largeur supérieure de leur carte, sans padding autour de l'image.
- La barre de progression des chapitres est remplacée par des jalons reliés : points cochés et violets lorsqu'ils sont terminés, points blancs lorsqu'ils restent à parcourir.
- Le compteur `x / x jalons` apparaît désormais sous la ligne d'évolution.

### Corrigé

- La progression du chapitre en cours se remplit désormais strictement de gauche à droite, sans coche prématurée sur un jalon avancé.
- Les chapitres passés affichent tous leurs points cochés et les chapitres futurs uniquement des points vides avec contour.

### Amélioré

- Les indicateurs du carrousel sont désormais tactiles et cliquables pour ouvrir directement chaque chapitre sur mobile et Web.
- Chaque indicateur dispose d'une zone d'interaction de 44 points, d'un état sélectionné accessible et d'un focus clavier visible sur le Web.

### Non modifié

- Navigation, structure des écrans, calculs de jalons et fonctionnalités métier.

## [Non publié] — Ergonomie de saisie — 2026-08-02

### Amélioré

- Le bouton « Analyser ma décision » se retire pendant la saisie d'un argument et revient automatiquement après la fermeture du clavier.
- Le champ et le bouton `+` disposent désormais de tout l'espace utile lorsque le clavier mobile est ouvert.
- La touche « Terminé » ajoute l'argument courant puis ferme le clavier.
- Les libellés d'accessibilité précisent le comportement des actions d'ajout.

### Principe UX

- Une action finale sticky ne doit pas concurrencer l'action locale d'un champ actif.

## [Non publié] — Identité du Parcours — 2026-08-02

### Ajouté

- Nouvelle narration du Parcours en six chapitres visibles.
- États de chapitre débloqué, en cours et verrouillé.
- Progression et jalons contextualisés dans chaque chapitre.
- Moteur de jalons réutilisable avec rattachement à un chapitre.
- Placeholders d'illustrations et convention de fichiers pour le futur illustrateur.
- Document `NON_NEGOTIABLES.md` définissant les règles immuables du produit.
- Section produit « Pourquoi un parcours ? ».

### Modifié

- La page Parcours raconte désormais une évolution personnelle avant de présenter les statistiques.
- Les chapitres sont désormais présentés dans un carrousel horizontal positionné sur le chapitre en cours.
- Les chapitres accomplis restent consultables à gauche et les chapitres futurs à droite.
- Les jalons quittent les grandes cartes de chapitre pour devenir des cartes compactes sous le carrousel.
- La progression des jalons ne comporte aucun cadeau ni récompense à réclamer.
- Le prototype de niveaux Explorateur, Analyste, Stratège, Décideur et Visionnaire est remplacé par des chapitres narratifs.
- Les Achievements internes deviennent des jalons avec `chapterId`.
- Les statistiques sont reléguées sous les chapitres.
- La clé de stockage historique est conservée afin de préserver les dates déjà enregistrées.

### Non inclus

- Aucune illustration finale : seuls les emplacements et la direction sont préparés.
- Aucune mécanique de jeu, récompense, XP, monnaie ou compétition.

## [Non publié] — App Polish — 2026-08-02

### Ajouté

- Design system enrichi avec couleurs sémantiques, espacements, rayons, largeurs, ombres, durées, courbes et ressorts partagés.
- Composant de pression animé et accessible, avec focus Web et haptique optionnelle.
- Composant d'apparition douce réutilisable pour les contenus et les cartes.
- Prise en charge centralisée du réglage système « Réduire les animations ».
- Actions VoiceOver alternatives pour Archiver et Supprimer sans dépendre du swipe.
- Valeurs accessibles sur les barres de progression.

### Amélioré

- Entrées visuelles des écrans, cartes et sections principales.
- Feedback de pression des boutons et actions secondaires.
- Animation de la barre de résultat.
- Retour gestuel natif et transition de pile coordonnée au geste.
- Zones tactiles, focus clavier Web et structure des titres.
- Compatibilité Dynamic Type des écrans Accueil et Profil.
- Cohérence des swipes de décision et de notification.
- Textes raccourcis sur Mes décisions, Archives, Profil et l'étape d'engagement.
- Calculs, callbacks et composants partagés mémorisés lorsque pertinent.

### Non modifié

- Aucun nouveau parcours métier ni changement du cycle de vie des décisions.
- Expo reste strictement en SDK 54.

## [Non publié] — 2026-08-02

### Ajouté

- Écran dédié « Acter ma décision » entre le résultat et Mes décisions.
- Cercle d'engagement à maintien d'environ deux secondes, réservé à l'action d'acter.
- Progression circulaire sans compteur, décroissance lente après relâchement et reprise depuis la progression restante.
- État de confirmation calme avec cercle plein et coche.
- Retours haptiques mobiles au démarrage, aux paliers et à la confirmation.
- Alternative Web entièrement visuelle, sans vibration.
- Action « Continuer plus tard » sauvegardant la décision en cours de réflexion.
- Utilisation effective du statut `acted` et de la transition `reflecting` → `acted`.
- Section « Décisions actées » dans la liste principale.
- Badge « Actée » sur les décisions concernées.
- Notification « Décision actée » avec action temporaire « Annuler ».
- Restauration de l'état précédent lorsque l'utilisateur annule.
- Fermeture de la notification par croix, disparition automatique ou swipe horizontal.

### Modifié

- Le résultat mène désormais à l'étape d'engagement au lieu de terminer directement la décision.
- La logique d'animation, les haptics et la persistance du geste d'engagement sont isolées dans des modules dédiés.
- La roadmap suit maintenant le parcours utilisateur : Fondation, Réflexion, Engagement, Mes décisions et Parcours.
- La vision produit distingue explicitement le calcul de réflexion du passage à l'engagement.

### Limites connues et suites prévues

- Les retours haptiques nécessitent encore une validation sensorielle sur appareils iOS et Android physiques.
- Le choix d'une date de suivi après engagement reste à concevoir.
- L'historique horodaté complet des transitions de statut reste à implémenter.
- Les tests automatisés de gestes et d'interface restent à mettre en place.

## [Non publié] — 2026-08-01

### Ajouté

- Bottom Navigation : Accueil, Mes décisions, Parcours et Profil.
- Cycle de vie extensible des décisions avec six statuts et transitions centralisées.
- Swipe de droite vers gauche sur les décisions avec actions Archiver et Supprimer.
- Annulation après archivage ou suppression via la notification interne.
- Page Archives avec restauration et suppression.
- Première version de Parcours avec niveau, statistiques et jalons.
- Service de statistiques indépendant des composants.
- Moteur d'Achievements configurable avec conditions, récompenses, statuts et dates de déverrouillage persistantes.
- Première page Profil et accès secondaire aux archives.
- Premiers tokens de Design System pour les espacements et les rayons.

### Modifié

- Le flux de création revient désormais vers Mes décisions après la sauvegarde.
- Les décisions sont séparées entre liste active et archives sans perdre leurs arguments Pour / Contre.
- La notification interne accepte maintenant une action contextuelle, notamment « Annuler ».
- Les données existantes restent compatibles avec le modèle de cycle de vie enrichi.

### Corrigé

- Position de la notification sous la barre de statut et la Dynamic Island.
- Gestion des erreurs de chargement et de sauvegarde sur les écrans persistants.
