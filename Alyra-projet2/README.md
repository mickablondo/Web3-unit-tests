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
  Contract: Voting
    Test getVoter(address)
      ✔ should get a voter
      ✔ should revert when caller is not a voter (75ms)
      ✔ should get empty return when the address is not an address voter
    Test getOneProposal(uint)
      ✔ should get one proposal (44ms)
      ✔ should revert when caller is not a voter
      ✔ should revert when the id does not exist
    Test addVoter(address)
      ✔ should add a voter
      ✔ should emit VoterRegistered event
      ✔ should revert when caller is not the owner
      ✔ should revert when adding voter at the wrong step
      ✔ should revert when adding the same voter
    Test addProposal(string)
      ✔ should add a proposal
      ✔ should emit ProposalRegistered event
      ✔ should revert when caller is not a voter
      ✔ should revert when adding proposal at the wrong step
      ✔ should revert when adding empty proposal
    Test setVote(uint)
      ✔ should set a vote
      ✔ should emit Voted event
      ✔ should revert when caller is not a voter
      ✔ should revert when setting vote at the wrong step
      ✔ should revert when trying to vote a second time
      ✔ should revert when trying to vote for a non existent proposal
    Test des changements d'état
      Test de l'état initial : RegisteringVoters
        ✔ should be the first status and there is no winner
      Test startProposalsRegistering()
        ✔ should start the proposals registering
        ✔ should emit WorkflowStatusChange event
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step (42ms)
      Test endProposalsRegistering()
        ✔ should end the proposals registering
        ✔ should emit WorkflowStatusChange event
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step
      Test startVotingSession()
        ✔ should start the voting session (67ms)
        ✔ should emit WorkflowStatusChange event (51ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step
      Test endVotingSession()
        ✔ should end the voting session (74ms)
        ✔ should emit WorkflowStatusChange event (67ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step
      Test tallyVotes()
        ✔ should tally the votes (300ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step


  42 passing (3s)
```
