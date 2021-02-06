async function init(){

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
}

async function mintThatNft() {

    let price = ethers.utils.parseEther('1');
    let taxRate = 500; //5%

    await HestiaSigned.createPost(
        price,
        (taxRate).toString(),
        "This is the Post Title",
        getBytes32FromIpfsHash('QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws')
    );
}

