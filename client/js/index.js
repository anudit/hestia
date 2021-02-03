let Hestia;

window.addEventListener('load', async () => {

    if (Boolean(window.ethereum) == true){

        ethereum.autoRefreshOnNetworkChange = false;

        window.accounts = [];
        const biconomy = new Biconomy(ethereum,{apiKey: "zgMOuSoVm.ee90efe8-31d3-4416-88f0-cae22db150f5"});
        window.web3 = new ethers.providers.Web3Provider(biconomy);

        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        setupContracts(accounts)
    }
    else if (window.web3){

        let accounts = await web3.currentProvider.enable()
        setupContracts(accounts)
    }
    else {
        console.log('Get web3')
    }

});

function setupContracts(accounts){
    Hestia = new ethers.Contract(hestiaAddress, hestiaAbi, web3.getSigner());
    window.accounts = accounts;
    init();
}



async function call(msg ="yolo"){

    let domainData = {
        name: "Quote",
        version: "1",
        chainId : "80001",
        verifyingContract: quoteAddress
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

    const nonce = await Quote.nonces(accounts[0]);

    let message = {};
    message.nonce = parseInt(nonce);
    message.from = accounts[0];

    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    });

    console.log(dataToSign);

    web3.provider.sendAsync(
        {
           jsonrpc: "2.0",
           id: 999999999999,
           method: "eth_signTypedData_v4",
           params: [accounts[0], dataToSign]
        },
        async (err, result)=>{
            if (err) {
                return console.error(err);
            }
            const signature = result.result.substring(2);
            const r = "0x" + signature.substring(0, 64);
            const s = "0x" + signature.substring(64, 128);
            const v = parseInt(signature.substring(128, 130), 16);

            let data = await Quote.setQuoteMeta(accounts[0], msg, r, s, v);
            console.log(data);
        });
}

async function getLatestMaticBlockNumber(){
    let promise = new Promise((res, rej) => {
        fetch("https://rpc-mainnet.maticvigil.com/v1/36aed576f085dcef42748c474a02b1c51db45c86", {
        "headers": {
            "content-type": "application/json",
        },
        "body": "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_blockNumber\",\"params\":[]}",
        "method": "POST",
        })
        .then(response => response.json())
        .then(data => {
            res(data.result);
        })
        .catch((error) => {
            rej(error);
        });
    });
    let result = await promise;
    return result;
}

async function queryGraphQL(query = '') {

    let promise = new Promise((res, rej) => {

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var graphql = JSON.stringify({
        query: query
        })

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
        };

        fetch(graphqlEndpoint, requestOptions)
        .then(response => response.json())
        .then(result => res(result['data']))
        .catch(error => {
        console.log('error', error);
            res({})
        });

    });
    let result = await promise;
    return result;

}

function getBytes32FromIpfsHash(ipfsListing) {
    return "0x" + bs58.decode(ipfsListing).slice(2).toString('hex')
}

function getIpfsHashFromBytes32(bytes32Hex) {
const hashHex = "1220" + bytes32Hex.slice(2)
const hashBytes = buffer.Buffer.from(hashHex, 'hex');
const hashStr = bs58.encode(hashBytes)
return hashStr
}
