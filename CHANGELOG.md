# Décisions — Changelog

Toutes les évolutions notables du produit sont conservées dans ce fichier.

## [Non publié] — Renommage de la marque — 2026-08-09

### Nouveau nom

- La marque visible passe de **Decisionly** à **Décisions**.
- Ce changement évite la lecture involontaire « Decision Only », qui réduisait la vision du produit à un choix unique et définitif.
- Le pluriel représente un accompagnement dans le temps : chaque décision contribue à un chemin continu de réflexion, d'engagement et d'apprentissage.
- Le nom affiché conserve toujours son accent : « Décisions ».
- Le nom technique du package devient `decisions` lorsqu'un identifiant ASCII minuscule est requis.

### Compatibilité préservée

- Le `slug` Expo `decisionly` reste inchangé afin de ne pas créer une nouvelle identité de projet.
- Les clés locales historiques `@decisionly/decisions/v1`, `@decisionly/notifications/v1` et `@decisionly/achievements/v1` restent inchangées afin que toutes les données existantes restent accessibles.
- Le dossier du projet, les types métier `Decision*`, les routes, le modèle, le stockage, la navigation, les fonctionnalités, les versions et les dépendances ne sont pas renommés.
- Les références à l'ancien nom dans les entrées antérieures de ce changelog restent conservées comme historique du projet.

### Validation

- Configuration Expo effective : nom visible « Décisions », slug interne `decisionly` et SDK `54.0.0`.
- Typecheck TypeScript réussi.
- Vingt-huit tests automatisés existants réussis.
- Expo Doctor réussi : 18 contrôles sur 18.
- Bundles de production Web, iOS et Android générés avec succès.
- Le document Web généré porte le titre « Décisions ».
- Aucun script lint n'est configuré et aucun test visuel sur appareil physique n'est revendiqué.

## [Non publié] — Résultat et engagement compacts — 2026-08-09

### État réel avant modification

- Le résultat répétait les options, la tendance, les arguments importants et le rôle non décisionnaire de Decisionly dans plusieurs zones successives.
- Les détails complets des deux options étaient affichés immédiatement, y compris des états vides comme « Aucun élément important ».
- L'option en tête recevait directement l'action principale : elle devenait de fait le choix par défaut, sans sélection explicite préalable.
- Plusieurs grands boutons se trouvaient après tout le contenu et le CTA principal disparaissait pendant le scroll.
- L'écran d'engagement utilisait un titre, une carte et un paragraphe longs, des espacements fixes et un cercle fixe de 224 points ; l'action « Je veux encore réfléchir » pouvait être repoussée sous la zone visible.

### Résultat simplifié et progressif

- Le premier niveau conserve la question, les deux options, leur balance, leur état textuel, leurs nombres d'atouts et de freins, ainsi que l'argument le plus important lorsqu'il existe.
- Les listes complètes, leur côté et leur importance passent derrière « Voir le détail de la comparaison » / « Réduire le détail », sans modale ni nouvel écran.
- Une option sans contenu n'affiche plus de section vide.
- Une seule phrase rappelle que la tendance aide à choisir sans décider à la place de l'utilisateur.
- Les surfaces restent neutres ; les badges sémantiques associent couleur et libellé pour distinguer avance favorable, vigilance, freins et égalité.

### Sélection et actions

- Aucune nouvelle réflexion ne présélectionne l'option en tête ; un choix explicite antérieur conservé dans `chosenOption` reste restauré.
- Les deux cartes ont le même rôle radio, la même surface tactile et le même état sélectionné.
- Le CTA unique reste désactivé avec « Choisissez une option », puis devient « Continuer avec … » après sélection. Il mène au cercle sans acter immédiatement la décision.
- Le CTA et l'action compacte « Revoir mes arguments » restent dans un footer lisible et stable pendant le scroll.
- « Je souhaite encore réfléchir » conserve sa sauvegarde en `reflecting`, l'effacement du choix provisoire et le retour à Mes décisions.

