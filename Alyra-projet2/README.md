# Alyra - Projet 2
## Description du projet
Fournir les tests unitaires d'un Smart Contract qui gère un système de vote simplifié.  
## Pré-requis
Installation des librairies utiles :  
```bash
npm install -g truffle
npm install dotenv @openzeppelin/test-helpers @truffle/hdwallet-provider @openzeppelin/contracts
```
## Tests Unitaires
### Description générale
Le fichier test/Voting.test.js contient l'ensemble des tests du Smart Contract contracts/Voting.sol.  
Chaque fonction du Smart Contract, présentée ci-dessous, est testée de différentes manières : les cas passants, les événements émis et les revert à différentes étapes du workflow.  
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
  
### Description détaillée
1. Etat initial
    - vérification du propriétaire du Smart Contract
    - vérification du bon état du workflow
    - vérification de l'état initial de l'id du gagnant
2. Autorisations
   1. Vérification des onlyOwner
      - addVoter, startProposalsRegistering, endProposalsRegistering, startVotingSession, endVotingSession, tallyVotes
   2. Vérification des onlyVoters
      - getVoter, getOneProposal, addProposal, setVote
3. Etape par étape
   1. Enregistrement des votants
      - vérification que le votant est bien enregistré
      - vérification que le votant n'a pas encore de vote enregistré
      - vérification que le votant n'a pas encore de proposition enregistrée
      - test de l'évènement émis à l'ajout d'un votant   
      - demande de récupération d'un votant non enregistré
      - vérification que l'ajout d'un votant déjà existant ne doit pas être possible
      - Vérification du changement d'état du workflow : étape suivante, gestion de l'évènement
      - Test workflow - appels aux autres fonctions (<i>tous ces tests ne seront pas réalisés à chaque étape mais pourraient l'être</i>) : endProposalsRegistering, startVotingSession, endVotingSession, tallyVotes
   2. Démarrage de l'ajout des propositions
      - ajout d'une proposition
      - test de l'évènement émis à l'ajout d'une proposition
      - ajout d'une proposition vide
      - Vérification du changement d'état du workflow : étape suivante, gestion de l'évènement
      - Test workflow - appel aux autres fonctions : addVoter
   3. Fin de l'ajout des propositions
      - récupération d'une proposition
      - vérification que la proposition récupérée n'a pas de vote associé
      - demande de récupération d'une proposition dont l'id n'existe pas
      - Vérification du changement d'état du workflow : étape suivante, gestion de l'évènement
      - Test workflow - appel aux autres fonctions : addProposal, setVote, startProposalsRegistering
   4. Démarrage de la session de vote
      - vérification de l'ajout d'un vote
      - vérification que le compteur de vote d'une proposition s'incrémente bien
      - test de l'évènement émis à l'ajout d'un vote
      - ajout d'un second vote pour un même votant
      - ajout d'un vote pour une proposition non existante
      - Vérification du changement d'état du workflow : étape suivante, gestion de l'évènement
   5. Fin de la session de vote et comptage des points
      - Simulation complète jusqu'au comptage des votes avec 3 votants
      - récupération du gagnant
      - Vérification du changement d'état du workflow : étape suivante, gestion de l'évènement

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
    Etat initial
      ✓ should be the good owner at the initial step
      ✓ should be the first status  at the initial step
      ✓ should return 0 for the winning proposal id
    Tests des autorisations
      Fonctions avec onlyOwner
        ✓ should revert addVoter when caller is not the owner
        ✓ should revert startProposalsRegistering when caller is not the owner
        ✓ should revert endProposalsRegistering when caller is not the owner
        ✓ should revert startVotingSession when caller is not the owner
        ✓ should revert endVotingSession when caller is not the owner
        ✓ should revert tallyVotes when caller is not the owner
      Fonctions avec onlyVoters
        ✓ should revert getVoter when caller is not a voter (50197 gas)
        ✓ should revert getOneProposal when caller is not a voter
        ✓ should revert addProposal when caller is not a voter
        ✓ should revert setVote when caller is not a voter
    Etape par étape
      Enregistrement des votants
        ✓ should get the voter added
        ✓ should get a voter whithout any votes
        ✓ should get a voter whithout any proposal
        ✓ should emit VoterRegistered event (50197 gas)
        ✓ should get empty return when the address is not an address voter
        ✓ should revert when adding the same voter
        Comportement du changement de statut
          ✓ should start the proposals registering (95003 gas)
          ✓ should emit WorkflowStatusChange event (95003 gas)
        Vérification des étapes du workflow
          ✓ should revert when it is the wrong step
          ✓ should revert when it is the wrong step
          ✓ should revert when it is the wrong step
          ✓ should revert when it is the wrong step
      Démarrage de l'ajout des propositions
        ✓ should add a proposal (59285 gas)
        ✓ should emit ProposalRegistered event (59285 gas)
        ✓ should revert when adding empty proposal
        ✓ should revert addVoter when adding voter at the wrong step
        Comportement du changement de statut
          ✓ should end the proposals registering (30587 gas)
          ✓ should emit WorkflowStatusChange event (30587 gas)
      Fin de l'ajout des propositions
        ✓ should get the first proposal
        ✓ should verify than proposal has no vote
        ✓ should revert when the id does not exist
        Comportement du changement de statut
          ✓ should start the voting session (30542 gas)
          ✓ should emit WorkflowStatusChange event (30542 gas)
        Vérification des étapes du workflow
          ✓ should revert when adding proposal at the wrong step
          ✓ should revert when setting vote at the wrong step
          ✓ should revert when it is the wrong step
      Démarrage de la session de vote
        ✓ should set a vote (77985 gas)
        ✓ should increment the proposal counter (77985 gas)
        ✓ should emit Voted event (77985 gas)
        ✓ should revert when trying to vote a second time (77985 gas)
        ✓ should revert when trying to vote for a non existent proposal
        Comportement du changement de statut
          ✓ should end the voting session (30521 gas)
          ✓ should emit WorkflowStatusChange event (30521 gas)
      Fin de la session de vote et comptage des points
        ✓ should tally the votes and the winner is known (66439 gas)
        Comportement du changement de statut
          ✓ should tally the votes and change the workflow status (66439 gas)
          ✓ should tally the votes and emit the event (66439 gas)
  
   49 passing (12s)
```
### Couverture
Suite à l'[issue](https://github.com/sc-forks/solidity-coverage/issues/696) en cours concernant les erreurs de solidity-coverage sur Truffle, j'ai utilisé un [projet utilisant Hardhat](https://github.com/mickablondo/Web3-tests-unitaires/tree/master/hardhat-test) avec le plugin [hardhat-truffle5](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-truffle5) dans lequel j'ai copié mon Smart Contract et mon fichier de test pour avoir la couverture de test suivante :  

```bash
npx hardhat coverage --testfiles "test/unit/Voting.test.js"
```  
  
```bash
-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |      100 |      100 |      100 |                |
  Voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
```

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
|  Voting    ·  addProposal                ·       59285  ·      59417  ·      59299  ·          28  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addVoter                   ·       50185  ·      50197  ·      50196  ·          55  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30587  ·          28  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endVotingSession           ·           -  ·          -  ·      30521  ·           7  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  setVote                    ·       60885  ·      77985  ·      74967  ·          17  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      95003  ·          30  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startVotingSession         ·           -  ·          -  ·      30542  ·          15  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  tallyVotes                 ·           -  ·          -  ·      66439  ·           5  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Deployments                             ·                                          ·  % of limit  ·             │
···········································|··············|·············|·············|··············|··············
|  Voting                                  ·           -  ·          -  ·    2028930  ·      30.2 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·
```
