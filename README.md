# Boutique Afi

Mini application de commande en ligne pour une petite boutique de quartier : catalogue, panier, compte client et suivi des commandes.

Démo :https://boutique-afi.vercel.app

## Fonctionnalités

- Catalogue chargé depuis l'API, avec recherche et filtre par rayon
- Panier : ajout, retrait, modification des quantités, total recalculé à chaque changement. Le panier est gardé dans le navigateur (localStorage) pour ne pas le perdre en rechargeant la page
- Inscription et connexion par email / mot de passe
- Passage de commande avec vérification du stock
- Historique des commandes avec statut (en attente, confirmée, livrée, annulée). Une commande en attente peut être annulée par le client, le stock est alors remis à jour

## Stack

- Next.js 15 (App Router) en TypeScript, front et API dans le même projet
- PostgreSQL hébergé sur Neon, accès via Prisma
- Tailwind CSS
- Zod pour valider les données reçues par l'API
- bcryptjs pour les mots de passe, jose pour le token de session (JWT)

## Organisation

```
prisma/
  schema.prisma      modèles User, Product, Order, OrderItem
  seed.ts            produits de départ
src/
  app/
    api/             routes de l'API (auth, products, orders)
    cart/ login/ orders/ register/   pages
  components/        composants React (panier, liste produits, formulaires...)
  lib/               prisma, session, validation, gestion des erreurs, formatage
  middleware.ts      protection des pages qui demandent d'être connecté
```

## API

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| POST | /api/auth/register | non | créer un compte |
| POST | /api/auth/login | non | se connecter |
| POST | /api/auth/logout | non | se déconnecter |
| GET | /api/products | non | liste des produits |
| GET | /api/orders | oui | commandes de l'utilisateur connecté |
| POST | /api/orders | oui | créer une commande `{ items: [{ productId, quantity }] }` |
| PATCH | /api/orders/:id | oui | annuler une commande en attente `{ status: "CANCELLED" }` |

Les erreurs sont toujours renvoyées sous la forme `{ error, details? }` avec le bon code HTTP (400, 401, 404, 409, 500).

## Choix techniques

- **Prix calculés côté serveur.** Le client envoie seulement les identifiants et les quantités. Le total est recalculé avec les prix en base, donc impossible de modifier un prix depuis le navigateur.
- **Stock.** La création de commande se fait dans une transaction. Le stock est décrémenté avec une condition `stock >= quantité`, ce qui évite de vendre deux fois le dernier article si deux commandes arrivent en même temps.
- **Prix figés.** Chaque ligne de commande garde le nom et le prix du produit au moment de l'achat, l'historique reste juste même si le prix change ensuite.
- **Session.** JWT signé dans un cookie `httpOnly`, `sameSite=lax`, `secure` en production. Le JavaScript de la page n'y a pas accès.
- **Connexion.** Même message d'erreur si l'email n'existe pas ou si le mot de passe est faux.
- **Redirections.** Le paramètre `?next=` n'accepte que des chemins internes.

## Lancer le projet en local

Prérequis : Node 20+ et une base PostgreSQL (une base gratuite sur [Neon](https://neon.tech) suffit).

```bash
git clone https://github.com/onesimendah/boutique-afi.git
cd boutique-afi
npm install
cp .env.example .env      # puis remplir DATABASE_URL et JWT_SECRET
npm run db:push           # crée les tables
npm run db:seed           # réinitialise les produits (efface aussi les commandes)
npm run dev
```

L'application tourne sur http://localhost:3000.

## Déploiement

Déployé sur Vercel. Les variables `DATABASE_URL` et `JWT_SECRET` sont définies dans les paramètres du projet. `prisma generate` est lancé pendant le build.

## Pistes d'amélioration

- Espace administrateur pour gérer les produits et faire avancer le statut des commandes (pour l'instant ça se fait directement en base)
- Limitation du nombre de tentatives de connexion
- Tests automatisés sur les routes de commande
- Images des produits
