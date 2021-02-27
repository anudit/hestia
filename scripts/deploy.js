const hre = require("hardhat");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { ethers } = require("hardhat");

async function main() {

    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", owner.address);
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
    const hestia = await HestiaSuperApp.deploy("0xEB796bdb90fFA0f28255275e16936D25d3418603", "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873", "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f");

    const HestiaCreator = await ethers.getContractFactory("HestiaCreator");
    const hestiaCreator = await HestiaCreator.deploy();
    const Dai = await ethers.getContractFactory("Dai");
    const dai = await Dai.deploy(hre.network.config.chainId);
    await hestia.addNewToken(ethers.utils.formatBytes32String('DAI'), dai.address);

    let net = hre.network.config.chainId.toString();

    console.log(JSON.stringify({
        [net]: {
            "HestiaSuperApp": hestia.address,
            "HestiaCreator": hestiaCreator.address,
            "Dai": dai.address
        }
    }, null, 2));

    if (hre.network.config.chainId == "80001") {
        await hestiaCreator.registerCreator('Saito Kareshi', 'QmTDKAGkgBsKscHwtPjFYsdnxw7ZrJgDhrCcRRXwVkRGFk');

        let price = ethers.utils.parseEther('1');
        let taxRate = 500; //5%

        // Birth of an Idea
        await hestia.createPost(
            price,
            (taxRate).toString(),
            "QmY6VMrktkKLWvUZQwxaBn4zdd19yjeiN3KeUygx3kcRZ3",
            'Qmc9vCaihZWEytsSPQMc3Pgs9XUMBPxwoYehdxAEJDMMMM'
        );

        // Diamond Excellence
        await hestia.createPost(
            price,
            (taxRate).toString(),
            "QmNcXENu5U4JAeLBkFQVHZ4EopfxR63QNJNv4Lqt49c1dd",
            'QmQfeEafnKB2A7i5mKUfE7oQ52VvjQeJtXN8NgtjjDsw6a'
        );

        // Discover Your Hidden Talent !
        await hestia.createPost(
            price,
            (taxRate).toString(),
            "QmYNpScxujZ6G4VLdXcwgYFo3qMm1kNkEpgSEWTrcXNhTn",
            'QmRDCKcXWnxERp6TSN9Tzbzkwb4VvH71iWAByQEtkA3dL9'
        );

        // Íkaros
        await hestia.createPost(
            price,
            (taxRate).toString(),
            "QmRdTukCCEc4NWrZVfuN1ZTaFNXpxPQcY8pRxDRiq9rk7C",
            'QmbwkgeAK1SXcfKnDekvv5SGk1VBD2KKfaUZ57rgZyn68C'
        );

        // Oddly Satisfying
        await hestia.createPost(
            price,
            (taxRate).toString(),
            "QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws",
            'QmdT6tJk3CrXyQqoBnkMQBWMPom9YCQJru1FzYikcxB3GN'
        );

        await hestia.likePost('1');
        await hestia.likePost('2');
        await hestia.likePost('3');
    }
    else if (hre.network.config.chainId == "97") {
        await hestiaCreator.registerCreator('26th Dimension', 'QmS2vax4EE4H9ZmkQbMo1te3RJf76KbULhkbk8tcQDwWqY');

        let price = ethers.utils.parseEther('1');
        let taxRate = 500; //5%

        // Genesis XXVI
        await hestia.createPost(
            price,
            (taxRate).toString(),
            "QmVPb3gcosr9nn3LvnzZPBCYC8Mt5iD7ex9XoH6M8ExvcX",
            'QmZJ9cFkj2LmtTcuP3drekMwiJux9oNs12uLu6SLMJCNPm'
        );

        await hestia.likePost('1');
    }

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