### Engagement compact

- La hiérarchie devient « Acter ma décision » → « Confirmez votre choix » → choix concret → message court de réversibilité → cercle.
- La comparaison, les arguments et la question ne sont plus répétés sur cet écran.
- Le cercle choisit une taille centralisée de 176, 200 ou 224 points selon la hauteur disponible ; rayon, circonférence, épaisseur, progression et centrage SVG sont recalculés à partir de cette taille.
- L'écran réduit ses marges sur une faible hauteur, évite toute hauteur minimale artificielle et conserve un scroll de sécurité dans la Safe Area.
- L'action « Je veux encore réfléchir » reste directement sous le cercle et conserve son comportement métier.

### Comportements conservés

- Aucun changement du calcul, des balances, des poids Secondaire / Important / Décisif, du modèle `Decision`, des migrations, du stockage, des versions ou des dépendances.
- `chosenOption`, la navigation vers l'engagement, le maintien d'environ deux secondes, la progression circulaire, les haptics, Reduce Motion et l'alternative Web restent en place.

### Validation actuelle

- Typecheck TypeScript réussi après l'implémentation.
- Treize tests automatisés rejouables réussis pour les tendances comparatives et simples, les absences d'atout ou de frein, les éléments décisifs, la sélection explicite, les sections vides, les tailles du cercle et la durée du maintien.
- Les quinze tests automatisés existants de la boucle de suivi restent réussis.
- Aucun script lint n'est configuré dans le projet.
- Expo Doctor réussi : 18 contrôles sur 18.
- Bundles de production Web, iOS et Android générés avec succès.
- Le serveur Web local a démarré, mais aucun navigateur n'était connecté à l'environnement : aucun test visuel ou interactif Web n'est revendiqué.
- Les validations visuelles petit/grand iPhone, Android, Web, Dynamic Type et Reduce Motion restent ouvertes.
- Aucun test tactile sur appareil physique et aucun test utilisateur ne sont revendiqués.

## [Non publié] — Boucle Acter → Suivre → Apprendre — 2026-08-09

### État réel avant modification

- Après le cercle, les quatre échéances et « Je choisirai plus tard » apparaissaient immédiatement.
- « Je choisirai plus tard » conservait `acted` sans `trackingDate`, mais pouvait aussi supprimer silencieusement une échéance existante.
- Aucune date personnalisée n'était disponible.
- Mes décisions et la fiche d'une décision en suivi pouvaient attribuer directement `completed` sans bilan.
- Après le bilan, « Voir ma décision » ouvrait la fiche au lieu de revenir à la mémoire des décisions.
- La notification « Décision actée » proposait « Voir la décision » alors que l'utilisateur se trouvait déjà dans Mes décisions.
- Le filtre « Terminées » et la présentation du statut existaient, mais la navigation ne pouvait ni demander ce filtre ni mettre une décision précise en évidence.

### Intention de suivi clarifiée

- L'écran existant demande d'abord « Souhaitez-vous faire le point plus tard ? ».
- « Oui, choisir un moment » révèle progressivement les quatre raccourcis et « Choisir une date ».
- « Pas maintenant » sauvegarde une décision `acted`, sans `trackingDate`, en conservant `actedAt` et le choix concret.
- Une date validée sauvegarde `trackingDate` et place la décision en `tracking`.
- L'action principale devient « Planifier ce suivi » et reste désactivée sans date future.
- Depuis la fiche d'une décision actée, l'action devient « Choisir un moment pour faire le point ».
- Dans Mes décisions, une carte au statut « En suivi » affiche explicitement sa date de retour plutôt que sa seule date de mise à jour.

### Date personnalisée

- Calendrier compact commun à iOS, Android et Web, sans nouvelle dépendance et sans modale plein écran.
- Navigation entre les mois et les années, jours passés et jour courant désactivés, confirmation et annulation explicites.
- Construction du jour en heure locale à midi avant sérialisation ISO : aucune chaîne `AAAA-MM-JJ` n'est analysée implicitement en UTC.
- Les raccourcis conservent le bornage au dernier jour du mois cible.

