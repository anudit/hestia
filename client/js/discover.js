async function init(){
    await setupUI();
}

async function setupUI() {

    getAllNFTs().then(async (nfts)=>{

        for (let index = 0; index < nfts.length; index++) {
            await addSlide(nfts[index]);
        }

    }).then(()=>{
        let eleC = document.querySelector('.content');
        eleC.innerHTML+=`
        <button class="content__close">
            <svg class="icon icon--longarrow">
                <use xlink:href="#icon-longarrow"></use>
            </svg>
        </button>
        `;
        setupBase();
    });
}

async function addSlide(nftData) {

    let metaData = await fetchNFTMetaData(getIpfsHashFromBytes32(nftData._metaData));
    console.log(`adding ${metaData.title}`);

    let ele = document.querySelector('.slideshow');
    ele.innerHTML+= `
    <div class="slide">
            <div class="slide__img-wrap">
                <div class="slide__img" style="background-image: url(https://gateway.pinata.cloud/ipfs/${nftData._postData});"></div>
            </div>
            <div class="slide__side">0x00..00</div>
            <div class="slide__title-wrap">
                <span class="slide__number">6</span>
                <h3 class="slide__title">${metaData.title}</h3>
                <h4 class="slide__subtitle">${metaData.author}</h4>
            </div>
        </div>
    `;

    let eleC = document.querySelector('.content');
    eleC.innerHTML+=`
        <div class="content__item">
            <span class="content__number">#1</span>
            <h3 class="content__title">${metaData.title}</h3>
            <h4 class="content__subtitle">${metaData.author}</h4>
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
        getLatestMaticBlockNumber().then((blk)=>{
            fetch(`https://api.covalenthq.com/v1/80001/events/topics/0x67cdd88cece6fe7f33bb60f6b6113642d5860f0507d575786cc51767008c5213/?starting-block=${hestiaBlock}&key=${covalent_key}&ending-block=${parseInt(blk)}`)
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
        })

    });
    let result = await promise;
    return result;
}


async function getAllNFTs(){
    let promiseArray= [getAllNFTsMatic()];
    const res = await Promise.all(promiseArray);
    return res[0];
}
