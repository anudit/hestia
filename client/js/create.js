let storage;
let fileHash;
async function init(){

  requireLogin();

  storage = IpfsHttpClientLite({apiUrl: 'https://ipfs.infura.io:5001'})

  document.getElementById("new_file").onchange = function () {
    var reader = new FileReader();
    reader.onload = async function (e) {
        console.log("Uploading..");
        let uintBuffer = new Uint8Array(reader.result);
        storage.add(uintBuffer, (err, result) => {
            console.log(err, result);
            if (!err){
                fileHash = result[0].hash;
                sendIPFSPinningRequests(result[0].hash, sanitize(document.querySelector('#new_title').value));
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
}

async function mintDatNft() {

  let price = ethers.utils.parseEther(document.querySelector('#new_price').value);
  let taxRate = (parseFloat(document.querySelector('#new_rate').value)*100).toString(); //5%
  let title = sanitize(document.querySelector('#new_title').value);
  if (fileHash != undefined){
    await HestiaSigned.createPost(price,taxRate,title,fileHash);
  }
}



