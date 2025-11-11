# 📋 Suivi de Présence - Gestion d'Équipe

Application web moderne et élégante pour gérer la présence des membres d'une équipe. Interface intuitive avec design responsive et animations fluides.

## ✨ Fonctionnalités Implémentées

### 🎯 Gestion des Personnes
- ✅ **Ajouter des personnes** avec nom, prénom, email, poste et couleur d'avatar
- ✅ **Modifier les informations** d'une personne existante
- ✅ **Supprimer des personnes** avec confirmation
- ✅ **Recherche en temps réel** par nom, prénom, email ou poste
- ✅ **Avatars colorés personnalisables** avec 8 couleurs au choix

### 📊 Suivi de Présence
- ✅ **Marquer la présence quotidienne** avec 4 statuts :
  - 🟢 Présent
  - 🔴 Absent
  - 🟠 Retard
  - 🔵 Congé
- ✅ **Navigation par date** (jour précédent/suivant, aujourd'hui)
- ✅ **Notes additionnelles** pour chaque présence
- ✅ **Filtrage par statut** (Tous, Présents, Absents)

### 📈 Statistiques en Temps Réel
- ✅ **Total des personnes** enregistrées
- ✅ **Nombre de présents** aujourd'hui
- ✅ **Nombre d'absents** aujourd'hui
- ✅ **Taux de présence** en pourcentage

### 💾 Export de Données
- ✅ **Export CSV** des présences du jour avec tous les détails
- ✅ Format compatible Excel/Google Sheets

### 🎨 Interface Utilisateur
- ✅ **Design moderne et professionnel** avec dégradés et ombres
- ✅ **Animations fluides** sur tous les éléments interactifs
- ✅ **Responsive design** adapté mobile, tablette et desktop
- ✅ **Notifications toast** pour toutes les actions
- ✅ **États vides** avec instructions claires
- ✅ **Loading spinners** pendant les opérations

## 🚀 Utilisation

### Page Principale (index.html)

L'application se compose d'une interface unique avec plusieurs sections :

#### 1. En-tête
- Bouton **"Exporter"** : Exporte les données du jour en CSV
- Bouton **"Nouvelle Personne"** : Ouvre le formulaire d'ajout

#### 2. Tableau de Bord
Affiche 4 cartes de statistiques :
- Total personnes
- Présents aujourd'hui
- Absents aujourd'hui
- Taux de présence

#### 3. Barre de Contrôle
- **Sélecteur de date** : Navigation par date avec boutons ← → et "Aujourd'hui"
- **Barre de recherche** : Recherche instantanée
- **Filtres** : Tous / Présents / Absents

#### 4. Liste des Personnes
Affiche toutes les personnes sous forme de cartes avec :
- Avatar coloré avec initiales
- Nom, prénom, poste, email
- Badge de statut de présence
- 3 boutons d'action :
  - **Présence** : Marquer la présence
  - **Modifier** : Éditer les informations
  - **Supprimer** : Supprimer la personne

### Actions Disponibles

#### Ajouter une Personne
1. Cliquer sur "Nouvelle Personne"
2. Remplir le formulaire (nom et prénom obligatoires)
3. Choisir une couleur d'avatar
4. Cliquer sur "Enregistrer"

#### Marquer une Présence
1. Cliquer sur "Présence" sur la carte d'une personne
2. Choisir le statut (Présent, Absent, Retard, Congé)
3. Ajouter des notes optionnelles
4. La présence est automatiquement enregistrée

#### Modifier une Personne
1. Cliquer sur "Modifier" sur la carte
2. Mettre à jour les informations
3. Cliquer sur "Enregistrer"

#### Supprimer une Personne
1. Cliquer sur "Supprimer"
2. Confirmer la suppression
3. La personne et ses présences sont supprimées

#### Exporter les Données
1. Sélectionner la date souhaitée
2. Cliquer sur "Exporter"
3. Le fichier CSV est téléchargé automatiquement

## 🗄️ Structure des Données

### Table : personnes
- **id** (text) : Identifiant unique
- **nom** (text) : Nom de famille
- **prenom** (text) : Prénom
- **email** (text) : Adresse email
- **poste** (text) : Poste ou fonction
- **avatar_color** (text) : Couleur hexadécimale de l'avatar

### Table : presences
- **id** (text) : Identifiant unique
- **personne_id** (text) : Référence à la personne
- **date** (text) : Date au format YYYY-MM-DD
- **statut** (text) : present, absent, retard, conge
- **notes** (text) : Notes additionnelles

## 🎨 Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS, flexbox, grid
- **JavaScript ES6+** : Logique applicative avec async/await
- **Font Awesome** : Icônes (via CDN)
- **Google Fonts** : Police Inter (via CDN)
- **RESTful Table API** : Persistance des données

## 📱 Design Responsive

L'application s'adapte automatiquement à toutes les tailles d'écran :

- **Desktop** (> 768px) : Grille multi-colonnes, tous les textes visibles
- **Tablette** (768px - 480px) : Grille adaptative, layout ajusté
- **Mobile** (< 480px) : Colonne unique, icônes seuls pour les boutons

## 🎯 Fonctionnalités à Venir (Suggestions)

### 📊 Rapports Avancés
- Statistiques mensuelles/annuelles
- Graphiques de tendance de présence
- Export PDF avec graphiques
- Historique de présence par personne

### 👥 Gestion d'Équipes
- Organisation en équipes/départements
- Gestion hiérarchique
- Affectation de responsables

### 🔔 Notifications
- Rappels automatiques pour marquer les présences
- Alertes pour taux de présence faible
- Notifications par email

### 📅 Calendrier
- Vue calendrier mensuel
- Planification de congés
- Gestion des horaires

### 🔐 Sécurité
- Authentification des utilisateurs
- Rôles et permissions
- Logs d'activité

### 📥 Import de Données
- Import CSV de personnes
- Import depuis Excel
- Synchronisation avec autres systèmes

## 🛠️ Installation et Déploiement

### Développement Local
1. Ouvrir `index.html` dans un navigateur moderne
2. L'application utilise l'API RESTful locale pour les données

### Publication
Pour mettre en ligne votre application :
1. Aller dans l'onglet **Publish** 
2. Cliquer sur le bouton de publication
3. Votre application sera accessible via l'URL fournie

## 📝 Notes Techniques

### API REST
L'application utilise l'API RESTful Table avec les endpoints suivants :
- `GET tables/personnes` : Liste des personnes
- `POST tables/personnes` : Créer une personne
- `PUT tables/personnes/{id}` : Modifier une personne
- `DELETE tables/personnes/{id}` : Supprimer une personne
- `GET tables/presences` : Liste des présences
- `POST tables/presences` : Créer une présence
- `PUT tables/presences/{id}` : Modifier une présence

### Performance
- Chargement initial rapide
- Mise à jour UI en temps réel
- Filtrage et recherche côté client pour réactivité maximale

### Compatibilité
- Chrome, Firefox, Safari, Edge (versions récentes)
- Support mobile iOS et Android

## 📞 Support

Pour toute question ou suggestion d'amélioration, n'hésitez pas à :
- Consulter ce README
- Tester toutes les fonctionnalités
- Proposer des nouvelles fonctionnalités

---

**Créé avec ❤️ - Suivi de Présence v1.0**
