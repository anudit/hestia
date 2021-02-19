async function init(){
    setupUI();
}

async function setupUI() {

    getAllNFTs().then(async (nfts)=>{
        let maticNfts = nfts[0];

        let nftMetaDatas = [];
        for (let index = 0; index < maticNfts.length; index++) {
            nftMetaDatas.push(fetchNFTMetaData(maticNfts[index]._metaData));
        }
        let nftMetaDataList = await Promise.all(nftMetaDatas);

        for (let index = 0; index < maticNfts.length; index++) {
            addSlide(maticNfts[index], nftMetaDataList[index], 'Matic Network');
        }

        let bscNfts = nfts[1];

        nftMetaDatas = [];
        for (let index = 0; index < bscNfts.length; index++) {
            nftMetaDatas.push(fetchNFTMetaData(bscNfts[index]._metaData));
        }

        nftMetaDataList = await Promise.all(nftMetaDatas);
        console.log(nftMetaDataList);
        for (let index = 0; index < bscNfts.length; index++) {
            addSlide(bscNfts[index], nftMetaDataList[index], 'Binance Smart Chain');
        }

        let eleC = document.querySelector('.content');
        eleC.innerHTML+=`
        <button class="content__close">
            <svg class="icon icon--longarrow">
                <use xlink:href="#icon-longarrow"></use>
            </svg>
        </button>
        `;

        setupBase();
        document.body.classList.remove('loading');

    });
}

function addSlide(nftData, metaData, network) {

    let ele = document.querySelector('.slideshow');
    ele.innerHTML+= `
    <div class="slide">
            <div class="slide__img-wrap">
                <div class="slide__img" style="background-image: url(https://gateway.pinata.cloud/ipfs/${nftData._postData});" id="load-${nftData._postData}"></div>
            </div>
            <div class="slide__side" onclick="openInExplorer('${nftData[1]}')">Owned by : ${trimAdd(nftData[1])}</div>
            <div class="slide__title-wrap">
                <span class="slide__number">#${nftData._postId}</span>
                <h3 class="slide__title">${metaData.title}</h3>
                <h4 class="slide__subtitle emp">${metaData.author} // ${network}</h4>
            </div>
        </div>
    `;

    let eleC = document.querySelector('.content');
    eleC.innerHTML+=`
        <div class="content__item">
            <span class="content__number">#${nftData._postId}</span>
            <h3 class="content__title">${metaData.title}</h3>
            <div class="content__subtitle" style="cursor:pointer;" >
                <h1 style="margin:2px" onclick="window.location.href = './gallery.html?creator=${nftData['_creator']}&chain=matic'" title="View Artist Gallery">
                    ${metaData.author}
                    <a style="vertical-align: baseline; display: inline-block">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg>
                    </a>
                </h1>
                <br/>
                <button class="content__buy" onclick="buy(${nftData._postId.toString()}, ${nftData['_price'].toString()})">Buy for ${ethers.utils.formatEther(nftData['_price'])} ETH</button>
                <button class="content__buy" id='like-${nftData._postId}' onclick="like(${nftData._postId.toString()})">0 Likes</button>
            </div>
            <div class="content__text">${metaData.description}</div>
        </div>
    `;
    setupLikes(nftData._postId);
}

async function fetchNFTMetaData(ipfshash) {
    let promise = new Promise((res, rej) => {
        fetch(`https://gateway.pinata.cloud/ipfs/${ipfshash}`)
        .then(response => response.text())
        .then(raw => {
            res(JSON.parse(raw));
        })
        .catch((error) => {
            rej(error);
        });

    });
    let result = await promise;
    return result;
}

async function getAllNFTsMatic(){

    let promise = new Promise(async (res, rej) => {
        // fetch("https://rpc-mumbai.maticvigil.com/v1/36aed576f085dcef42748c474a02b1c51db45c86", {
        // "headers": {
        //     "content-type": "application/json",
        // },
        // "body": "{\"method\":\"eth_blockNumber\",\"params\":[],\"id\":43,\"jsonrpc\":\"2.0\"}",
        // "method": "POST",
        // })
        // .then(response => response.json())
        // .then(blk => {
        //     fetch(`https://api.covalenthq.com/v1/80001/events/topics/0x00881029852f701094ba3300d669b657719c1820386ba9cb78d605800aeb4963/?starting-block=${parseInt(blk['result'])-1000000}&key=${covalent_key}&ending-block=${parseInt(blk['result'])}`)
        //     .then(response => response.json())
        //     .then(data => {
        //         let rs = []
        //         for (let index = 0; index < data.data.items.length; index++) {
        //             const element = data.data.items[index];
        //             rs.push(
        //                 Hestia.interface.decodeEventLog('NewPost', element.raw_log_data, element.raw_log_topics )
        //             )
        //         }
        //         res(rs);
        //     })
        //     .catch((error) => {
        //         rej(error);
        //     });
        // });

        const filter = {
            address: contract_addresses['80001']['HestiaSuperApp'],
            fromBlock : parseInt(block_numbers['80001']['HestiaSuperApp']),
            topics: [
                ethers.utils.id("NewPost(uint256,address,uint256,string,string)"),
                null,
                "0x000000000000000000000000" + "0x707aC3937A9B31C225D8C240F5917Be97cab9F20".slice(2)
            ]
        }

        let data = await customWeb3.getLogs(filter);
        let rs = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            rs.push(
                Hestia.interface.decodeEventLog('NewPost', element.data, element.topics )
            )
        }
        res(rs);


    });
    let result = await promise;
    return result;
}

