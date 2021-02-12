let storage;

async function init(){
    storage = IpfsHttpClientLite({apiUrl: 'https://ipfs.infura.io:5001'});

    await requireLogin();

    let creatorData = await HestiaCreatorSigned.queryFilter(
        HestiaCreator.filters.NewCreator(accounts[0]),
        parseInt(block_numbers[customWeb3._network.chainId]['HestiaSuperApp']),
        'latest'
    );

    if (creatorData.length >= 1){
        window.location.href = './create.html';
    }
}

async function registerCreator(){
    var enc = new TextEncoder();
    const uint8Buffer = enc.encode(JSON.stringify(
        {
            "fullname":sanitize(document.querySelector('#new_name').value),
            "about":sanitize(document.querySelector('#new_about').value)
        }
    ));
    storage.add(uint8Buffer, async(err, result) => {
        console.log(err, result);
        if (!err){
            fileHash = result[0].hash;
            sendIPFSPinningRequests(result[0].hash);
            await HestiaCreatorSigned.registerCreator(
                sanitize(document.querySelector('#new_name').value),
                result[0].hash
            );
        }
        else{
            console.log(err);
        }
    })

}
