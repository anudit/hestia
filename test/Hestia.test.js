const bs58 = require('bs58')
const { expect } = require("chai");

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

    let hestia;
    let owner, alice, bob, addrs;

    beforeEach(async function () {
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        const Hestia = await ethers.getContractFactory("HestiaSuperApp");
        hestia = await Hestia.deploy();

        const HestiaCreator = await ethers.getContractFactory("HestiaCreator");
        hestiaCreator = await HestiaCreator.deploy();
    });


    describe("NFT Tests", accounts => {

        it("Should deploy contract", async function () {
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

        it("Should purchase Post", async () => {
            await hestia.createPost(
                ethers.utils.parseEther('1'),
                ethers.utils.parseEther('0.05'),
                "This is the Post Title",
                getBytes32FromIpfsHash('QmZGvbHuaiUpt7gQqtjQoZL46d2hFrCoZFBDxaCYz8NNUb')
            );

            await hestia.connect(alice).purchasePost('1',{value:ethers.utils.parseEther('1')});

            expect(await hestia._postIds()).to.equal('1');
            expect(await hestia._tokenIds()).to.equal('1');
            expect(await hestia.balanceOf(owner.address)).to.equal('0');
            expect(await hestia.balanceOf(alice.address)).to.equal('1');
            let pData = await hestia._posts('1');
            expect(pData['owner']).to.equal(alice.address);
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