### Modification et suppression

- « Modifier le suivi » affiche la date actuelle et permet un autre raccourci ou une autre date.
- « Supprimer ce suivi » efface `trackingDate`, revient à `acted` et conserve `actedAt`, le choix et la décision.
- Les notifications d'échéance précédentes sont marquées comme lues après planification, modification, suppression ou bilan.
- L'hôte de notification réagit immédiatement aux changements du stockage afin qu'une ancienne échéance déjà affichée ne reste pas active.

### Toutes les fins passent par le bilan

- Les actions directes « Marquer comme terminée » et « Terminer » ont été retirées.
- Mes décisions propose « Faire le bilan » pour `acted` et `tracking`.
- La fiche conserve « Faire le bilan » et « Modifier le suivi » selon le statut.
- La clôture utilisée par l'interface est centralisée dans `completeDecisionFromReview`, qui enregistre satisfaction, note facultative, `completedAt` et statut `completed`.
- Une ancienne décision déjà `completed` sans satisfaction garde son statut et sa date, avec l'action « Ajouter un bilan ».

### Retour après le bilan

- « Retour à mes décisions » remplace « Voir ma décision ».
- La navigation réinitialise la pile, ouvre le filtre « Terminées » et transmet une seule fois l'identifiant concerné.
- La décision, remontée par son `updatedAt`, reçoit une bordure et un fond doux pendant 2,8 secondes.
- Les paramètres temporaires sont nettoyés afin que l'effet ne se répète pas.

### Notifications

- « Décision actée » propose désormais « Voir ma progression » et ouvre Parcours.
- Le nouveau type d'action `view-journey` est compris par la navigation et par la normalisation du stockage.
- Les anciennes actions `view-decision` restent lisibles pour la compatibilité.
- Une action inconnue stockée est ignorée au lieu de faire planter l'application.
- La notification d'échéance affiche « Il est temps de faire le point » et « Faire le bilan » vers `DecisionReviewScreen`.
- Son type `decision_followup_due` est transmis au composant visuel afin que le rappel utilise bien sa présentation d'échéance.

### Migration et compatibilité

- Aucune clé de stockage, version Expo ou structure de décision n'est modifiée.
- Aucune migration destructive n'est nécessaire.
- Les normalisations progressives existantes et les décisions historiques terminées sans bilan sont conservées.

### Validation technique actuelle

- Typecheck TypeScript réussi.
- Quinze tests automatisés rejouables couvrent les quatre raccourcis, les dates futures, le fuseau local, les fins de mois, le changement d'année, les transitions de suivi et la clôture par le bilan.
- Douze tests supplémentaires couvrent « Pas maintenant », planification, modification, suppression, formats évaluation/comparaison, trois ressentis, anciennes données, échéances futures et arrivées, persistance, déduplication, rappel obsolète, statistiques et contrats de navigation/Safe Area/clavier.
- Aucun script lint n'est configuré dans le projet.
- Expo Doctor réussi : 18 contrôles sur 18.
- Bundles de production Web, iOS et Android générés avec succès.
- Le serveur Web local a répondu et son bundle de développement a été généré ; aucun navigateur n'était disponible pour un test interactif.
- Decisionly a été compilé et ouvert dans Expo Go sur l'iPhone 17 Pro Max simulé. L'écran d'accueil d'Expo Go est resté au premier plan et l'automatisation des touches était interdite par macOS : aucun scénario fonctionnel iOS n'est revendiqué.
- Aucun émulateur Android n'était disponible, car `adb` n'est pas installé.

### Limites ouvertes

- Parcours complet non exécuté dans une interface réelle à ce stade.
- Annulation du calendrier, boutons Retour et mise en évidence à valider visuellement.
- Absence de doublon à confirmer après plusieurs changements réels d'échéance.
- Validations Web, appareils iOS/Android, accessibilité et test utilisateur encore ouvertes.

