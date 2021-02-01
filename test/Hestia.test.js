const bs58 = require('bs58')
const { expect } = require("chai");
const hre = require("hardhat");

function getBytes32FromIpfsHash(ipfsListing) {
  return "0x" + bs58.decode(ipfsListing).slice(2).toString('hex')
}

function getIpfsHashFromBytes32(bytes32Hex) {
  const hashHex = "1220" + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

describe("Hestia", accounts => {

    let hestia, hestiaCreator, dai;
    let owner, alice, bob, addrs;

    beforeEach(async function () {
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        const Hestia = await ethers.getContractFactory("HestiaSuperApp");
        hestia = await Hestia.deploy();

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
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
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
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
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
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
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
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
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
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
            );

            let taxAmount = price.mul(taxRate).div(10000);

            await hestia.payTaxes(
                '1',"0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
                {value:taxAmount}
            );

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
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
            );

            await hestia.likePost('1');

            expect(await hestia._postLikedByAddress('1', owner.address)).to.eq(true);

        });
    });

    describe("Creator Tests", accounts => {

        it("Should register a new Creator", async function () {
            await hestiaCreator.registerCreator(
                "Creator1",
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
            );

            expect(await hestiaCreator.creatorIDs()).to.equal('1');
        });

        it("Should update metadata", async function () {
            await hestiaCreator.registerCreator(
                "Creator1",
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
            );


            let cData = await hestiaCreator.creators('1');
            expect(cData['metaData']).to.equal(getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb'));

            await hestiaCreator.updateMetaData(
                "1",
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNU2')
            );

            let cData2 = await hestiaCreator.creators('1');
            expect(cData2['metaData']).to.equal(getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNU2'));
        });

    });

});
