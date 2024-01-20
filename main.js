const { MongoClient } = require("mongodb");
const fetch = require('node-fetch');
const ethers = require('ethers');
require('dotenv').config()   

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
const connectionString = process.env.ATLAS_URI || "mongodb+srv://0xtornado650:Nonunstable10$@cluster0.fmh5a0s.mongodb.net/?retryWrites=true&w=majority";

let TEN_MINUTES = 180 * 60 * 1000;

async function DepositCompleted() {
    const client = new MongoClient(connectionString, { useNewUrlParser: true });
    await client.connect();
    db = client.db("Cluster0");
    let collection = await db.collection("posts");
    let query = {$and: [{completed: false}, {deposit: true}, {isclosed: false}]};
    let result = await collection.find(query).limit(50)
    .toArray();

    if(result.length == 0){
        return;
    } else {

	for (let i = 0; i < result.length; i++){

		/*if (new Date().valueOf() - new Date(result[i].date).valueOf() > TEN_MINUTES) {
			console.log("writing - skip old transactions")
			let rit = await collection.updateOne({ txid: result[i].txid }, { $set: { isclosed: true } })
			console.log(rit, "rit")
			continue;
		  }*/

		  console.log("connected", result[i])

		let tik1
		const response = await fetch('https://d20-api2.dogeord.io/balances/' + result[i].multiwallet);
		const data = await response.json();

		for (let i = 0; i < data.balanceData.length; i++){
			let tik2 = data.balanceData[i].tick
			tik1 = tik2 === result[i].ticker
			console.log("newt", data.balanceData[i].tick )
			console.log("newt1", tik1)

			if(tik1 === true){
				console.log("writing", result[i].multiwallet)
				let rit =await collection.updateOne({txid:result[i].txid}, {$set: { completed: true, isverified: true, bridgeamount: data.balanceData[i].available}})
				console.log(rit, "rit")
				break;
			}
		}
    }
}

  }

  DepositCompleted()

  async function WithdrawCompleted() {
    const client = new MongoClient(connectionString, { useNewUrlParser: true });
    await client.connect();
    db = client.db("Cluster0");
    let collection = await db.collection("posts");
    let query = {$and: [{completed: false}, {withdrawal: true}]};
    let result = await collection.find(query).limit(50)
    .toArray();

    console.log("connected1", result)

	for (let i = 0; i < result.length; i++){
    if(result.length == 0){
        return;
    } else {
    let transloader = await provider.getTransaction(result[i].ethtxhash);
    console.log("transloader", transloader)

    if(transloader.confirmations > 5){
        console.log("with")
        await collection.updateOne({txid:result[i].txid},{$set: { completed: true }})
    }
   }
}

  }

  //WithdrawCompleted() 

  async function Minter() {
    const client = new MongoClient(connectionString, { useNewUrlParser: true });
    await client.connect();
    db = client.db("Cluster0");
    let collection = await db.collection("posts");
    let query = {$and: [{completed: true}, {deposit: true}, {bridged: false}, {isclosed: false}, {isverified: true}]};
    let result = await collection.find(query).limit(50)
    .toArray();

    //console.log("connected2", result)
	let zero = "0xe93C5aF8AF0714cD61f978986bfE0AE2C576f051"
	let zero1 = "0x0000000000000000000000000000000000000000"

    const factoryABI =  [
		{
			"inputs": [
				{
					"internalType": "address[]",
					"name": "_signers",
					"type": "address[]"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "sender",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "dog20",
					"type": "address"
				}
			],
			"name": "BRC20Created",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "token",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "from",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "fee",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "receiver",
					"type": "string"
				}
			],
			"name": "Burned",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "oldFee",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "newFee",
					"type": "uint256"
				}
			],
			"name": "FeeChanged",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "token",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "txid",
					"type": "string"
				}
			],
			"name": "Minted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "oldOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnerChanged",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "sender",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "SignerAdded",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "sender",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "SignerRemoved",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "DOMAIN_SEPARATOR",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "DOMAIN_TYPEHASH",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MINT_TYPEHASH",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "addSigner",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "authorized",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "token",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "txid",
					"type": "string"
				}
			],
			"name": "buildMintSeparator",
			"outputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "token",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "receiver",
					"type": "string"
				}
			],
			"name": "burn",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "name",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				},
				{
					"internalType": "uint8",
					"name": "decimals",
					"type": "uint8"
				}
			],
			"name": "createBRC20",
			"outputs": [
				{
					"internalType": "address",
					"name": "brc20",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "fee",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "indexes",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "token",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "txid",
					"type": "string"
				},
				{
					"internalType": "uint8[]",
					"name": "v",
					"type": "uint8[]"
				},
				{
					"internalType": "bytes32[]",
					"name": "r",
					"type": "bytes32[]"
				},
				{
					"internalType": "bytes32[]",
					"name": "s",
					"type": "bytes32[]"
				}
			],
			"name": "mint",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "parameters",
			"outputs": [
				{
					"internalType": "string",
					"name": "name",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "symbol",
					"type": "string"
				},
				{
					"internalType": "uint8",
					"name": "decimals",
					"type": "uint8"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "removeSigner",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_fee",
					"type": "uint256"
				}
			],
			"name": "setFee",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_owner",
					"type": "address"
				}
			],
			"name": "setOwner",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "signers",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "",
					"type": "bytes32"
				}
			],
			"name": "used",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				}
			],
			"name": "withdraw",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]

	for (let i = 0; i < result.length; i++){

		console.log("connected2", result[i])

    if(result.length == 0){
        return;
    } else {
		//let rit = await collection.updateOne({ txid: result[i].txid }, { $set: { isclosed: true } })
		//console.log(rit, "rit")
    //let wallet = zero;/*result[i].recipentwallet ? result[i].recipentwallet : zero*/
	let wallet = result[i].recipentwallet ? result[i].recipentwallet : zero1
	//let amount1 = "5000000000000"
    //let amount =  ethers.utils.parseEther("5000000000000"); /*result[i].bridgeamount*/
	let amount =  ethers.utils.parseEther(result[i].bridgeamount); /*result[i].bridgeamount*/
    let pKey = process.env.PVKEY
    const signer = new ethers.Wallet(pKey, provider);
    const factory = "0x9949229Bd0C3A11d78F052f22aea9D8484C02e19" 
    const factoryContract = new ethers.Contract(factory, factoryABI, signer);
    const chainId = (await provider.getNetwork()).chainId;

	//console.log(factoryContract, "factoryContravt")
	console.log(pKey, "pKey")
	console.log(amount, "amount")


    const domain = {
        name: "DualBit",
        version: "1",
        chainId: chainId,
        verifyingContract: factory
      };

      let token1 = "0x2C7f17840B0C6172CEaf0928BC1070ac42a27E24"
      let txid1= result[i].txid

      const types = {
        Mint: [{
            name: "token",
            type: "address"
          },
          {
            name: "to",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          },
          {
            name: "txid",
            type: "string"
          },
        ],
      };
    
      // set the Permit type values
      const values = {
        token: token1,
        to: wallet,
        amount: amount,
        txid: txid1
      };

      const signature = await signer._signTypedData(domain, types, values);

      const sig = ethers.utils.splitSignature(signature);
      const recovered = ethers.utils.verifyTypedData(
        domain,
        types,
        values,
        sig
      );

      console.log(sig.v, "sig")
      console.log(sig.r, "sig")
      console.log(sig.s, "sig")

    const tx1 = await factoryContract.mint(token1, wallet, amount, txid1, [sig.v], [sig.r], [sig.s]);
    let receipt = await tx1.wait()

    console.log(receipt, "reciept")

    let tim = await collection.updateOne({txid:result[i].txid},{$set: { bridged: true }})

    console.log(tim.acknowledged, "acknowledged")
      }

	}


  }

  Minter()


  setTimeout((function() {
    return process.exit(22);
}), 40000);

//pm2 start main.js --restart-delay=10000
//pm2 start main.js --exp-backoff-restart-delay=5000