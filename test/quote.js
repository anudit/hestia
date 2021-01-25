const { expect } = require("chai");
const { network } = require("hardhat");

async function getDataToSign(quoteContract, accountAddress, msg ="yolo"){

    let domainData = {
        name: "Quote",
        version: "1",
        chainId : "80001",
        verifyingContract: quoteContract.address
    };

    const metaTransactionType = [
        { name: "nonce", type: "uint256" },
        { name: "from", type: "address" }
    ];

    const domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
    ];

    const nonce = await quoteContract.nonces(accountAddress);

    let message = {
        "nonce": parseInt(nonce),
        "from": accountAddress
    };

    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    });

    return dataToSign;

}

describe("Quote", accounts => {

    let quote;
    let owner, addr1, addr2, addrs;

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const Quote = await ethers.getContractFactory("Quote");
        quote = await Quote.deploy();

    });


    describe("Quote Meta transaction", accounts => {

        it("Should deploy contract", async function () {
            expect(true).to.equal(true);
        });

        it("Should set quote via meta-txn", async () => {

            let quoteToSet = "New Quote";

            let dataToSign = await getDataToSign(
                quote,
                owner.getAddress(),
                quoteToSet
            );

            let signature = await owner.signTypedData(
                dataToSign.domain,
                dataToSign.types,
                dataToSign.message
            )
            // let result = await network.provider.request(
            //     {
            //        jsonrpc: "2.0",
            //        id: 999999999999,
            //        method: "eth_signTypedData_v4",
            //        params: [owner.getAddress(), dataToSign]
            //     });

            // const signature = result.result.substring(2);
            const r = "0x" + signature.substring(0, 64);
            const s = "0x" + signature.substring(64, 128);
            const v = parseInt(signature.substring(128, 130), 16);

            await quote.setQuoteMeta(owner.getAddress(), quoteToSet, r, s, v);
            expect(await quote.quote()).to.equal(quoteToSet);
            expect(true).to.equal(false);

            // await saarthi.togglePause();
            // expect(await saarthi.paused()).to.equal(true);
        });

    });

});

