# 🚀 QuickEat - Application de Commande & Livraison de Repas à Domicile

QuickEat est une application web moderne et réactive conçue pour orchestrer la commande et la livraison de repas en temps réel. Elle réunit trois acteurs majeurs (Clients, Restaurateurs, et Livreurs) à travers des tableaux de bord interactifs reliés par une architecture REST API et synchronisés en temps réel par **Spring WebSockets**.

---

## 🎨 Design & Expérience Utilisateur Premium
L'interface utilisateur a été conçue pour offrir un effet **"Wow"** dès le premier regard grâce à :
*   **Typographie de caractère** : Chargement de la police premium **Outfit** depuis Google Fonts pour un rendu épuré et moderne.
*   **Palette de couleurs harmonieuse** : Utilisation de nuances d'orange vif (culinaire), d'indigo profond (télémétrie), et de gris ardoise élégants.
*   **Micro-animations vivantes** : Effets de fondu, de survol dynamique, vélos animés et clignotants GPS pour rendre l'interface réactive et organique.
*   **Pas d'alertes rustiques** : Remplacement des pop-ups `alert()` standard par le système d'alerte fluide de **React Hot Toast** connecté en WebSocket.

---

## 👥 Rôles Utilisateurs & Scénarios d'Utilisation

### 1. 🛒 L'Espace Client
L'interface client permet d'effectuer un parcours d'achat complet et interactif :
*   **Catalogue Gourmand & Visuels HD** : Chaque plat dispose d'une photo d'en-tête premium chargée automatiquement via Unsplash en fonction du nom du plat (Pizza, Burger, Tajine, Sushi...) ou de l'adresse saisie par le restaurateur.
*   **Panier Interactif avec Protection Multi-Restaurants** : Un algorithme bloque l'ajout simultané de plats provenant de restaurants différents pour assurer une logistique de livraison cohérente. Une boîte de dialogue stylisée propose de réinitialiser le panier si nécessaire.
*   **Double Mode de Paiement (Stripe & Cash on Delivery)** :
    *   **💳 Paiement en ligne** : Simulation Sandbox Stripe par appel API REST `/api/paiement/charger`.
    *   **💵 Paiement à la livraison (Cash - COD)** : Enregistrement de la commande avec statut de paiement `EN_ATTENTE`, particulièrement adapté aux habitudes d'achat locales au Maroc.
