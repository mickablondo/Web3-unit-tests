# Alyra - Projet 2
## Description du projet
Fournir les tests unitaires d'un Smart Contract qui gère un système de vote simplifié.  
## Stack technique
![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)
## Pré-requis
Installation des librairies utiles :  
```bash
npm install -g truffle
npm install dotenv @openzeppelin/test-helpers @truffle/hdwallet-provider @openzeppelin/contracts
```
## Tests Unitaires
### Description
Le fichier test/TestVoting.js contient l'ensemble des tests du Smart Contract contracts/Voting.sol.  
Chaque fonction du Smart Contract est testée de différentes manières : les cas passants, les événements émis et les revert.  
| Fonction | Description | Autorisation |
|----------|-------------|--------------|
| getVoter(address) | Récupère les informations d'un votant | Ceux qui votent |
| getOneProposal(uint) | Récupère une proposition | Ceux qui votent |
| addVoter(address) | Ajouter un votant | Propriétaire du SC |
| addProposal(string) | Ajouter une proposition | Ceux qui votent |
| setVote(uint) | Permet de voter | Ceux qui votent |
| startProposalsRegistering() | Changement de statut : début proposition | Propriétaire du SC |
| endProposalsRegistering() | Changement de statut : fin proposition | Propriétaire du SC |
| startVotingSession() | Changement de statut : début session de vote | Propriétaire du SC |
| endVotingSession() | Changement de statut : fin session de vote | Propriétaire du SC |
| tallyVotes() | Changement de statut : fin - comptage des votes | Propriétaire du SC |

### Exécution
Il faut d'abord lancer ganache :  
```bash
ganache 
```  
Puis exécuter les tests unitaires via la commande :  
```bash
truffle test
```
### Résultats
```bash

```
