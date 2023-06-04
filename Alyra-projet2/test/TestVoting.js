const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect, should } = require('chai');

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
            await expectRevert(
                VotingInstance.getOneProposal(0, {from : _voter1}),
                "VM Exception while processing transaction: revert"
            );
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

    // addProposal
    // setVote
    // etat initial = tester la valeur des variables publiques (status/gagnant)
    // startProposalsRegistering
    // endProposalsRegistering
    // startVotingSession
    // endVotingSession
    // tallyVotes
});