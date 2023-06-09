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
  
TODO : Expliquer la séparation des tests  
### Description détaillée
1. Etat initial
    - vérification du propriétaire du Smart Contract
    - vérification des différentes données à l'état initial du système de vote
2. Autorisations
   1. Vérification des onlyOwner
      - addVoter
      - startProposalsRegistering
      - endProposalsRegistering
      - startVotingSession
      - endVotingSession
      - tallyVotes
   2. Vérification des onlyVoters
      - getVoter
      - getOneProposal
      - addProposal
      - setVote
3. Validation du changement de statut
   1. 
4. 

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
|  Voting    ·  addProposal                ·       59285  ·      59417  ·      59302  ·          16  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addVoter                   ·       50185  ·      50197  ·      50196  ·          32  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30587  ·          20  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endVotingSession           ·           -  ·          -  ·      30521  ·           8  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  setVote                    ·       60885  ·      77985  ·      75135  ·          12  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      95003  ·          30  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startVotingSession         ·           -  ·          -  ·      30542  ·          16  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  tallyVotes                 ·           -  ·          -  ·      66439  ·           3  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Deployments                             ·                                          ·  % of limit  ·             │
···········································|··············|·············|·············|··············|··············
|  Voting                                  ·           -  ·          -  ·    2028930  ·      30.2 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·
```
