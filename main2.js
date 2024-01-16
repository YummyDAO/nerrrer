const { MongoClient } = require("mongodb");
const fetch = require('node-fetch');
const ethers = require('ethers');
require('dotenv').config()   

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
const connectionString = process.env.ATLAS_URI || "mongodb+srv://0xtornado650:Nonunstable10$@cluster0.fmh5a0s.mongodb.net/?retryWrites=true&w=majority";

let TEN_MINUTES = 10 * 60 * 1000;

async function DepositCompleted() {
  const client = new MongoClient(connectionString, { useNewUrlParser: true });
  await client.connect();
  db = client.db("Cluster0");
  let collection = await db.collection("posts");
  let query = { $and: [{ completed: false }, { deposit: true }] };
  let result = await collection.find(query).limit(20)
    .toArray();

  //console.log("connected", result)

  if (result === null) {
    return;
  } else {

    for (let i = 0; i < result.length; i++) {

      if (new Date().valueOf() - new Date(result[i].date).valueOf() > TEN_MINUTES) {
        console.log("writing - skip old transactions")
        let rit = await collection.updateOne({ txid: result[i].txid }, { $set: { completed: true, bridgeamount: 0 } })
        console.log(rit, "rit")
        continue;
      }

      let tik1
      const response = await fetch('https://d20-api2.dogeord.io/balances/' + result[i].multiwallet);
      const data = await response.json();

      for (let i = 0; i < data.balanceData.length; i++) {
        let tik2 = data.balanceData[i].tick
        tik1 = tik2 === result[i].ticker
        console.log("newt", data.balanceData[i].tick)
        console.log("newt1", tik1)

        if (tik1 === true) {
          console.log("writing")
          let rit = await collection.updateOne({ txid: result[i].txid }, { $set: { completed: true, bridgeamount: data.balanceData[i].available } })
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
  let query = { $and: [{ completed: false }, { withdrawal: true }] };
  let result = await collection.find(query).limit(20)
  .toArray();;

  console.log("connected1", result)

  for (let i = 0; i < result.length; i++) {
    if (result === null) {
      return;
    } else {
      let transloader = await provider.getTransaction(result[i].ethtxhash);
      console.log("transloader", transloader)

      if (transloader.confirmations > 5) {
        console.log("with")
        await collection.updateOne({ txid: result[i].txid }, { $set: { completed: true } })
      }
    }
  }

}

WithdrawCompleted()

setTimeout((function () {
  return process.exit(22);
}), 40000);

//pm2 start main.js --restart-delay=10000
//pm2 start main.js --exp-backoff-restart-delay=5000