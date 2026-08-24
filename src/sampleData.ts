export interface SampleDataset {
  id: string;
  title: string;
  badge: string;
  description: string;
  content: string;
  category: "tech" | "finance" | "geopolitics" | "science" | "business" | "crypto";
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "ai-systems",
    title: "🤖 Architectures LLM & Inférence Haute Performance",
    badge: "IA & Systèmes",
    category: "tech",
    description: "vLLM KV-cache chunked prefill, speculative decoding trie-trees, flash-infer v2 & bruit marketing sponsorisé.",
    content: `[FLUX RSS - Tech Systems & Inference Daily]

Item 1: [Paper arXiv:2502.09112]
Titre: Chunked-Prefill Multi-Tenant KV-Cache for Heterogeneous GPU Clusters
Auteurs: Berkeley AI Research & DeepSpeed Team
Résumé: Introduction d'une nouvelle stratégie de pagination distribuée pour le KV-cache des modèles de plus de 70B de paramètres. Le benchmark sur 128 GPU H100 démontre une réduction de 42% de la latence Time-to-First-Token (TTFT) et une augmentation du débit de 2.8x sous charge de requêtes asynchrones en préfixe partagé. L'algorithme résout le problème de fragmentation mémoire en isolant dynamiquement les couches d'attention cross-request.

Item 2: [SPONSORISÉ - Pub SuperCloud AI]
"Boostez votre productivité avec SuperCloud AI ! La solution ultime qui révolutionne le travail de vos développeurs. 30 jours gratuits sans carte bancaire. Contactez nos commerciaux."

Item 3: [Communiqué officiel Rust Foundation / LLVM]
Titre: Release de Rust 1.85.0 : Stabilisation de async closures et nouvelle passe d'optimisation Polonius
Détails: L'équipe de Rust annonce la release 1.85.0. Stabilisation majeure des closures asynchrones (async fn / AsyncFnOnce) permettant de passer des closures asynchrones d'ordre supérieur sans allocation Box dynamique. Réduction de 14% de la consommation mémoire du compilateur rustc sur les gros monorepos grâce aux nouveaux mécanismes d'inlining LLVM 19.

Item 4: [Blog post d'opinion sur LinkedIn]
"Pourquoi l'IA va remplacer 90% des développeurs d'ici la fin de l'année. Les 5 secrets que les experts ne vous disent pas. Likez et commentez 'IA' pour recevoir mon PDF."

Item 5: [GitHub Trending / Kernel.org]
Titre: Intégration de eBPF User-Space Memory Allocator (bpf_mem_alloc) dans le Kernel Linux 6.13
Détails: Le patch eBPF introduit un allocateur de mémoire ultra-faible latence lockless spécifique aux programmes de tracing et de filtrage réseau haute fréquence XDP. Évite les contentions spinlock lors de pointes à 40 millions de paquets/seconde (40 Mpps), divisant par 3 le jitter réseau des passerelles Kubernetes.

Item 6: [Offre promotionnelle SaaS]
"Webinar exclusif : Comment notre outil no-code booste votre ROI de 300% en 3 clics."`,
  },
  {
    id: "finance-markets",
    title: "💰 Marchés Financiers, Banques Centrales & Macro-Économie",
    badge: "Finance & Marchés",
    category: "finance",
    description: "Décisions sur les taux directeurs, inversion des courbes de rendement obligataire, réserves de devises et pub trading forex.",
    content: `[Dépêches Agences Économiques & Banques Centrales - Marchés Mondiaux]

Dépêche 1: [Banque Centrale Européenne & Fed - Rapport de Politique Monétaire]
Titre: Ajustement des taux directeurs à 2.75% et détente des rendements obligataires souverains à 10 ans
Détails: Les banques centrales annoncent une baisse coordonnée de 25 points de base des taux directeurs pour stabiliser l'inflation sous-jacente à 1.9%. Le spread entre les emprunts d'État allemands (Bunds) et les obligations d'entreprises de notation BBB s'est resserré de 34 points de base. Les liquidités interbancaires injectées via les opérations de refinancement à long terme (TLTRO) s'élèvent à 145 milliards d'euros.

Dépêche 2: [SPONSORISÉ - Plateforme de Trading Forex]
"Doublez votre capital en 24h avec nos robots de trading IA haute fréquence ! Aucun risque, gains garantis à 99%."

Dépêche 3: [Fonds Monétaire International (FMI) - World Economic Outlook]
Titre: Révision des prévisions de croissance mondiale à 3.2% avec rebond du commerce manufacturier transfrontalier
Détails: Le FMI révise à la hausse la croissance du commerce mondial de marchandises à +3.4% pour 2026, portée par la baisse des coûts de fret maritime (-18% sur l'indice Drewry) et la reprise de la demande en biens d'équipement. Les réserves de change mondiales en devises diversifiées atteignent 12 800 milliards de dollars.

Dépêche 4: [Rumeur anonyme sur un forum boursier]
"Achetez l'action XYZ immédiatement, un rachat secret va être annoncé demain matin selon un initié !"

Dépêche 5: [Banque des Règlements Internationaux (BRI)]
Titre: Standardisation du règlement brut en temps réel (RTGS) transfrontalier multi-devises
Détails: Finalisation du projet Agora réunissant 40 banques commerciales internationales pour automatiser le règlement-livraison instantané des flux commerciaux interbancaires, éliminant 48h de délai de clearing et réduisant le risque de contrepartie de 85%.`,
  },
  {
    id: "geopolitics-energy",
    title: "🌍 Géopolitique, Énergie & Transition Climatique",
    badge: "Monde & Climat",
    category: "geopolitics",
    description: "Accords sur l'hydrogène vert, sécurisation des minerais critiques de batteries, corridors commerciaux et greenwashing.",
    content: `[Bulletin International - Géopolitique & Transition Énergétique]

Rapport A: [Agence Internationale de l'Énergie (AIE)]
Titre: Mise en service de la première dorsale hydrogène vert transfrontalière de 1.2 GW de capacité
Détails: L'AIE valide le raccordement du premier réseau de pipelines industriels dédié à l'hydrogène décarboné produit par électrolyseurs PEM haute température. Le coût nivelé de production (LCOH) franchit le seuil pivot de 2.10 €/kg, permettant de substituer 4.8 millions de tonnes de gaz fossile par an dans les bassins sidérurgiques européens.

Rapport B: [Publicité écoblanchiment / Greenwashing]
"Notre compagnie aérienne neutralise 100% de ses émissions grâce à des certificats de compensation carbone invisibles. Voyagez l'esprit tranquille !"

Rapport C: [Consortium Mondial des Minerais Critiques & USGS]
Titre: Découverte et homologation d'un gisement de lithium et cobalt de 14.5 millions de tonnes avec procédé d'extraction directe DLE
Détails: Déploiement industriel du procédé d'extraction directe (Direct Lithium Extraction) réduisant de 92% la consommation d'eau douce et le temps de raffinage de 18 mois à 6 heures. Sécurisation de 30% des besoins de la filière batteries stationnaires d'ici 2028.

Rapport D: [Article sensationnaliste non sourcé]
"La fin imminente du pétrole d'ici 3 mois selon une théorie conspirationniste en ligne."

Rapport E: [Organisation Maritime Internationale (OMI)]
Titre: Entrée en vigueur de la taxe carbone universelle sur le transport maritime de marchandises (CII 2.0)
Détails: Obligation de réduction de 30% de l'intensité carbone de la flotte commerciale mondiale dès 2026. Adoption de propulsions hybrides méthanol vert et voiles rigides automatisées sur 450 porte-conteneurs de classe Post-Panamax.`,
  },
  {
    id: "science-health",
    title: "🔬 Science, Biotech & Médecine de Précision",
    badge: "Science & Santé",
    category: "science",
    description: "Thérapies géniques in vivo CRISPR-Cas12, vaccins thérapeutiques ARN messager et remèdes miracles sur réseaux.",
    content: `[Revue Scientifique & Dépêches Médicales Internationales]

Étude 1: [Nature Medicine & Inserm]
Titre: Succès clinique de phase 3 d'une thérapie génique CRISPR in vivo ciblant les cardiomyopathies héréditaires
Détails: L'administration unique de nanoparticules lipidiques encapsulant un éditeur de base Cas12a a permis de corriger la mutation génétique dans 68% des cardiomyocytes chez 120 patients suivis sur 24 mois. Récupération de la fraction d'éjection ventriculaire moyenne de 32% à 54% sans aucun événement indésirable off-target détecté par séquençage à haut débit.

Étude 2: [Arnaque pseudo-scientifique sur les réseaux]
"Cette tisane miracle détox purifie vos cellules et guérit toutes les maladies chroniques en 3 jours chrono. Stock limité !"

Étude 3: [Science Robotics / MIT]
Titre: Microrobots magnétiques biocompatibles guidés par ultrasons pour l'ablation ciblée de micro-thrombus cérébraux
Détails: Démonstration in vivo de la navigation de microrobots magnétiques hélicoïdaux de 150 micromètres dans le réseau vasculaire intracrânien. Désobstruction d'artères cérébrales occluses en moins de 8 minutes, réduisant de 76% le risque de séquelles ischémiques post-AVC par rapport à la thrombolyse intraveineuse standard.

Étude 4: [Annonce marketing pour compléments alimentaires]
"Devenez immortel avec nos gélules de collagène quantique enrichies en poussière d'or."

Étude 5: [Cell Host & Microbe]
Titre: Découverte d'une nouvelle classe d'antibiotiques peptidiques contournant la multirésistance bactérienne (AMR)
Détails: Découverte guidée par modèle d'apprentissage profond d'un peptide synthétique ciblant la synthèse de la membrane externe des bactéries Gram-négatives (Pseudomonas aeruginosa). Taux d'éradication de 99.8% sans émergence de résistance après 30 passages sériés in vitro.`,
  },
  {
    id: "business-startups",
    title: "🏢 Stratégie Business, Startups & Venture Capital",
    badge: "Business & VC",
    category: "business",
    description: "Modèles d'affaires agentiques B2B, nouvelles métriques de rentabilité SaaS, supply chain circulaire et offres de coaching.",
    content: `[Chronique Économie d'Entreprise & Stratégie B2B]

Article 1: [Harvard Business Review & PitchBook]
Titre: Révolution du modèle de facturation SaaS : Bascule de la licence par siège vers la tarification à l'unité de travail réalisée (Work-Output Pricing)
Détails: Analyse sur 250 entreprises logicielles B2B montrant que les modèles facturant à la tâche accomplie par agent IA autonome enregistrent une rétention nette (NDR) moyenne de 142% contre 108% pour les modèles par siège utilisateur. Réduction de 38% du coût total de possession (TCO) pour les clients finaux.

Article 2: [Spam LinkedIn Coaching de fortune]
"Devenez millionnaire sans travailler grâce à notre masterclass secrète de dropshipping automatisé."

Article 3: [McKinsey Global Supply Chain Report]
Titre: Automatisation des chaînes d'approvisionnement en boucle fermée et réduction de 45% des invendus logistiques
Détails: Déploiement de jumeaux numériques couplés à la prévision de demande multi-échelons dans les réseaux de distribution de détail. Réduction des délais d'approvisionnement de 42 jours à 16 jours et baisse des stocks tampons dormants de 28 milliards de dollars à l'échelle du panel mondial.

Article 4: [Communiqué de presse pompeux]
"Notre startup révolutionne la synergie holistique du bien-être corporate avec une approche 360° ultra-disruptive."

Article 5: [Financial Times / NVCA]
Titre: Levées de fonds Series B & C : Le ratio d'efficacité du capital (Burn Multiple &lt; 1.0) devient le critère maître d'évaluation
Détails: Les investisseurs de capital-risque imposent un seuil strict de rentabilité opérationnelle avant toute nouvelle injection. Le temps moyen pour atteindre 50M$ d'ARR pour les leaders du secteur s'est contracté à 3.4 ans avec des marges brutes stabilisées au-dessus de 78%.`,
  },
  {
    id: "crypto-web3",
    title: "⚡ Crypto, Web3 & Actifs Réels Tokenisés (RWA)",
    badge: "Crypto & RWA",
    category: "crypto",
    description: "Tokenisation des bons du Trésor américain, interopérabilité des rollups Layer 2, preuves zero-knowledge et arnaques de memecoins.",
    content: `[Dépêches Cryptofinance & Protocoles Décentralisés]

Flash 1: [Federal Reserve & Société Générale FORGE]
Titre: Règlement de 5 milliards de dollars d'obligations sécurisées tokenisées sur registre distribué public
Détails: Finalisation du premier cycle de refinancement de titres de dette institutionnels émis sous forme de security tokens ERC-3643 conformes aux régulations MiCA. Le règlement contre paiement instantané (DvP) a permis d'éliminer les frais d'intermédiation de conservation de 60 points de base et de ramener le délai de collatéralisation à 15 secondes.

Flash 2: [SPAM Telegram Memecoin Pump & Dump]
"🚀 Achetez le jeton MoonDogeCoin dès maintenant avant qu'il fasse x1000 ! Pas d'utilité mais potentiel infini !"

Flash 3: [Ethereum Foundation & Rollup Alliance]
Titre: Standardisation du partage synchrone d'état entre Layer 2 via les preuves Zero-Knowledge universelles (RIP-7212)
Détails: Déploiement d'un protocole d'interopérabilité atomique reliant 12 rollups majeurs. Les transactions cross-L2 s'exécutent en un seul bloc avec une preuve de validité ZK-SNARK vérifiée on-chain pour un coût de gaz moyen inférieur à 0.002 dollar.

Flash 4: [Faux concours crypto sur X]
"Envoyez 1 ETH à cette adresse pour recevoir 2 ETH en retour pour fêter l'anniversaire du fondateur."

Flash 5: [Bank for International Settlements Innovation Hub]
Titre: Test réussi de la monnaie numérique de banque centrale (MNBC) de gros interconnectée avec les dépôts commerciaux tokenisés
Détails: Traitement de 12 000 transactions transfrontalières par seconde avec conformité AML/KYC intégrée nativement dans les contrats intelligents régulés.`,
  },
];
