let storage;
let fileHash;
let creatorData;
let creatorName;

async function init(){
  storage = IpfsHttpClientLite({apiUrl: 'https://ipfs.infura.io:5001'});

  document.getElementById("new_file").onchange = function () {
    var reader = new FileReader();
    reader.onload = async function (e) {
        console.log("Uploading..");
        document.querySelector('#mintBtn').innerText = 'Uploading Artwork, Please Wait.';
        let uintBuffer = new Uint8Array(reader.result);
        storage.add(uintBuffer, (err, result) => {
            console.log(err, result);
            if (!err){
                fileHash = result[0].hash;
                sendIPFSPinningRequests(result[0].hash, sanitize(document.querySelector('#new_title').value));
                document.querySelector('#mintBtn').innerText = 'Mint it!';
            }
            else{
                console.log(err);
            }
        })
    }
    if (this.files.length>0){
      reader.readAsArrayBuffer(this.files[0]);
    }
    else{
      fileHash = undefined;
    }
  };

  function myFunction(x) {
      if (x.matches) {
        document.querySelector('.fs-continue.fs-show').innerText = '';
      } else {
        document.querySelector('.fs-continue.fs-show').innerText = 'Continue';
      }
  }
  var x = window.matchMedia("(max-width: 52.5em)");
  myFunction(x);
  x.addListener(myFunction);

  await requireLogin();

  creatorData = await HestiaCreatorSigned.queryFilter(
    HestiaCreator.filters.NewCreator(accounts[0]), 10201096, 99999999
  );

  if (creatorData.length < 1){
    window.location.href = './register.html';
  }
  else {
    let decoded = HestiaCreatorSigned.interface.decodeEventLog('NewCreator', creatorData[0].data, creatorData[0].topics);
    creatorName = decoded.creatorNameString;
  }

}

async function mintDatNft() {

  let price = ethers.utils.parseEther(document.querySelector('#new_price').value);
  let taxRate = (parseFloat(document.querySelector('#new_rate').value)*100).toString();
  let title = sanitize(document.querySelector('#new_title').value);

  if (fileHash != undefined){
    var enc = new TextEncoder();
    const uint8Buffer = enc.encode(JSON.stringify(
        {
            "author":creatorName,
            "title": sanitize(document.querySelector('#new_title').value),
            "description":sanitize(document.querySelector('#new_desc').value)
        }
    ));
    storage.add(uint8Buffer, async (err, result) => {
        console.log(err, result);
        if (!err){
            fileHash = result[0].hash;
            sendIPFSPinningRequests(result[0].hash);
            await HestiaSigned.createPost(price,taxRate,title,result[0].hash);
        }
        else{
            console.log(err);
        }
    })

  }



}