## [Non publié] — Stabilité UX du swipe et du clavier — 2026-08-09

### Cause identifiée

- Chaque `SwipeableDecisionRow` conservait seule sa translation et son état ouvert dans des références locales.
- `DecisionListScreen` ne connaissait pas la carte ouverte et ne pouvait donc pas la fermer lors d'un scroll, d'un filtre ou d'une perte de focus.
- Plusieurs ressorts `Animated.spring` pouvaient se succéder sans arrêt centralisé ni remise à zéro explicite au démontage.
- Le seuil horizontal, trop proche du mouvement vertical, pouvait capturer un scroll légèrement diagonal.
- Les champs d'arguments ne transmettaient aucune position au `ScrollView` : `KeyboardAvoidingView` réduisait la zone, mais ne garantissait pas la visibilité du dernier champ ou de ses actions.

### Architecture retenue

- Interface impérative `SwipeableDecisionRowHandle` avec `close()` et `isOpen()`.
- Références stables conservées par la liste et identifiant unique de la carte ouverte.
- Fermeture de la carte précédente dès qu'un nouveau geste horizontal commence.
- Arrêt de toute animation précédente avant un nouveau ressort et nettoyage au démontage.
- Fonctions pures isolant la capture horizontale et la destination finale du swipe.

### Fermetures automatiques

- Début du scroll vertical.
- Changement de filtre.
- Rechargement important de la liste.
- Ouverture d'une autre carte.
- Ouverture de la fiche décision ou des archives.
- Archivage ou suppression.
- Perte de focus, changement d'écran et démontage.

### Clavier

- Les champs d'ajout et de modification transmettent leur cible native à l'écran.
- Le `ScrollView` révèle le champ au focus, puis recommence après l'animation du clavier.
- Un espace inférieur temporaire permet de remonter le dernier groupe Atouts/Freins.
- Le bouton `+` reste dans la même ligne que le champ et le footer d'analyse reste masqué pendant la saisie.
- Les comportements existants « Terminé », fermeture au scroll et `keyboardShouldPersistTaps="handled"` sont conservés.

### Validation réelle

- Typecheck TypeScript réussi sans erreur.
- Expo Doctor réussi : 18 contrôles sur 18.
- Bundles de production Web, iOS et Android générés avec succès.
- Onze contrôles déterministes temporaires ont validé la priorité verticale, le retour vers la droite et les swipes partiels, lents et rapides.
- Le simulateur iPhone 17 Pro Max a démarré, mais l'installation d'Expo Go n'a pas abouti : aucune validation interactive iOS n'est donc revendiquée.
- Aucun émulateur Android n'était disponible et le navigateur intégré n'était pas accessible.
- Aucun test tactile iOS ou Android, aucun test visuel Web et aucun test Dynamic Type ne sont revendiqués à ce stade.

### Restant ouvert

- Validation tactile sur grands iPhone et Android.
- Validation visuelle interactive Web.
- Dynamic Type, VoiceOver et TalkBack.
- Action visible « Archiver la décision » dans la fiche, pour que le swipe ne reste pas le seul moyen d'archiver.
- Animation pédagogique du swipe, après validation de sa stabilité et choix d'une persistance proportionnée.

## [Non publié] — Audit de clôture de Comparaison équilibrée — 2026-08-09

### Statut réel

- L'implémentation technique de Comparaison équilibrée est terminée et compilable.
- Sa validation UX sur appareils physiques et avec des utilisateurs reste ouverte.
- Les exports Web, iOS et Android prouvent la compilation du code, pas la qualité du rendu ou la compréhension de l'interface.

### Nature des contrôles annoncés

- Les 13 contrôles précédemment annoncés étaient des contrôles déterministes exécutés avec un script Node temporaire.
- Le script compilait les fonctions TypeScript utiles dans `/tmp`, les appelait avec des données préparées et vérifiait leurs résultats avec des assertions.
- Aucun fichier de test n'a été ajouté au projet et aucune commande de test rejouable n'existe dans `package.json`.
- Ces contrôles ne sont donc ni des tests automatisés enregistrés, ni une vérification visuelle, ni un test utilisateur.

