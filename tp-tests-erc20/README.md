# But du projet
Réaliser des tests unitaires en JavaScript sur des Smart Contracts en Solidity.  
Le Smart Contract est la description d'un token de type ERC20.  

## Précisions
Commandes passées pour initialiser le projet et installer les librairies utiles :  
```bash
truffle init
npm install dotenv @openzeppelin/test-helpers @truffle/hdwallet-provider @openzeppelin/contracts
```

 - dotenv : gestion de configuration d'environnement
 - @truffle/hdwallet-provider : wallet
 - @openzeppelin/test-helpers : utilitaires d'[OpenZeppelin](https://www.openzeppelin.com/) pour tester les Smart Contracts
 - @openzeppelin/contracts : Smart Contracts d'[OpenZeppelin](https://www.openzeppelin.com/) (pour récupérer l'ERC20 ici)