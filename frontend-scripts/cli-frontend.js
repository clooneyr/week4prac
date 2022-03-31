const algosdk = require('algosdk');
const counterSource = require('./counter-teal');
const clearSource = require('./clear-teal');

async function compileProgram(client, programSource) {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await client.compile(programBytes).do();
    let compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
    return compiledBytes;
}

function EncodeBytes(utf8String) {
    let enc = new TextEncoder()
    return enc.encode(utf8String)
}

async function frontEnd() {

    try {
 

        const algosdk = require('algosdk');
		const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
		const port = '';
		const token = {'X-API-Key': 'ERJa19DtyE462CXdcoREb3mt9RQGEeM22i5CKXhz'}
		

		const algodClient = new algosdk.Algodv2(token, baseServer, port);
		let params = await algodClient.getTransactionParams().do();

        const senderSeed = "garage bright wisdom old fan mesh pull acquire clever pear era flight horror memory nerve ten hospital scorpion cricket erosion leader better hockey ability throw";
        let senderAccount = algosdk.mnemonicToSecretKey(senderSeed);
        let sender = senderAccount.addr;
        console.log(sender);

       	let counterProgram = await compileProgram(algodClient, counterSource);
        let clearProgram = await compileProgram(algodClient, clearSource);
        let onComplete = algosdk.OnApplicationComplete.NoOpOC;


        let localInts = 0;
		let localBytes = 0;
		let globalInts = 10;
		let globalBytes = 10;

		let accounts = undefined;
        let foreignApps = undefined;
        let foreignAssets = undefined;
        let appArgs = undefined;
        let appID = 81247215

        // let appArgs = [];
        // appArgs.push(EncodeBytes('add'));


        let deployContract = algosdk.makeApplicationCreateTxn(sender,params,onComplete,counterProgram,clearProgram,localInts,localBytes,globalInts,globalBytes,appArgs,accounts,foreignApps,foreignAssets);
        //let callContract = algosdk.makeApplicationNoOpTxn(sender, params, appID, appArgs, undefined, undefined, undefined);
     	let signedTxn = deployContract.signTxn(senderAccount.sk);
     	//let signedTxn = callContract.signTxn(senderAccount.sk);
   		//81247470
	   
        // Submit the transaction
        let tx = (await algodClient.sendRawTransaction(signedTxn).do());

        let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
        let transactionResponse = await algodClient.pendingTransactionInformation(tx.txId).do();
        let appId = transactionResponse['application-index'];

        //Get the completed Transaction
        console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
        console.log("The application ID is: " + appId)
 
    }
    catch (err) {
        console.log("err", err);
    }
    process.exit();
};

frontEnd();
