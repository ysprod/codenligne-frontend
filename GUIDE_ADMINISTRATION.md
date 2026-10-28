# Guide d'Administration — CODENLIGNE

Ce guide explique comment gérer la plateforme CODENLIGNE au quotidien.

## 1. Accès au Dashboard
1. Rendez-vous sur `https://www.codenligne.net/connexion`.
2. Connectez-vous avec votre compte **Super Administrateur**.
3. Vous êtes redirigé vers le tableau de bord `/admin`.

## 2. Gestion des Apprenants
### Activer un compte
Lorsqu'un utilisateur s'inscrit, son compte est en statut **En attente**. Pour l'activer :
1. Allez dans le menu **Apprenants & Accès**.
2. Filtrez par statut "PENDING".
3. Cliquez sur le bouton **Activer** de l'apprenant.
4. Choisissez une date de fin d'accès (obligatoire, dans le futur) et validez.
5. L'apprenant peut désormais accéder aux cours.

### Bloquer / Prolonger un compte
1. Cliquez sur le nom de l'apprenant pour ouvrir sa fiche.
2. Dans l'historique des décisions, utilisez les boutons d'action.
3. **Prolonger** : ajoute du temps à un compte actif.
4. **Bloquer** : suspend l'accès (nécessite un motif). Un compte bloqué ne peut pas être prolongé, il faut le réactiver avec une nouvelle date.

### Réinitialiser un mot de passe
Si un apprenant a perdu son mot de passe :
1. Ouvrez sa fiche individuelle.
2. Cliquez sur **Générer un code de réinitialisation**.
3. Communiquez ce code à l'apprenant (par WhatsApp ou téléphone).
4. Le code est valable 30 minutes et à usage unique.

## 3. Gestion des Cours
### Créer un cours
1. Allez dans **Gestion des cours**.
2. Créez d'abord un **Thème** (ex: Signalisation).
3. Créez ensuite un **Chapitre** et rattachez-le au thème.
4. Créez enfin une **Leçon** et rattachez-la au chapitre. Utilisez l'éditeur pour mettre en forme le texte.

## 4. Gestion des QCM
### Créer une question
1. Allez dans **Questions & QCM** > onglet **Banque de questions**.
2. Remplissez l'énoncé, les propositions et cochez la bonne réponse.
3. Ajoutez une explication (obligatoire).
4. Cliquez sur **Ajouter à la banque**.

### Créer un QCM (manuel)
1. Onglet **Créer un QCM (Manuel)**.
2. Donnez un titre et un mode (Entraînement ou Évaluation).
3. Cochez les questions à inclure.
4. Cliquez sur **Créer le QCM**.

### Créer un QCM (automatique)
1. Onglet **Génération automatique**.
2. Définissez le nombre de questions souhaité et éventuellement une difficulté.
3. Le système piochera aléatoirement dans la banque de questions.

## 5. Gestion des Collaborateurs (Super Admin uniquement)
1. Allez dans **Collaborateurs**.
2. Créez un compte avec le rôle **Administrateur** ou **Gestionnaire Pédagogique**.
3. Un gestionnaire pédagogique peut créer des cours et des QCM, mais ne peut pas activer les comptes apprenants.

## 6. Consultation du Journal d'Audit
Toutes les actions sensibles (création de cours, activation de compte) sont tracées.
1. Allez dans **Journal d'audit**.
2. Vous verrez l'auteur, la date, l'action et la cible.