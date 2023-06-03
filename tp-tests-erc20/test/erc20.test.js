const MyToken = artifacts.require("./MyToken.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("MyToken", accounts => {
  const _name = "Alyra";
  const _symbol = "ALY";
  const _initialSupply = new BN(10000);
  const _owner = accounts[0];
  const _recipient = accounts[1];
  const _spender = accounts[2];
  const _decimal = new BN(18);

  let MyTokenInstance;

  beforeEach(async function() { // hook pour créer nouvelle instance du token avant chaque test
    MyTokenInstance = await MyToken.new(_initialSupply, {from: _owner});
  });

  it("has a name", async () => {
    expect(await MyTokenInstance.name()).to.equal(_name);
  });

  it("has a symbol", async () => {
    expect(await MyTokenInstance.symbol()).to.equal(_symbol);
  });

  it("has a decimal", async () => {
    expect(await MyTokenInstance.decimals()).to.be.bignumber.equal(_decimal);
  });

  it("check first balance", async () => {
    expect(await MyTokenInstance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
  });

  it("check balance after transfer", async () => {
    let amount = new BN(100);
    let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)

    expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0)); // au début 0 car il n'y a pas encore de tx

    await MyTokenInstance.transfer(_recipient, new BN(100), {from: _owner}); // transaction de 100 ALY de owner vers recipient

    let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)

    expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
    expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
  });

  // --- test approve ---
  it("check if approval done", async () => {
    let amount = new BN(10);
    let AllowanceBeforeApproval = await MyTokenInstance.allowance(_owner, _spender);
    expect(AllowanceBeforeApproval).to.be.bignumber.equal(new BN(0));
 
    await MyTokenInstance.approve(_spender, amount);
    
    let AllowanceAfterApproval = await MyTokenInstance.allowance(_owner, _spender);
    expect(AllowanceAfterApproval).to.be.bignumber.equal(amount);
  });

  // --- test transferFrom ---
  // test la maj allowance après transfer : _approve(owner, spender, currentAllowance - amount);
  it("check if transferFrom done checking allowance", async () => { 
    let amount = new BN(10);
    await MyTokenInstance.approve(_spender, amount);
    await MyTokenInstance.transferFrom(_owner, _spender, new BN(5), { from: _spender});
    expect(await MyTokenInstance.allowance(_owner, _spender)).to.be.bignumber.equal(new BN(5));
  });

  it("check if transferFrom done checking balance", async () => {
    let amount = new BN(100);
    
    await MyTokenInstance.approve(_recipient, amount);
 
    // les balances avant
    let balanceOwnerBeforeTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientBeforeTransfer = await MyTokenInstance.balanceOf(_recipient)
    expect(balanceOwnerBeforeTransfer).to.be.bignumber.equal(_initialSupply);
    expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));
 
    await MyTokenInstance.transferFrom(_owner, _recipient, amount, { from: _recipient})
 
    // les balances après
    let balanceOwnerAfterTransfer = await MyTokenInstance.balanceOf(_owner);
    let balanceRecipientAfterTransfer = await MyTokenInstance.balanceOf(_recipient)
    expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
    expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
  });
});