const express = require('express');
const router = express.Router();
const cors = require('cors');
const app = express();
const ethers = require('ethers');
const Web3 = require('web3');
// const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const provider = 'https://bsc-dataseed.binance.org/';
const Web3Client = new Web3(provider);
const getweb3Instance = () => {
    let web3 = new Web3(new Web3.providers.HttpProvider(provider));
    return web3;
};
const chainId = 56; //56 for main net

const contractAddress = "0x65901360C8ab1EED4cCBBF8ef73d72f9d8814255";


// const contractAddress = '0x1bc0C9199e0B7476447bA97c34f0FCd21aC8D6C8';
// const senderWalletAddress = '0xbf099d8d130d4fdb46ffbe00c7b30ff7a579645d';
// const senderWalletAddress = '0xbf099d8d130d4fdb46ffbe00c7b30ff7a579645d';

const senderWalletAddress = '0x18b2a07cb73ab3510300f4038e7019d6a2e04d6c';


// const senderPrivateKey = '0x979ddb047c39ec600f509c5b6560d5e33bb998a4d9049998abbe0df2868c20f8';
const senderPrivateKey = "63a1c750c1c27efffee855913bc904396256e3365ecb01de05d96e5e23df01fc";
require('dotenv').config({
    path: './config/config.env'
})
const contractAbi = [
	 {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_minimumAmount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "reciever",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Withdraw",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "minimumAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

app.use(express.json());

// Dev Logginf Middleware
const corsOptions = {
    exposedHeaders: ['Authorization', 'New-Token'],
};

app.use(cors(corsOptions));
app.use('/api', router.post("/withdraw_token", async (req, res) => {

    console.log("Body Heree");
    console.log(req.body);
    
    const { userWalletAddress, amount } = req.body;
    
    
    if (userWalletAddress, amount) {
        if (Number(amount) < 0) {
            return res.status(400).json({ error: 'Amount should me greater then 0' });
        } else {
            try {
                const web3 = await getweb3Instance();
                let contract = new web3.eth.Contract(contractAbi, contractAddress);
                const data = contract.methods.withdraw(senderWalletAddress, userWalletAddress, amount).encodeABI();
                // Determine the nonce
                const count = await Web3Client.eth.getTransactionCount(senderWalletAddress)
                // How many tokens do I have before sending?
                const nonce = Web3Client.utils.toHex(count);

                var gaseLimitForTransaction = await Web3Client.eth.estimateGas({
                    "from": senderWalletAddress,
                    "to": contractAddress,
                    "data": data
                });
                console.log("🚀 ~ file: server.js ~ line 132 ~ app.use ~ gaseLimitForTransaction", gaseLimitForTransaction)
                const gasLimit = Web3Client.utils.toHex(gaseLimitForTransaction);
                let gasPrice = Web3Client.utils.toHex(10 * 1e9);
                const value = Web3Client.utils.toHex(Web3Client.utils.toWei('0', 'wei'));

                var rawTransaction = {
                    "from": senderWalletAddress,
                    "nonce": nonce,
                    "gasPrice": gasPrice,
                    "gasLimit": gasLimit,
                    "to": contractAddress,
                    "value": value,
                    "data": data,
                    "chainId": chainId
                };
                console.log("🚀 ~ file: server.js ~ line 146 ~ app.use ~ rawTransaction", rawTransaction)

                const signedTx = await Web3Client.eth.accounts.signTransaction(rawTransaction, senderPrivateKey);
                const sentTx = await Web3Client.eth.sendSignedTransaction(signedTx.rawTransaction);
                return res.status(200).json(sentTx);
            } catch (error) {
                console.log("🚀 ~ file: server.js ~ line 151 ~ app.use ~ error", error)
                return res.status(400).json({ error: error.message });
            }

        }
    } else {
        return res.status(400).json({ error: 'require all fields' });
    }

}))



app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: "Page not founded"
    })
})
const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