async function getAllNFTsBsc(){

    let promise = new Promise((res, rej) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "method": "eth_getLogs",
            "params": [
                {
                    "topics": [
                        [
                            "0x00881029852f701094ba3300d669b657719c1820386ba9cb78d605800aeb4963", // NewPost
                        ]
                    ],
                    "fromBlock": block_numbers['97']['HestiaSuperApp'],
                    "toBlock": "latest",
                    "address": contract_addresses['97']['HestiaSuperApp']
                }
            ],
            "id": 1,
            "jsonrpc": "2.0"
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch("https://data-seed-prebsc-1-s3.binance.org:8545/", requestOptions)
        .then(response => response.json())
        .then(result => {
            let rs = []
            for (let index = 0; index < result['result'].length; index++) {
                const log = result['result'][index];
                rs.push(
                    Hestia.interface.decodeEventLog('NewPost', log.data, log.topics )
                )
            }
            res(rs);
        })
        .catch((error) => {
            rej(error);
        });
    });

    let result = await promise;
    return result;
}

async function getAllNFTs(){
    let promiseArray= [getAllNFTsMatic(),getAllNFTsBsc()];
    const res = await Promise.all(promiseArray);
    return res;
}

async function setupLikes(_postId){
    let likes = await Hestia.queryFilter(
        Hestia.filters.PostLiked(parseInt(_postId)),
        parseInt(block_numbers[customWeb3.network.chainId]['HestiaSuperApp']),
        'latest'
    );
    document.querySelector(`#like-${_postId}`).innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style=" position: relative; padding-top: 4px; "><path d="M6.28 3c3.236.001 4.973 3.491 5.72 5.031.75-1.547 2.469-5.021 5.726-5.021 2.058 0 4.274 1.309 4.274 4.182 0 3.442-4.744 7.851-10 13-5.258-5.151-10-9.559-10-13 0-2.676 1.965-4.193 4.28-4.192zm.001-2c-3.183 0-6.281 2.187-6.281 6.192 0 4.661 5.57 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-4.011-3.097-6.182-6.274-6.182-2.204 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248z"/></svg>
        ${likes.length} Likes
    `;
}

async function buy(_postId, _price){
    await requireLogin();

    let price = new ethers.BigNumber.from(_price.toString());
    let taxRate = 500; //5%
    let taxAmount = price.mul(taxRate).div(10000);
    let totalCost = price.add(taxAmount);

    await HestiaSigned.purchasePost(
        '1',ethers.utils.formatBytes32String('ETH'),
        {value:totalCost}
    );
}

async function like(_postId){
    await requireLogin();

    let domainData = {
        name: "Hestia",
        version: "1",
        chainId : "80001",
        verifyingContract: contract_addresses[customWeb3.network.chainId]['HestiaSuperApp']
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

    const nonce = await HestiaSigned.nonces(accounts[0]);

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

    provider.sendAsync(
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

            let data = await HestiaSigned.likePostMeta(_postId, accounts[0], r, s, v);
            document.querySelector(`#like-${_postId}`).innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style=" position: relative; padding-top: 4px; "><path d="M6.28 3c3.236.001 4.973 3.491 5.72 5.031.75-1.547 2.469-5.021 5.726-5.021 2.058 0 4.274 1.309 4.274 4.182 0 3.442-4.744 7.851-10 13-5.258-5.151-10-9.559-10-13 0-2.676 1.965-4.193 4.28-4.192zm.001-2c-3.183 0-6.281 2.187-6.281 6.192 0 4.661 5.57 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-4.011-3.097-6.182-6.274-6.182-2.204 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248z"/></svg>
                ${parseInt(document.querySelector(`#like-${_postId}`).innerText.replace('Likes', ''))+1} Likes
            `;
        }
    );
}
