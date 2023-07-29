const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let FundMe
      let signer
      let MockV3Aggregator
      const sendValue = ethers.parseEther("0.001")
      beforeEach(async () => {
        // signer = (await getNamedAccounts()).deployer
        const accounts = await ethers.getSigners()
        signer = accounts[0]
        await deployments.fixture(["all"]) // *单元测试中需要自己部署合约

        const FundMeDeployment = await deployments.get("FundMe")
        FundMe = await ethers.getContractAt(
          FundMeDeployment.abi,
          FundMeDeployment.address,
          signer,
        )
        const MockV3AggregatorDeployment = await deployments.get(
          "MockV3Aggregator",
        )
        MockV3Aggregator = await ethers.getContractAt(
          MockV3AggregatorDeployment.abi,
          MockV3AggregatorDeployment.address,
          signer,
        )
      })

      describe("constructor", async () => {
        it("sets the aggregator address correctly", async () => {
          const response = await FundMe.getPriceFeed()
          assert.equal(response, MockV3Aggregator.target)
        })
      })
      describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(FundMe.fund()).to.be.revertedWith("Didn't send enough!")
        })
        it("updated the amount funded data structure", async () => {
          await FundMe.fund({ value: sendValue })
          const response = await FundMe.getAddressToAmountFunded(signer.address)
          assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async () => {
          await FundMe.fund({ value: sendValue })
          const funder = await FundMe.getFunder(0)
          assert.equal(funder, signer.address)
        })
      })
      describe("withdraw", async () => {
        beforeEach(async () => {
          await FundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from a single founder", async () => {
          const startingFundMeBalance = await ethers.provider.getBalance(
            // use signer.provider is ok
            await FundMe.getAddress(),
          )
          const startingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )
          const transactionResponse = await FundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await signer.provider.getBalance(
            await FundMe.getAddress(),
          )
          const endingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString(),
          )
        })
        it("allows us to withdraw with multiple funders", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const FundMeConnectedContract = await FundMe.connect(accounts[i])
            await FundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress(),
          )
          const startingDeployerBalance = await ethers.provider.getBalance(
            signer.address,
          )

          const transactionResponse = await FundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await signer.provider.getBalance(
            await FundMe.getAddress(),
          )
          const endingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString(),
          )

          // make sure that the funders are reset properly
          await expect(FundMe.getFunder(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await FundMe.getAddressToAmountFunded(accounts[i].address),
              0,
            )
          }
        })

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConnectedContract = await FundMe.connect(attacker)
          await expect(
            attackerConnectedContract.withdraw(),
          ).to.be.revertedWithCustomError(FundMe, "FundMe__NotOwner")
        })

        it("cheaperWithdraw ETH from a single founder", async () => {
          const startingFundMeBalance = await ethers.provider.getBalance(
            // use signer.provider is ok
            await FundMe.getAddress(),
          )
          const startingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )
          const transactionResponse = await FundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await signer.provider.getBalance(
            await FundMe.getAddress(),
          )
          const endingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString(),
          )
        })
        it("cheaperWithdraw test...", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const FundMeConnectedContract = await FundMe.connect(accounts[i])
            await FundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            await FundMe.getAddress(),
          )
          const startingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )

          const transactionResponse = await FundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await signer.provider.getBalance(
            await FundMe.getAddress(),
          )
          const endingDeployerBalance = await signer.provider.getBalance(
            signer.address,
          )
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString(),
          )

          // make sure that the funders are reset properly
          await expect(FundMe.getFunder(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await FundMe.getAddressToAmountFunded(accounts[i].address),
              0,
            )
          }
        })
      })
    })
