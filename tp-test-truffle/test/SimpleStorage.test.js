const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("SimpleStorage", accounts => {
  const _owner = accounts[0];
  const uneValue = new BN(42);

  let SimpleStorageInstance;

  beforeEach(async function() {
    SimpleStorageInstance = await SimpleStorage.new({from: _owner});
  });

  describe("test set()", function() {
    it("should revert when setting 0", async () => {
      await expectRevert(
        SimpleStorageInstance.set(0, {from: _owner}),
        "+ que zero stp"
      );
    });

    it('should set the value', async function () {
      await SimpleStorageInstance.set(uneValue, {from: _owner});
      let value = await SimpleStorageInstance.get({from: _owner});
      expect(value).to.be.bignumber.equal(uneValue);
    });

    it("should send an event when setting a value", async () => {
      expectEvent(
        await SimpleStorageInstance.set(uneValue, {from: _owner}),
        'SetDone',
        {_value: uneValue}
      );
    });
  });
});