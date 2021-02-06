let storage;

async function init(){
    requireLogin();
    storage = IpfsHttpClientLite({apiUrl: 'https://ipfs.infura.io:5001'});
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
                getBytes32FromIpfsHash(result[0].hash)
            );
        }
        else{
            console.log(err);
        }
    })

}
