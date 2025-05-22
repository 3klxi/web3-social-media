const contractService = require('./contractServices');


async function f(){
    const res = await contractService.addTweet("hello world", "img.jpg");
    console.log(res);
}


f();