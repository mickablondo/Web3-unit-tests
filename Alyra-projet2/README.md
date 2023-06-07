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
Le fichier test/Voting.test.js contient l'ensemble des tests du Smart Contract contracts/Voting.sol.  
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
    Test de l'état initial
      ✔ should be the good owner, the first status and there is no winner
    Test getVoter(address)
      ✔ should get a voter
      ✔ should revert when caller is not a voter (72ms)
      ✔ should get empty return when the address is not an address voter
    Test getOneProposal(uint)
      ✔ should get one proposal (43ms)
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
      Test startProposalsRegistering()
        ✔ should start the proposals registering
        ✔ should emit WorkflowStatusChange event
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step (38ms)
      Test endProposalsRegistering()
        ✔ should end the proposals registering (40ms)
        ✔ should emit WorkflowStatusChange event (48ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step
      Test startVotingSession()
        ✔ should start the voting session (52ms)
        ✔ should emit WorkflowStatusChange event (49ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step
      Test endVotingSession()
        ✔ should end the voting session (69ms)
        ✔ should emit WorkflowStatusChange event (64ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step
      Test tallyVotes()
        ✔ should tally the votes (275ms)
        ✔ should revert when caller is not the owner
        ✔ should revert when it is the wrong step


  42 passing (3s)
```
### Couverture
### Gas Report
Pour calculer le coût en gas des différentes fonctions, il faut installer eth-gas-reporter :  
```bash
npm install --save-dev eth-gas-reporter
```
Et modifier son fichier truffle-config.js :  
```JS
  mocha: {
    reporter: 'eth-gas-reporter'
  },
```
Le résultat :  
```bash
·------------------------------------------|----------------------------|-------------|----------------------------·
|   Solc version: 0.8.20+commit.a1b79de6   ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
···········································|····························|·············|·····························
|  Methods                                                                                                         │
·············|·····························|··············|·············|·············|··············|··············
|  Contract  ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls     ·  eur (avg)  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addProposal                ·       59285  ·      59417  ·      59295  ·          13  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addVoter                   ·       50185  ·      50197  ·      50197  ·          29  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30587  ·          19  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endVotingSession           ·           -  ·          -  ·      30521  ·           7  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  setVote                    ·       60885  ·      77985  ·      76085  ·           9  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      95003  ·          29  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startVotingSession         ·           -  ·          -  ·      30542  ·          15  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  tallyVotes                 ·           -  ·          -  ·      66439  ·           2  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Deployments                             ·                                          ·  % of limit  ·             │
···········································|··············|·············|·············|··············|··············
|  Voting                                  ·           -  ·          -  ·    2028930  ·      30.2 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·
```
