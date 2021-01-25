const hre = require("hardhat");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { ethers } = require("hardhat");

async function main() {

    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    console.log("Deploying contracts with the account:",owner.address);
    console.log("Owner Balance:", ethers.utils.formatEther(await owner.getBalance()).toString());
    console.log("Addr1 Balance:", ethers.utils.formatEther(await addr1.getBalance()).toString());
    console.log("Addr2 Balance:", ethers.utils.formatEther(await addr2.getBalance()).toString());


    const sf = new SuperfluidSDK.Framework({version: "v1", web3Provider: ethers.provider, tokens: ["fDAI"] })
    await sf.initialize()

    // const Quote = await ethers.getContractFactory("Quote");
    // const quote = await Quote.deploy();

    // console.log("quote address: ", quote.address);
}

/*
async function main() {

    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    console.log("Deploying contracts with the account:",owner.address);
    console.log("Owner Balance:", ethers.utils.formatEther(await owner.getBalance()).toString());
    console.log("Addr1 Balance:", ethers.utils.formatEther(await addr1.getBalance()).toString());
    console.log("Addr2 Balance:", ethers.utils.formatEther(await addr2.getBalance()).toString());

    const Quote = await ethers.getContractFactory("Quote");
    const quote = await Quote.deploy();

    console.log("quote address: ", quote.address);
}*/

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