*   **Suivi GPS & Télémétrie Live Simulé** : Dès que la commande passe au statut `EN_COURS_DE_LIVRAISON`, un widget s'affiche montrant un cycliste avançant le long d'une ligne de livraison. Les indicateurs (Distance restante en km, Vitesse de croisière en km/h, et Temps estimé d'arrivée en minutes) décrémentent de manière fluide toutes les 5 secondes.
*   **Double Évaluation 5 Étoiles** : Une fois la commande marquée comme `LIVRÉE`, un modal s'affiche automatiquement pour évaluer (de 1 à 5 étoiles) la qualité du plat (Chef) et le service de livraison (Livreur) avec commentaires. L'évaluation persistante utilise le `localStorage` pour éviter les sollicitations répétées.

### 2. 👨‍🍳 L'Espace Restaurateur (Gérant)
Un espace d'analyse et de gestion complet pour piloter le restaurant :
*   **Gestion de la Carte** : Ajout et suppression de plats, incluant le nom, le prix, la description et le lien vers l'image.
*   **Régie des Commandes en Direct** : Suivi des commandes reçues avec badge du mode de paiement (**💳 Payé en ligne** vs **💵 À encaisser (Cash)**) et boutons de cycle de vie (Mettre en préparation ➔ Marquer comme prête).
*   **Tableau de Bord Statistique Décisionnel** :
    *   **KPIs en direct** : Calcul en temps réel du Chiffre d'Affaires net des commandes livrées, du panier moyen et du volume de ventes.
    *   **Graphique de Ventes Hebdo CSS** : Un graphique responsive dessiné nativement en barres CSS avec effets de dégradés et tooltips d'informations s'affichant au survol de chaque jour.
    *   **Palmarès des Best-Sellers** : Liste des plats les plus populaires représentés par des barres de progression horizontales.
    *   **Flux des Avis Clients** : Visualisation instantanée des notes étoiles et des commentaires laissés par les clients.

### 3. 🚴 L'Espace Livreur (Mobile-First)
Une interface épurée imitant une application mobile dédiée aux coursiers :
*   **Gestion des Courses par Onglets** :
    *   **Disponibles** : Commandes prêtes en cuisine en attente de prise en charge.
    *   **En Cours** : Commande active en cours de livraison.
    *   **Historique** : Commandes livrées avec succès par le livreur.
*   **Télémétrie Active** : Lors d'une livraison, l'interface affiche un signal émetteur clignotant simulant la diffusion des coordonnées GPS réelles vers le client.

---

## 🛠️ Outils & Technologies Frontend Utilisés

Le frontend de QuickEat repose sur un écosystème moderne de technologies web :
1.  **React (Single Page Application)** : Cœur de l'application, exploitant les Hooks d'état (`useState`, `useEffect`, `useMemo`) pour une réactivité optimale sans rechargement de page.
2.  **React Router DOM** : Routage côté client avec redirections sécurisées basées sur le rôle de l'utilisateur (`CLIENT`, `RESTAURANT`, `LIVREUR`).
3.  **Tailwind CSS (via CDN)** : Architecture de style moderne assurant des composants hautement personnalisés, des grilles fluides et des layouts entièrement responsives (ordinateurs, tablettes et smartphones).
4.  **SockJS & STOMP client** : Gestion des connexions bidirectionnelles WebSockets. Permet la synchronisation instantanée du changement de statut des commandes et l'affichage des notifications.
5.  **Axios** : Client HTTP robuste pour communiquer avec l'API REST de Spring Boot.
6.  **React Hot Toast** : Système de notifications graphiques fluides et configurables.
7.  **Lucide React** : Collection d'icônes vectorielles légères et modernes.

---

## 📂 Structure Clean Code du Frontend

Nous avons restructuré le projet pour respecter les standards professionnels les plus stricts :
```text
src/
├── components/          # Composants réutilisables
│   └── Navbar.js        # Barre de navigation réactive avec informations de rôles
├── pages/               # Écrans principaux de l'application
│   ├── Login.js         # Interface d'accès avec effets de carte pivotante
│   ├── ClientDashboard.js # Tableau de bord client (Panier, GPS, Évaluations)
│   ├── RestoDashboard.js  # Tableau de bord restaurant (KPIs, Graphiques CSS, Avis)
│   └── LivreurDashboard.js# Interface mobile livreur (Courses, Télémétrie)
├── utils/               # Utilitaires et connecteurs réseaux
│   └── orderService.js  # Service unifié REST/WebSocket pour la mise à jour des statuts
├── config.js            # Fichier de configuration globale (API_URL)
├── App.js               # Routeur de l'application & Abonnement global WebSockets
└── index.js             # Point d'entrée de l'application
```

---

## 🎬 Scénario de Démonstration Idéal (Pour la Soutenance)

Pour épater le jury lors de votre soutenance, ouvrez deux navigateurs différents (par exemple **Chrome** pour le client et **Firefox** pour le restaurant/livreur) et effectuez le parcours suivant :

1.  **Connexion & Visualisation** : Connectez-vous sur les deux comptes. Admirez les visuels gourmands côté client.
2.  **Composition du Panier** :
    *   Ajoutez un plat du Restaurant A.
    *   Essayez d'ajouter un plat du Restaurant B : notez l'ouverture du **modal d'avertissement de conflit multi-restaurant**. Acceptez de vider le panier.
3.  **Choix du Paiement & Commande** :
    *   Sélectionnez **💳 Stripe** pour voir la simulation de débit bancaire.
    *   Ou choisissez **💵 Au Livreur (Cash)** pour illustrer le mode Cash on Delivery.
    *   Validez la commande !
4.  **Réception en Cuisine (WebSockets en Action)** :
    *   À la validation, une bulle de notification verte s'affiche instantanément sur l'écran du gérant de restaurant sans aucun rafraîchissement !
    *   Le gérant clique sur **🧑‍🍳 Mettre en Préparation**, puis sur **🍳 Marquer comme Prête**. Le client reçoit une notification en direct à chaque étape.
5.  **Livraison & Suivi GPS en Temps Réel** :
    *   Le livreur voit la commande apparaître dans ses **Courses Disponibles** et clique sur **Prendre en charge**.
    *   **Côté Client** : Un widget de télémétrie s'ouvre instantanément ! Le client voit le vélo avancer en direct sur sa carte avec la distance et l'heure d'arrivée estimée qui diminuent sous ses yeux.
6.  **Arrivée & Double Notation** :
    *   Le livreur arrive à destination et clique sur **Confirmer la livraison**.
    *   **Côté Client** : Le widget de suivi se ferme et laisse place à un modal d'évaluation. Attribuez des étoiles au plat et au livreur.
    *   **Côté Restaurant** : L'avis client s'affiche instantanément dans le flux des commentaires de l'onglet Statistiques, et le chiffre d'affaires du restaurant augmente en temps réel !

---

## 🚀 Installation & Démarrage

### Prérequis
*   [Node.js](https://nodejs.org/) (Version 14 ou supérieure)
*   Votre API backend Spring Boot en cours d'exécution sur le port `8181`.

### Démarrage du Client
1.  Placez-vous dans le dossier du projet :
    ```bash
    cd livraison-front
    ```
2.  Installez les dépendances :
    ```bash
    npm install
    ```
3.  Lancez l'application en mode développement :
    ```bash
    npm start
    ```
4.  Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

*QuickEat a été conçu avec soin pour démontrer la force d'une architecture découplée combinant la réactivité de React et la robustesse de Spring Boot.*
