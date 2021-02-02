const hre = require("hardhat");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { ethers } = require("hardhat");

async function main() {

    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    console.log("Deploying contracts with the account:",owner.address);
    console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());
    console.log(`Addr1 [${addr1.address}] Balance:`, ethers.utils.formatEther(await addr1.getBalance()).toString());
    console.log(`Addr2 [${addr2.address}] Balance:`, ethers.utils.formatEther(await addr2.getBalance()).toString());
    // console.log(hre.network)
    /*
    const sf = new SuperfluidSDK.Framework({
        version: "v1",
        tokens: ["fDAI"],
        web3Provider: hre.network.provider,
    });
    await sf.initialize();

    const dai = await sf.contracts.TestToken.at(sf.tokens.fDAI.address);
    const daix = sf.tokens.fDAIx;
    await dai.mint(owner.address, ethers.utils.parseEther("100").toString(), { from: owner.address })
    await dai.approve(daix.address, "1"+"0".repeat(42), { from: owner.address  })
    await daix.upgrade(ethers.utils.parseEther("50").toString(), { from: owner.address })
    let bal = await daix.balanceOf(owner.address);
    console.log("bal", ethers.utils.formatEther(bal.toString()));
    const HestiaSuperApp = await ethers.getContractFactory("HestiaSuperApp");
    const hestiaSuperApp = await HestiaSuperApp.deploy(sf.host.address, sf.agreements.cfa.address, daix.address);
    console.log(hestiaSuperApp.address)
    */

   const HestiaSuperApp = await ethers.getContractFactory("HestiaSuperApp");
   const hestia = await HestiaSuperApp.deploy();
   const HestiaCreator = await ethers.getContractFactory("HestiaCreator");
   const hestiaCreator = await HestiaCreator.deploy();
   const Dai = await ethers.getContractFactory("Dai");
   const dai = await Dai.deploy(hre.network.config.chainId);
hestia.addNewToken(ethers.utils.formatBytes32String('DAI'), dai.address);

   console.log("HestiaSuperApp: ", hestia.address);
   console.log("HestiaCreator: ", hestiaCreator.address);
   console.log("Dai: ", dai.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
