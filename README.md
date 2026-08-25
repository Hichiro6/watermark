# WaterMark — Sécurisez vos documents administratifs 🛡️

<div align="center">

![WaterMark](https://img.shields.io/badge/WaterMark-v1.0-blue)
![License](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-red)
![Platform](https://img.shields.io/badge/Platform-Web%20(PWA)-green)

**Filigrane de sécurité 100% client-side pour PDF et images**

</div>

---

## 🔐 Pourquoi WaterMark ?

Quand vous envoyez vos pièces d'identité, RIB, justificatifs de domicile ou autres documents sensibles par email, il est important d'ajouter un filigrane indiquant :
- À qui le document est destiné
- Dans quel contexte il est transmis
- La date d'émission

WaterMark permet d'ajouter ces mentions de manière **rapide, sécurisée et invisible** — sans jamais envoyer vos documents sur un serveur.

---

## ⚡ Caractéristiques principales

- **🔒 100% local** : Vos documents restent sur votre appareil, aucun upload
- **🌍 Fonctionne partout** : Browser, iOS, Android — rien à installer
- **📄 Formats supportés** : PDF, JPG, PNG, WEBP, BMP, GIF
- **⚙️ Presets prêts à l'emploi** : Cas d'usage courants en un clic
- **🎨 Personnalisable** : Couleur, opacité, taille, position, rotation
- **💾 PWA installable** : Ajoutez aux favoris ou installez comme une app
- **🚀 Zéro dépendance serveur** : Open source, auditable, hébergeable partout

---

## 🚀 Utilisation

### En ligne (recommandé)
Accédez à l'app depuis n'importe quel navigateur moderne :
- Desktop : Chrome, Firefox, Safari, Edge
- Mobile : Safari (iOS), Chrome (Android), Zen Browser

### Installation locale
```bash
git clone https://github.com/Hichiro6/watermark.git
cd watermark
npm install
npm run dev
```

L'application s'ouvre alors sur `http://localhost:5173`

### Production build
```bash
npm run build
# Le dossier dist contient tout ce qu'il faut pour déployer
```

Vous pouvez héberger le contenu du dossier `dist` sur :
- GitHub Pages
- Netlify
- Vercel
- N'importe quel serveur statique

### Avec Docker (recommandé pour la production)

La conteneurisation Docker permet de déployer facilement l'application n'importe où.

#### Prérequis
- Docker ≥ 20.10
- Docker Compose ≥ 2.0

#### Build et lancement

```bash
# Construire l'image Docker
docker compose build

# Lancer le container
docker compose up -d

# Vérifier que l'app est accessible
curl http://localhost:8080

# Arrêter les containers
docker compose down
```

#### Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Redémarrer le service
docker compose restart

# Arrêter et supprimer le container + volume de logs
docker compose down -v

# Construire sans cache (pour un rebuild propre)
docker compose build --no-cache
```

#### Variables d'environnement (optionnel)

Vous pouvez personnaliser le comportement via des variables d'environnement :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `NGINX_WORKER_PROCESSES` | Nombre de processus nginx | `auto` |
| `NGINX_MAX_BODY_SIZE` | Taille maximale des uploads | `10m` |

Exemple avec variables personnalisées :
```bash
NGINX_MAX_BODY_SIZE=50m docker compose up -d
```

#### Healthcheck

Le container inclut un healthcheck qui vérifie que l'application répond sur `/index.html`.  
Statut du healthcheck :
```bash
docker compose ps
docker inspect --format='{{.State.Health.Status}}' watermark-app
```

---

## 💡 Comment ça marche ?

1. **Glissez-déposez** votre document (PDF ou image)
2. **Choisissez un preset** ou écrivez votre propre texte
3. **Ajustez l'apparence** (couleur, opacité, position, etc.)
4. **Téléchargez** le document avec filigrane intégré

> ⚠️ **Important** : Aucun fichier n'est envoyé vers un serveur. Tout est traité localement dans votre navigateur via JavaScript.

---

## 🎯 Presets disponibles

| Icône | Nom | Description |
|-------|-----|-------------|
| 🪪 | Pièce d'identité | "Copie pour vérification d'identité uniquement — {date}" |
| 🏦 | RIB / IBAN | "RIB transmis à {destinataire} — Usage unique — {date}" |
| 🏠 | Justificatif domicile | "Justificatif de domicile pour {destinataire} — {date}" |
| 🚗 | Permis de conduire | "Copie du permis — usage unique — Transmis à {destinataire} le {date}" |
| 📄 | Facture / Devis | "Document transmis à {destinataire} — {date}" |
| ⚕️ | Document médical | "Document médical — usage strictement privé — Ne pas diffuser — {date}" |

### Variables dynamiques
- `{date}` → Remplacé automatiquement par la date du jour
- `{destinataire}` → Champ libre (nom de l'organisme)
- `{usage}` → Objet du transfert

---

## 🛠️ Stack technique

| Rôle | Technologie |
|------|-------------|
| Framework | Vite (vanilla JS) |
| PDF manipulation | pdf-lib |
| Rendu Canvas | HTML5 Canvas API natif |
| PWA | Service Worker + Web App Manifest |
| Styling | CSS3 moderne (variables CSS) |
| Build | Vite |

---

## 📁 Structure du projet

```
watermark/
├── index.html              # Page principale
├── src/
│   ├── main.js             # Orchestrateur principal
│   ├── presets.js          # Présents de filigranes
│   ├── image-handler.js    # Traitement des images
│   └── pdf-handler.js      # Traitement des PDF
├── styles/
│   └── main.css            # Styles globaux
├── public/
│   ├── manifest.json       # Configuration PWA
│   ├── sw.js               # Service Worker (offline)
│   └── favicon.svg         # Logo
├── Dockerfile              # Image Docker multi-stage
├── docker-compose.yml      # Orchestration Docker Compose
├── .dockerignore           # Fichiers exclus du build Docker
├── nginx.conf              # Configuration nginx
├── LICENSE                 # CC BY-NC-ND 4.0
├── README.md
└── package.json
```

---

## 📝 Licence

**CC BY-NC-ND 4.0** — Attribution - Pas d'Utilisation Commerciale - Pas de Modification

- ✅ Usage personnel autorisé
- ✅ Attribution requise (Hichiro / Hichiro6)
- ❌ Pas d'usage commercial
- ❌ Pas de modification du code
- ❌ Pas de reproduction sans attribution

Voir [LICENSE](LICENSE) pour le texte complet.

---

## 🤝 Contribuer

Les contributions sont les bienvenues pour :
- Améliorations de l'UI/UX
- Support de nouveaux formats (DOCX, etc.)
- Optimisations de performance
- Traductions

⚠️ Attention : Toute contribution doit respecter la licence CC BY-NC-ND 4.0.

---

## 🙋 FAQ

**Q : Mes documents sont-ils vraiment locaux ?**  
R : Oui, absolument. Aucun appel réseau n'est fait après le chargement initial de la page. Tout est exécuté localement dans votre navigateur.

**Q : Puis-je utiliser cette app sans internet ?**  
R : Oui ! Une fois la page chargée, le Service Worker cache tous les assets. Vous pouvez même ajouter l'app à votre écran d'accueil (PWA) et l'utiliser hors-ligne.

**Q : Quels navigateurs sont supportés ?**  
R : Tous les navigateurs modernes (Chrome, Firefox, Safari, Edge, Opera). iOS : Safari 14+. Android : Chrome 80+.

**Q : Existe-t-il une version mobile ?**  
R : L'app est responsive et peut être "installée" comme une app native via "Ajouter à l'écran d'accueil" sur iOS et Android.

**Q : Peut-on changer les couleurs du filigrane ?**  
R : Oui, 5 couleurs pré-définies sont proposées (rouge, bleu, vert, violet, noir). Plus de personnalisations sont prévues.

---

## 📧 Contact

Développé par **Hichiro** (GitHub: [@Hichiro6](https://github.com/Hichiro6))

Issues et PRs sur GitHub : https://github.com/Hichiro6/watermark

---

<div align="center">

**Sécurisez vos documents — simplement, localement, efficacement.**

Made with ❤️ in Belgium

</div>
