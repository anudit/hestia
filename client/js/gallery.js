async function init(){

    if (getParameterByName('creator') != undefined && ethers.utils.isAddress(getParameterByName('creator'))){
        setupUI(getParameterByName('creator'));
    }
    else {
        document.body.classList.remove('loading');
        requireLogin().then(()=>{
            document.body.classList.add('loading');
            setupUI(accounts[0]);
        });
    }

}

async function setupUI(creatorAddress){

    console.log('Fectching Data for : ', creatorAddress);

    const filter = {
        address: contract_addresses[netId.toString()]['HestiaSuperApp'],
        fromBlock : parseInt(block_numbers[customWeb3._network.chainId]['HestiaSuperApp']),
        topics: [
            ethers.utils.id("NewPost(uint256,address,uint256,string,string)"),
            null,
            "0x000000000000000000000000" + creatorAddress.slice(2)
        ]
    }
    const filter2 = {
        address: contract_addresses[netId.toString()]['HestiaCreator'],
        fromBlock : parseInt(block_numbers[customWeb3._network.chainId]['HestiaCreator']),
        topics: [
            ethers.utils.id("NewCreator(address,string,string,string)"),
            "0x000000000000000000000000" + creatorAddress.slice(2)
        ]
    }

    let promiseArray= [customWeb3.getLogs(filter), customWeb3.getLogs(filter2)];
    const res = await Promise.all(promiseArray);


    let rs = []
    for (let index = 0; index < res[0].length; index++) {
        const element = res[0][index];
        rs.push(
            Hestia.interface.decodeEventLog('NewPost', element.data, element.topics )
        )
    }

    if (res[1].length == 0){
        window.location.href= "./create.html";
    }
    let parsedCreator =  HestiaCreator.interface.decodeEventLog('NewCreator', res[1][0].data, res[1][0].topics );
    document.querySelector('#creatorName').innerText = parsedCreator.creatorNameString;
    document.querySelector('#creatorAddress').innerText = trimAdd(creatorAddress);
    document.querySelector('#creatorAddress').setAttribute('href', `${chainExplorers[customWeb3._network.chainId]}/address/${creatorAddress}`);


    let promiseArray2 = [];
    for (let index = 0; index < rs.length; index++) {
        promiseArray2.push(fetchIpfsData(rs[index]._metaData));
    }
    const postsMetadata = await Promise.all(promiseArray2);

    const gallery = document.querySelector('.fold-content');
    for (let index = 0; index < postsMetadata.length; index++) {
        let metaData = postsMetadata[index];
        gallery.innerHTML+=`
                <img class="content__img" src="https://gateway.pinata.cloud/ipfs/${rs[index]._postData}" alt="Some image" />
                <h3 class="content__title">${metaData['title']}</h3>
        `;
    }
    setup()
    document.body.classList.remove('loading');
}


async function fetchIpfsData(ipfshash) {
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
