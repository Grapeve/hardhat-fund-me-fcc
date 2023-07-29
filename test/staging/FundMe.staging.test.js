const { deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// *分阶测试不需要自己部署,但需要使用测试网
// *npx hardhat test --network sepolia, 在https://sepolia.etherscan.io上是可以查到的

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let FundMe
      let signer
      let sendValue = ethers.parseEther("0.01")
      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        signer = accounts[0]

        const FundMeDeployment = await deployments.get("FundMe")
        FundMe = await ethers.getContractAt(
          FundMeDeployment.abi,
          FundMeDeployment.address,
          signer,
        )
      })
      it("allows people to fund and withdraw", async () => {
        await FundMe.fund({ value: sendValue })
        await FundMe.withdraw()
        const endingBalance = await ethers.provider.getBalance(
          FundMe.getAddress(),
        )
        assert.equal(endingBalance.toString(), "0")
      })
    })
