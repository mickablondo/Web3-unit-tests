const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const _owner = accounts[0];
    const _voter1 = accounts[1];
    const _voter2 = accounts[2];
    const _voter3 = accounts[3];
    const _nonVoter = accounts[4];

    const PROPOSAL = "ma proposition";

    let VotingInstance;

    beforeEach(async function() {
        VotingInstance = await Voting.new({from: _owner});
    });

    /**
     * @dev Tests sur l'état initial après déploiement du Smart Contract
     */
    describe("Etat initial", async() => {
        it("should be the good owner at the initial step", async () => {
            expect(await VotingInstance.owner()).to.be.equal(_owner);
        });

        it("should be the first status  at the initial step", async () => {
            expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(0));
        });

        it("should return 0 for the winning proposal id", async () => {
            expect(await VotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(0));
        });
    })

    /**
     * Tests sur les différentes autorisations d'accès aux fonctions
     */
    describe("Tests des autorisations", async() => {
        context("Fonctions avec onlyOwner", async() => {
            it("should revert addVoter when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.addVoter(_voter1, {from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert startProposalsRegistering when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.startProposalsRegistering({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert endProposalsRegistering when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.endProposalsRegistering({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert startVotingSession when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.startVotingSession({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });
            
            it("should revert endVotingSession when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.endVotingSession({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });
            
            it("should revert tallyVotes when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.tallyVotes({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });
        });

        context("Fonctions avec onlyVoters", async() => {
            it("should revert getVoter when caller is not a voter", async () => {
                await VotingInstance.addVoter(_voter1, {from: _owner});
                await expectRevert(VotingInstance.getVoter(_voter1, {from: _nonVoter}), "You're not a voter");
            });

            it("should revert getOneProposal when caller is not a voter", async () => {
                await expectRevert(VotingInstance.getOneProposal(0, {from: _nonVoter}), "You're not a voter");
            });

            it("should revert addProposal when caller is not a voter", async () => {
                await expectRevert(
                    VotingInstance.addProposal(PROPOSAL, {from: _nonVoter}),
                    "You're not a voter"
                );
            });
            
            it("should revert setVote when caller is not a voter", async () => {
                await expectRevert(
                    VotingInstance.setVote(new BN(1), {from: _nonVoter}),
                    "You're not a voter"
                );
            });
        });
    });

    /**
     * @dev Tests fonctionnels étape par étape
     */
    describe("Etape par étape", async() =>{
        beforeEach(async function() {
            await VotingInstance.addVoter(_voter1, {from: _owner});
        });

        context("Enregistrement des votants", async() => {
            it("should get the voter added", async () => {
                const voterReturned = await VotingInstance.getVoter(_voter1, {from: _voter1});
                expect(voterReturned.isRegistered).to.be.true;
            });

            it("should get a voter whithout any votes", async () => {
                const voterReturned = await VotingInstance.getVoter(_voter1, {from : _voter1});
                expect(voterReturned.hasVoted).to.be.false;
            });   

            it("should get a voter whithout any proposal", async () => {
                const voterReturned = await VotingInstance.getVoter(_voter1, {from : _voter1});
                expect(voterReturned.votedProposalId).to.be.bignumber.equal(new BN(0));
            });   
    
            it('should emit VoterRegistered event', async function () {
                expectEvent(
                    await VotingInstance.addVoter(_voter2, {from: _owner}),
                    'VoterRegistered',
                    {voterAddress: _voter2}
                );
            });

            it("should get empty return when the address is not an address voter", async() => {
                const emptyVoter = VotingInstance.getVoter(_nonVoter, {from: _voter1});
                expect(emptyVoter.isRegistered).to.be.undefined;
            });

            it("should revert when adding the same voter", async () => {
                await expectRevert(
                    VotingInstance.addVoter(_voter1, {from: _owner}),
                    "Already registered"
                );
            });

            describe("Comportement du changement de statut", async() => {
                it("should start the proposals registering", async () => {
                    await VotingInstance.startProposalsRegistering({from: _owner});
                    expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(1));
                });
    
                it("should emit WorkflowStatusChange event", async() => {
                    expectEvent(
                        await VotingInstance.startProposalsRegistering({from: _owner}),
                        'WorkflowStatusChange',
                        {previousStatus: new BN(0), newStatus: new BN(1)}
                    );
                });
            });

            describe("Vérification des étapes du workflow", async() => {
                it("should revert when it is the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.endProposalsRegistering({from: _owner}),
                        "Registering proposals havent started yet"
                    );
                }); 
                
                it("should revert when it is the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.startVotingSession({from: _owner}),
                        "Registering proposals phase is not finished"
                    );
                });
                
                it("should revert when it is the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.endVotingSession({from: _owner}),
                        "Voting session havent started yet"
                    );
                }); 
                
                it("should revert when it is the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.tallyVotes({from: _owner}),
                        "Current status is not voting session ended"
                    );
                });
            }); 
        });

        context("Démarrage de l'ajout des propositions", async() => {
            beforeEach(async function() {
                await VotingInstance.startProposalsRegistering({from: _owner});
            });

            it("should add a proposal", async () => {
                await VotingInstance.addProposal(PROPOSAL, {from: _voter1});
                const proposalReturned = await VotingInstance.getOneProposal(1, {from: _voter1});
                expect(proposalReturned.description).to.be.equal(PROPOSAL);
            });

            it('should emit ProposalRegistered event', async function () {
                expectEvent(
                    await VotingInstance.addProposal(PROPOSAL, {from: _voter1}),
                    'ProposalRegistered',
                    {proposalId: new BN(1)}
                );
            });

            it("should revert when adding empty proposal", async () => {
                await expectRevert(
                    VotingInstance.addProposal("", {from: _voter1}),
                    "Vous ne pouvez pas ne rien proposer"
                );
            });

            describe("Comportement du changement de statut", async() => {
                it("should end the proposals registering", async () => {
                    await VotingInstance.endProposalsRegistering({from: _owner});
                    expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(2));
                });
    
                it("should emit WorkflowStatusChange event", async() => {
                    expectEvent(
                        await VotingInstance.endProposalsRegistering({from: _owner}),
                        'WorkflowStatusChange',
                        {previousStatus: new BN(1), newStatus: new BN(2)}
                    );
                });
            });

            it("should revert addVoter when adding voter at the wrong step", async () => {
                await expectRevert(
                    VotingInstance.addVoter(_voter2, {from: _owner}),
                    "Voters registration is not open yet"
                );
            });
        });

        context("Fin de l'ajout des propositions", async() => {
            beforeEach(async function() {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.addProposal(PROPOSAL, {from: _voter1}),
                await VotingInstance.endProposalsRegistering({from: _owner});
            });

            it("should get the first proposal", async () => {
                const proposalReturned = await VotingInstance.getOneProposal(1, {from : _voter1});
                expect(proposalReturned.description).to.be.equal(PROPOSAL);
            });

            it("should verify than proposal has no vote", async () => {
                const proposalReturned = await VotingInstance.getOneProposal(1, {from : _voter1});
                expect(proposalReturned.voteCount).to.be.bignumber.equal(new BN(0));
            });

            it("should revert when the id does not exist", async() => {
                await expectRevert.unspecified(VotingInstance.getOneProposal(8, {from : _voter1}));
            });

            describe("Comportement du changement de statut", async() => {
                it("should start the voting session", async () => {
                    await VotingInstance.startVotingSession({from: _owner});
                    expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(3));
                });
    
                it("should emit WorkflowStatusChange event", async() => {
                    expectEvent(
                        await VotingInstance.startVotingSession({from: _owner}),
                        'WorkflowStatusChange',
                        {previousStatus: new BN(2), newStatus: new BN(3)}
                    );
                });
            });

            describe("Vérification des étapes du workflow", async() => {
                it("should revert when adding proposal at the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.addProposal(PROPOSAL, {from: _voter1}),
                        "Proposals are not allowed yet"
                    );
                });

                it("should revert when setting vote at the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.setVote(new BN(1), {from: _voter1}),
                        "Voting session havent started yet"
                    );
                });

                it("should revert when it is the wrong step", async () => {
                    await expectRevert(
                        VotingInstance.startProposalsRegistering({from: _owner}),
                        "Registering proposals cant be started now"
                    );
                });
            }); 
        });

        context("Démarrage de la session de vote", async() => {
            beforeEach(async function() {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.addProposal(PROPOSAL, {from: _voter1});
                await VotingInstance.endProposalsRegistering({from: _owner});
                await VotingInstance.startVotingSession({from: _owner});
            });

            it("should set a vote", async () => {
                await VotingInstance.setVote(new BN(1), {from: _voter1});
                const voterReturned = await VotingInstance.getVoter(_voter1, {from: _voter1});
                expect(voterReturned.votedProposalId).to.be.bignumber.equal(new BN(1));
            });

            it('should emit Voted event', async function () {
                expectEvent(
                    await VotingInstance.setVote(new BN(1), {from: _voter1}),
                    'Voted',
                    {voter: _voter1, proposalId: new BN(1)}
                );
            });

            it("should revert when trying to vote a second time", async () => {
                await VotingInstance.setVote(new BN(1), {from: _voter1});
                await expectRevert(
                    VotingInstance.setVote(new BN(0), {from: _voter1}),
                    "You have already voted"
                );
            });

            it("should revert when trying to vote for a non existent proposal", async () => {
                await expectRevert(
                    VotingInstance.setVote(new BN(50), {from: _voter1}),
                    "Proposal not found"
                );
            });

            describe("Comportement du changement de statut", async() => {
                it("should end the voting session", async () => {
                    await VotingInstance.endVotingSession({from: _owner});
                    expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(4));
                });

                it("should emit WorkflowStatusChange event", async() => {
                    expectEvent(
                        await VotingInstance.endVotingSession({from: _owner}),
                        'WorkflowStatusChange',
                        {previousStatus: new BN(3), newStatus: new BN(4)}
                    );
                });
            });
        });

        context("Fin de la session de vote et comptage des points", async() => {
            beforeEach(async function() {
                await VotingInstance.addVoter(_voter2, {from: _owner});
                await VotingInstance.addVoter(_voter3, {from: _owner});

                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.addProposal("autre proposal", {from: _voter1});
                await VotingInstance.addProposal(PROPOSAL, {from: _voter2});
                await VotingInstance.addProposal("encore une autre proposal", {from: _voter3});
                await VotingInstance.endProposalsRegistering({from: _owner});

                await VotingInstance.startVotingSession({from: _owner});
                await VotingInstance.setVote(new BN(1), {from: _voter1});
                await VotingInstance.setVote(new BN(2), {from: _voter2});
                await VotingInstance.setVote(new BN(2), {from: _voter3});
                await VotingInstance.endVotingSession({from: _owner});
            });

            it("should tally the votes and the winner is known", async() => {
                await VotingInstance.tallyVotes({from: _owner});
                expect(await VotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(2));
            });

            describe("Comportement du changement de statut", async() => {
                it("should tally the votes and change the workflow status", async() => {
                    await VotingInstance.tallyVotes({from: _owner});
                    expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(5));
                });
    
                it("should tally the votes and emit the event", async() => {
                    expectEvent(
                        await VotingInstance.tallyVotes({from: _owner}),
                        "WorkflowStatusChange",
                        {previousStatus: new BN(4), newStatus: new BN(5)}
                    );
                });
            });
        });
    });


/* --------------------------------------------------------- */

    /**
     * @dev Tests des fonctions de modification d'état
     */
    describe("Test des changements d'état", async() => {

        describe("Test tallyVotes()", async() => {
            describe("Tests OK", async() => {
                beforeEach(async function() {
                    
    
                    
                });
    
                
            }); 
        });
    });
});