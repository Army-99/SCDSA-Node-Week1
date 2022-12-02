const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "04cc2aef1455700f3ae7e397c4915b102fc464566f1d47cd40ae76799071e99a22a0bce59ca07688b2bd52f662ae0c674bfbe0706a72c40282b682ad9dfe50148c": 100,
  "04a12796151db99a49b66fe8a54ca2398af5210066919595762af7979188be6431b9772a4616c7115232dcd1d8b7e9a99ee1fa661679ff77c3f220ea42ddc2dc6d": 50,
  "04cb3d61d43b3708e11012ea48f2d605133950fc762e8b5744c6a1afb3546bdd16e2d7043b35bd7259ac52a410019cc35a6746d64c5d0eee4e68a01c497aa7f043": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  //TODO: get a signature from the client and recover the public key 
  const { signature, recoveryBit, hashTransaction, recipient, amount } = req.body;
  const publickKey = await recoverPublicKey(hashTransaction, Uint8Array.from(Object.values(signature)), Number(recoveryBit))
  console.log(`Returned public Key: ${toHex(publickKey)}`)
  sender = toHex(publickKey)
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

const recoverPublicKey = async (hashTransaction, signature, recoveryBit) => {
  return await secp.recoverPublicKey(hashTransaction, signature, recoveryBit)
}

