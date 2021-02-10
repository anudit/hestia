async function init(){
    setupUI();
}

async function setupUI() {

    getAllNFTs().then(async (nfts)=>{

        let nftMetaDatas = [];
        for (let index = 0; index < nfts.length; index++) {
            nftMetaDatas.push(fetchNFTMetaData(nfts[index]._metaData));
        }
        const nftMetaDataList = await Promise.all(nftMetaDatas);

        for (let index = 0; index < nfts.length; index++) {
            addSlide(nfts[index], nftMetaDataList[index]);
        }

        let eleC = document.querySelector('.content');
        eleC.innerHTML+=`
        <button class="content__close">
            <svg class="icon icon--longarrow">
                <use xlink:href="#icon-longarrow"></use>
            </svg>
        </button>
        `;
        document.body.classList.remove('loading');
        setupBase();

    });
}

function addSlide(nftData, metaData) {

    console.log(nftData, metaData);

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
                <h4 class="slide__subtitle emp">${metaData.author}</h4>
            </div>
        </div>
    `;

    let eleC = document.querySelector('.content');
    eleC.innerHTML+=`
        <div class="content__item">
            <span class="content__number">#${nftData._postId}</span>
            <h3 class="content__title">${metaData.title}</h3>
            <h4 class="content__subtitle" style="cursor:pointer;">${metaData.author}
                <a href="./gallery.html?creator=${nftData['_creator']}" style="vertical-align: middle; display: inline-block" title="View Artist Gallery">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></svg>
                </a>
            </h4>
            <div class="content__text">${metaData.description}</div>
        </div>
    `;

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

    let promise = new Promise((res, rej) => {
        fetch("https://rpc-mumbai.maticvigil.com/v1/36aed576f085dcef42748c474a02b1c51db45c86", {
        "headers": {
            "content-type": "application/json",
        },
        "body": "{\"method\":\"eth_blockNumber\",\"params\":[],\"id\":43,\"jsonrpc\":\"2.0\"}",
        "method": "POST",
        })
        .then(response => response.json())
        .then(blk => {
            fetch(`https://api.covalenthq.com/v1/80001/events/topics/0x00881029852f701094ba3300d669b657719c1820386ba9cb78d605800aeb4963/?starting-block=${parseInt(blk['result'])-1000000}&key=${covalent_key}&ending-block=${parseInt(blk['result'])}`)
            .then(response => response.json())
            .then(data => {
                let rs = []
                for (let index = 0; index < data.data.items.length; index++) {
                    const element = data.data.items[index];
                    rs.push(
                        Hestia.interface.decodeEventLog('NewPost', element.raw_log_data, element.raw_log_topics )
                    )
                }
                res(rs);
            })
            .catch((error) => {
                rej(error);
            });
        });

    });
    let result = await promise;
    return result;
}


async function getAllNFTs(){
    let promiseArray= [getAllNFTsMatic()];
    const res = await Promise.all(promiseArray);
    return res[0];
}
