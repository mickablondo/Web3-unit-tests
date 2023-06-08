const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const _owner = accounts[0];
    const _voter1 = accounts[1];
    const _voter2 = accounts[2];
    const _voter3 = accounts[3];
    const _nonVoter = accounts[4];

    const FIRST_PROPOSAL = "GENESIS";
    const PROPOSAL = "ma proposition";

    let VotingInstance;

    beforeEach(async function() {
        VotingInstance = await Voting.new({from: _owner});
    });

    describe("Test de l'état initial", async() => {
        it("should be the good owner, the first status and there is no winner", async () => {
            expect(await VotingInstance.owner()).to.be.equal(_owner);
            expect(await VotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(0));
            expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(0));
        });
    })

    /**
     * @dev Tests de la fonction getVoter
     * 
     * - l'électeur _voter1 est ajouté en tant qu'électeur avant chacun des tests.
     */
    describe("Test getVoter(address)", async() => {
        beforeEach(async function() {
            await VotingInstance.addVoter(_voter1, {from: _owner});
        });

        it("should get a voter", async () => {
            const voterReturned = await VotingInstance.getVoter(_voter1, {from : _voter1});

            expect(voterReturned.isRegistered).to.be.true;
            expect(voterReturned.hasVoted).to.be.false;
            expect(voterReturned.votedProposalId).to.be.bignumber.equal(new BN(0));
        });    
        
        it("should revert when caller is not a voter", async () => {
            await expectRevert(VotingInstance.getVoter(_voter1, {from: _nonVoter}), "You're not a voter");
        });

        it("should get empty return when the address is not an address voter", async() => {
            const emptyVoter = VotingInstance.getVoter(_nonVoter, {from: _voter1});

            expect(emptyVoter.isRegistered).to.be.undefined;
            expect(emptyVoter.hasVoted).to.be.undefined;
            expect(emptyVoter.votedProposalId).to.be.undefined;
        });
    });

    /**
     * @dev Tests de la fonction getOneProposal
     */
    describe("Test getOneProposal(uint)", async() => {
        it("should get one proposal", async () => {
            await VotingInstance.addVoter(_voter1, {from: _owner});
            await VotingInstance.startProposalsRegistering({from: _owner});

            const proposalReturned = await VotingInstance.getOneProposal(0, {from : _voter1});

            expect(proposalReturned.description).to.be.equal(FIRST_PROPOSAL);
            expect(proposalReturned.voteCount).to.be.bignumber.equal(new BN(0));
        });

        it("should revert when caller is not a voter", async () => {
            await expectRevert(VotingInstance.getOneProposal(0, {from: _nonVoter}), "You're not a voter");
        });

        it("should revert when the id does not exist", async() => {
            await VotingInstance.addVoter(_voter1, { from: _owner});
            await expectRevert.unspecified(VotingInstance.getOneProposal(0, {from : _voter1}));
        });
    });

    /**
     * @dev Tests de la fonction addVoter
     */
    describe("Test addVoter(address)", async() => {
        it("should add a voter", async () => {
            await VotingInstance.addVoter(_voter1, {from: _owner});
            const voterReturned = await VotingInstance.getVoter(_voter1, {from: _voter1});
            expect(voterReturned.isRegistered).to.be.true;
        });

        it('should emit VoterRegistered event', async function () {
            expectEvent(
                await VotingInstance.addVoter(_voter1, {from: _owner}),
                'VoterRegistered',
                {voterAddress: _voter1}
            );
        });

        it("should revert when caller is not the owner", async () => {
            await expectRevert(
                VotingInstance.addVoter(_voter1, {from: _voter1}),
                "Ownable: caller is not the owner"
            );
        });

        it("should revert when adding voter at the wrong step", async () => {
            await VotingInstance.startProposalsRegistering({from: _owner});
            await expectRevert(
                VotingInstance.addVoter(_voter1, {from: _owner}),
                "Voters registration is not open yet"
            );
        });

        it("should revert when adding the same voter", async () => {
            await VotingInstance.addVoter(_voter1, {from: _owner});
            await expectRevert(
                VotingInstance.addVoter(_voter1, {from: _owner}),
                "Already registered"
            );
        });
    });

    /**
     * @dev Tests de la fonction addProposal
     */
    describe("Test addProposal(string)", async() => {
        beforeEach(async function() {
            await VotingInstance.addVoter(_voter1, {from: _owner});
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

        it("should revert when caller is not a voter", async () => {
            await expectRevert(
                VotingInstance.addProposal(PROPOSAL, {from: _nonVoter}),
                "You're not a voter"
            );
        });

        it("should revert when adding proposal at the wrong step", async () => {
            await VotingInstance.endProposalsRegistering({from: _owner});
            await expectRevert(
                VotingInstance.addProposal(PROPOSAL, {from: _voter1}),
                "Proposals are not allowed yet"
            );
        });

        it("should revert when adding empty proposal", async () => {
            await expectRevert(
                VotingInstance.addProposal("", {from: _voter1}),
                "Vous ne pouvez pas ne rien proposer"
            );
        });
    });

    /**
     * @dev Tests de la fonction setVote
     */
    describe("Test setVote(uint)", async() => {
        beforeEach(async function() {
            await VotingInstance.addVoter(_voter1, {from: _owner});
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

        it("should revert when caller is not a voter", async () => {
            await expectRevert(
                VotingInstance.setVote(new BN(1), {from: _nonVoter}),
                "You're not a voter"
            );
        });

        it("should revert when setting vote at the wrong step", async () => {
            await VotingInstance.endVotingSession({from: _owner});
            await expectRevert(
                VotingInstance.setVote(new BN(1), {from: _voter1}),
                "Voting session havent started yet"
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
    });

    /**
     * @dev Tests des fonctions de modification d'état
     */
    describe("Test des changements d'état", async() => {
        describe("Test startProposalsRegistering()", async() => {
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

            it("should revert when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.startProposalsRegistering({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert when it is the wrong step", async () => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.endProposalsRegistering({from: _owner});
                await expectRevert(
                    VotingInstance.startProposalsRegistering({from: _owner}),
                    "Registering proposals cant be started now"
                );
            });
        });
        
        describe("Test endProposalsRegistering()", async() => {
            it("should end the proposals registering", async () => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.endProposalsRegistering({from: _owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(2));
            });

            it("should emit WorkflowStatusChange event", async() => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                expectEvent(
                    await VotingInstance.endProposalsRegistering({from: _owner}),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(1), newStatus: new BN(2)}
                );
            });

            it("should revert when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.endProposalsRegistering({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert when it is the wrong step", async () => {
                await expectRevert(
                    VotingInstance.endProposalsRegistering({from: _owner}),
                    "Registering proposals havent started yet"
                );
            });           
        });
        
        describe("Test startVotingSession()", async() => {
            it("should start the voting session", async () => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.endProposalsRegistering({from: _owner});
                await VotingInstance.startVotingSession({from: _owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(3));
            });

            it("should emit WorkflowStatusChange event", async() => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.endProposalsRegistering({from: _owner});
                expectEvent(
                    await VotingInstance.startVotingSession({from: _owner}),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(2), newStatus: new BN(3)}
                );
            });

            it("should revert when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.startVotingSession({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert when it is the wrong step", async () => {
                await expectRevert(
                    VotingInstance.startVotingSession({from: _owner}),
                    "Registering proposals phase is not finished"
                );
            });          
        });

        describe("Test endVotingSession()", async() => {
            it("should end the voting session", async () => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.endProposalsRegistering({from: _owner});
                await VotingInstance.startVotingSession({from: _owner});
                await VotingInstance.endVotingSession({from: _owner});
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(4));
            });

            it("should emit WorkflowStatusChange event", async() => {
                await VotingInstance.startProposalsRegistering({from: _owner});
                await VotingInstance.endProposalsRegistering({from: _owner});
                await VotingInstance.startVotingSession({from: _owner});
                expectEvent(
                    await VotingInstance.endVotingSession({from: _owner}),
                    'WorkflowStatusChange',
                    {previousStatus: new BN(3), newStatus: new BN(4)}
                );
            });

            it("should revert when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.endVotingSession({from: _voter1}),
                    "Ownable: caller is not the owner"
                );
            });

            it("should revert when it is the wrong step", async () => {
                await expectRevert(
                    VotingInstance.endVotingSession({from: _owner}),
                    "Voting session havent started yet"
                );
            });           
        });

        describe("Test tallyVotes()", async() => {
            it("should tally the votes", async() => {
                await VotingInstance.addVoter(_voter1, {from: _owner});
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

                expectEvent(
                    await VotingInstance.tallyVotes({from: _owner}),
                    "WorkflowStatusChange",
                    {previousStatus: new BN(4), newStatus: new BN(5)}
                );

                expect(await VotingInstance.winningProposalID.call()).to.be.bignumber.equal(new BN(2));
                expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(5));
            });

            it("should revert when caller is not the owner", async () => {
                await expectRevert(
                    VotingInstance.tallyVotes({from: _voter1}),
                    "Ownable: caller is not the owner"
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
});