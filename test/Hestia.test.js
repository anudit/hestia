const { expect } = require("chai");
const hre = require("hardhat");

describe("Hestia", accounts => {

    let hestia, hestiaCreator, dai;
    let owner, alice, bob, addrs;

    beforeEach(async function () {
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        // await hre.network.provider.request({
        //     method: "hardhat_impersonateAccount",
        //     params: ["0xEB796bdb90fFA0f28255275e16936D25d3418603"]}
        // )
        // await hre.network.provider.request({
        //     method: "hardhat_impersonateAccount",
        //     params: ["0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873"]}
        // )
        // await hre.network.provider.request({
        //     method: "hardhat_impersonateAccount",
        //     params: ["0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"]}
        // )

        const HestiaSuperApp = await ethers.getContractFactory("HestiaSuperApp");
        hestia = await HestiaSuperApp.deploy("0xEB796bdb90fFA0f28255275e16936D25d3418603", "0x49e565Ed1bdc17F3d220f72DF0857C26FA83F873", "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f");

        const HestiaCreator = await ethers.getContractFactory("HestiaCreator");
        hestiaCreator = await HestiaCreator.deploy();

        const Dai = await ethers.getContractFactory("Dai");
        dai = await Dai.deploy(hre.network.config.chainId);
    });


    describe("NFT Tests", accounts => {

        it("Should deploy contracts", async function () {
            expect(true).to.equal(true);
        });

        it("Should create New Post", async () => {
            await hestia.createPost(
                ethers.utils.parseEther('1'),
                ethers.utils.parseEther('0.05'),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );
            expect(await hestia._postIds()).to.equal('1');
            expect(await hestia._tokenIds()).to.equal('1');
            expect(await hestia.balanceOf(owner.address)).to.equal('1');
            let pData = await hestia._posts('1');
            expect(pData['price']).to.equal(ethers.utils.parseEther('1'));
            let appData = await hestia.getApproved('1');
            expect(appData).to.equal(hestia.address);

        });

        it("Should create New Post via Meta-Txn", async function () {
            const userNonce = await hestia.nonces(owner.address);
            expect(userNonce).to.equal('0');

            const typedMessage = {
                domain:{
                    name: "Hestia",
                    version: "1",
                    chainId : hre.network.config.chainId,
                    verifyingContract: hestia.address
                },
                primaryType: "MetaTransaction",
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" }
                    ],
                    MetaTransaction: [
                        { name: "nonce", type: "uint256" },
                        { name: "from", type: "address" }
                    ]
                },
                message: {
                    nonce: parseInt(userNonce),
                    from: owner.address
                },
            };

            const signature = await hre.network.provider.request({
                method: "eth_signTypedData_v4",
                params: [owner.address, typedMessage],
            });
            const sig = signature.substring(2);
            const r = "0x" + sig.substring(0, 64);
            const s = "0x" + sig.substring(64, 128);
            const v = parseInt(sig.substring(128, 130), 16).toString();

            let price = ethers.utils.parseEther('1');
            let taxRate = 500; //5%

            await hestia.createPostMeta(
                price,
                (taxRate).toString(),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws',
                owner.address, r, s, v
            );

            expect(await hestia._postIds()).to.equal('1');
            expect(await hestia._tokenIds()).to.equal('1');
            expect(await hestia.balanceOf(owner.address)).to.equal('1');
            let pData = await hestia._posts('1');
            expect(pData['price']).to.equal(ethers.utils.parseEther('1'));
            let appData = await hestia.getApproved('1');
            expect(appData).to.equal(hestia.address);

        });

        it("Should purchase Post in ETH", async () => {

            let price = ethers.utils.parseEther('1');
            let taxRate = 500; //5%

            await hestia.createPost(
                price,
                (taxRate).toString(),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            let taxAmount = price.mul(taxRate).div(10000);
            let totalCost = price.add(taxAmount);

            await hestia.connect(alice).purchasePost(
                '1',ethers.utils.formatBytes32String('ETH'),
                {value:totalCost}
            );

            expect(await hestia._postIds()).to.equal('1');
            expect(await hestia._tokenIds()).to.equal('1');
            expect(await hestia.balanceOf(owner.address)).to.equal('0');
            expect(await hestia.balanceOf(alice.address)).to.equal('1');
            let pData = await hestia._posts('1');
            expect(pData['owner']).to.equal(alice.address);
        });

        it("Should purchase Post in DAI", async () => {

            let price = ethers.utils.parseEther('1');
            let taxRate = 500; //5%

            await hestia.createPost(
                price,
                (taxRate).toString(),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            let taxAmount = price.mul(taxRate).div(10000);
            let totalCost = price.add(taxAmount);

            await hestia.addNewToken(
                ethers.utils.formatBytes32String('DAI'), dai.address
            );

        });

        it("Should update Post price", async () => {
            await hestia.createPost(
                ethers.utils.parseEther('1'),
                ethers.utils.parseEther('0.05'),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            let pData = await hestia._posts('1');
            expect(pData['price']).to.equal(ethers.utils.parseEther('1'));

            await hestia.updatePostPrice('1', ethers.utils.parseEther('1.5'));

            pData = await hestia._posts('1');
            expect(pData['price']).to.equal(ethers.utils.parseEther('1.5'));

        });

        it("Should pay Taxes on Post", async () => {

            let price = ethers.utils.parseEther('1');
            let taxRate = 500; //5%

            await hestia.createPost(
                price,
                (taxRate).toString(),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            let taxAmount = price.mul(taxRate).div(10000);

            await hestia.payTaxes('1', {value:taxAmount});

            let pData = await hestia._posts('1');
            expect(pData['lastTaxCollected']).lt(Date.now()*1000);

        });

        it("Should like a post", async () => {

            let price = ethers.utils.parseEther('1');
            let taxRate = 500; //5%

            await hestia.createPost(
                price,
                (taxRate).toString(),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            await hestia.likePost('1');

            expect(await hestia._postLikedByAddress('1', owner.address)).to.eq(true);

        });

        it("Should like a post via Meta-Txn", async function () {
            const userNonce = await hestia.nonces(owner.address);
            expect(userNonce).to.equal('0');

            const typedMessage = {
                domain:{
                    name: "Hestia",
                    version: "1",
                    chainId : hre.network.config.chainId,
                    verifyingContract: hestia.address
                },
                primaryType: "MetaTransaction",
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" }
                    ],
                    MetaTransaction: [
                        { name: "nonce", type: "uint256" },
                        { name: "from", type: "address" }
                    ]
                },
                message: {
                    nonce: parseInt(userNonce),
                    from: owner.address
                },
            };

            const signature = await hre.network.provider.request({
                method: "eth_signTypedData_v4",
                params: [owner.address, typedMessage],
            });
            const sig = signature.substring(2);
            const r = "0x" + sig.substring(0, 64);
            const s = "0x" + sig.substring(64, 128);
            const v = parseInt(sig.substring(128, 130), 16).toString();

            let price = ethers.utils.parseEther('1');
            let taxRate = 500; //5%

            await hestia.createPostMeta(
                price,
                (taxRate).toString(),
                "This is the Post Title",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws',
                owner.address, r, s, v
            );

            await hestia.likePostMeta('1', owner.address, r, s, v);

            expect(await hestia._postLikedByAddress('1', owner.address)).to.eq(true);
        });
    });

    describe("Creator Tests", accounts => {

        it("Should register a new Creator", async function () {
            await hestiaCreator.registerCreator(
                "Creator1",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            let cData = await hestiaCreator.creators(owner.address);
            expect(cData['active']).to.equal(true);
        });

        it("Should update metadata", async function () {
            await hestiaCreator.registerCreator(
                "Creator1",
                'QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws'
            );

            await hestiaCreator.updateMetaData('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNU2');
        });

    });

});