### Corrigé après audit

- Une option dont la balance est nulle ou négative peut rester en tête, mais n'utilise plus le vert favorable.
- Le résultat utilise désormais un ton d'avertissement doux et précise qu'aucune option ne se dégage favorablement lorsque la meilleure balance est inférieure ou égale à zéro.
- Une égalité entre deux balances négatives signale des points de vigilance importants et conserve une tendance partagée.
- Les libellés « En tête, avec vigilance », « Davantage de freins actuellement » et « Points de vigilance partagés » accompagnent la couleur.
- Chaque carte d'option possède une annonce accessible résumant son état, sa balance, ses atouts et ses freins.

### Importance clarifiée

- Secondaire = 1, Important = 3 et Décisif = 5 restent inchangés.
- Un élément décisif pèse davantage que quatre éléments secondaires, mais pas davantage qu'un nombre illimité d'éléments.

### Validations encore ouvertes

- Tests automatisés enregistrés et rejouables.
- Validation visuelle interactive sur mobile et Web.
- VoiceOver et TalkBack sur appareils physiques.
- Tests utilisateurs du mode comparaison.
- Validation visuelle et compréhension de Parcours.

## [Non publié] — Comparaison équilibrée — 2026-08-09

### État avant modification

- Le modèle possédait déjà `side`, `optionKey` et un champ facultatif `weight` de 1 à 5.
- Le mode comparaison associait cependant tous les `pros` à l'option A et tous les `cons` à l'option B : les freins propres à chaque option ne pouvaient pas être saisis.
- Le résultat comptait les arguments sans soustraire les freins ni utiliser leur importance.

### Ajouté

- Cartes Option A et Option B conservées sur un écran unique, chacune avec les sections « Atouts » et « Freins ».
- Sélection mobile de l'importance : Secondaire, Important ou Décisif, avec « Important » par défaut.
- Modification du texte et de l'importance d'un argument existant, en plus de l'ajout et de la suppression.
- Balance propre à chaque option, égale aux atouts pondérés moins les freins pondérés.
- Synthèse comparative distinguant Option A, Option B et tendance partagée, avec balances, principaux atouts, principaux freins et éléments décisifs.
- Action explicite « Je souhaite encore réfléchir » avant l'engagement.
- Choix acté visible jusque dans l'écran de bilan.

### Calcul

- Correspondance centralisée : Secondaire = 1, Important = 3, Décisif = 5.
- En mode évaluation, le pourcentage favorable correspond à `poids Pour / (poids Pour + poids Contre)`, arrondi à l'entier et borné entre 0 et 100 ; l'absence d'argument vaut 50 %.
- En comparaison, le résultat repose directement sur les deux balances. Le pourcentage technique reste calculable de manière déterministe, mais l'interface privilégie les balances signées afin d'éviter une fausse précision.

### Migration

- La clé principale `@decisionly/decisions/v1` reste inchangée.
- Une décision sans poids reçoit « Important ».
- Les anciennes valeurs 1–2 deviennent « Secondaire », 3 reste « Important » et 4–5 deviennent « Décisif ».
- Une ancienne comparaison transforme ses anciens arguments A/B en atouts des options correspondantes, puis reçoit `argumentModelVersion: 2` pour que les futurs freins ne soient jamais réinterprétés.
- Les options, le choix acté, les statuts, le suivi et le bilan existants sont conservés.

### Conservé

- Sélecteur de format, navigation, cercle d'engagement, suivi, direction artistique, compatibilité mobile/Web et Expo SDK 54.

### Limites restantes

- Aucun système de tests automatisés n'existe encore dans le projet.
- Le vrai test utilisateur du nouveau mode comparaison reste ouvert. Il devra inclure une décision à une option, une comparaison, un frein décisif et une égalité.

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
