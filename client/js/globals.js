let hestiaAddress = "0x2158f0C150e9DCe5263BCb74Aa257F52D02cbdE2";
let hestiaBlock = "10106770";
let covalent_key = "ckey_4f1b1d6c4659448faf00c83e597";
let graphqlEndpoint = "https://graphql.bitquery.io";
let hestiaAbi = [
	{
	  "inputs": [],
	  "stateMutability": "nonpayable",
	  "type": "constructor"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "approved",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "Approval",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "bool",
		  "name": "approved",
		  "type": "bool"
		}
	  ],
	  "name": "ApprovalForAll",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "bytes32",
		  "name": "id",
		  "type": "bytes32"
		}
	  ],
	  "name": "ChainlinkCancelled",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "bytes32",
		  "name": "id",
		  "type": "bytes32"
		}
	  ],
	  "name": "ChainlinkFulfilled",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "bytes32",
		  "name": "id",
		  "type": "bytes32"
		}
	  ],
	  "name": "ChainlinkRequested",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "_postId",
		  "type": "uint256"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "_seller",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "_price",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "string",
		  "name": "_postData",
		  "type": "string"
		},
		{
		  "indexed": false,
		  "internalType": "bytes32",
		  "name": "_metaData",
		  "type": "bytes32"
		}
	  ],
	  "name": "NewPost",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "_postId",
		  "type": "uint256"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "_user",
		  "type": "address"
		}
	  ],
	  "name": "PostLiked",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "_postId",
		  "type": "uint256"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "_seller",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "_oldPrice",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "_newPrice",
		  "type": "uint256"
		}
	  ],
	  "name": "PostPriceUpdate",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "_postId",
		  "type": "uint256"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "_tokenId",
		  "type": "uint256"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "_previousOwner",
		  "type": "address"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "_newOwner",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "_amount",
		  "type": "uint256"
		}
	  ],
	  "name": "PostSold",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "bytes32",
		  "name": "requestId",
		  "type": "bytes32"
		},
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "price",
		  "type": "uint256"
		}
	  ],
	  "name": "RequestFulfilled",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "uint256",
		  "name": "_postId",
		  "type": "uint256"
		},
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "_taxPayer",
		  "type": "address"
		},
		{
		  "indexed": false,
		  "internalType": "uint256",
		  "name": "_amount",
		  "type": "uint256"
		}
	  ],
	  "name": "TaxPayed",
	  "type": "event"
	},
	{
	  "anonymous": false,
	  "inputs": [
		{
		  "indexed": true,
		  "internalType": "address",
		  "name": "from",
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
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "Transfer",
	  "type": "event"
	},
	{
	  "inputs": [
		{
		  "internalType": "bytes32",
		  "name": "",
		  "type": "bytes32"
		}
	  ],
	  "name": "TokenTransferRecords",
	  "outputs": [
		{
		  "internalType": "uint256",
		  "name": "postId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "tokenAddress",
		  "type": "address"
		},
		{
		  "internalType": "bool",
		  "name": "isComplete",
		  "type": "bool"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "_postIds",
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
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "",
		  "type": "address"
		}
	  ],
	  "name": "_postLikedByAddress",
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
		  "internalType": "uint256",
		  "name": "",
		  "type": "uint256"
		}
	  ],
	  "name": "_posts",
	  "outputs": [
		{
		  "internalType": "address",
		  "name": "creator",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "price",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "taxrate",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "lastTaxCollected",
		  "type": "uint256"
		},
		{
		  "internalType": "string",
		  "name": "postData",
		  "type": "string"
		},
		{
		  "internalType": "bool",
		  "name": "exists",
		  "type": "bool"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "_tokenIds",
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
		  "internalType": "bytes32",
		  "name": "_tokenSymbol",
		  "type": "bytes32"
		},
		{
		  "internalType": "address",
		  "name": "_tokenAddress",
		  "type": "address"
		}
	  ],
	  "name": "addNewToken",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "approve",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		}
	  ],
	  "name": "balanceOf",
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
	  "inputs": [],
	  "name": "baseURI",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "price",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "taxrate",
		  "type": "uint256"
		},
		{
		  "internalType": "string",
		  "name": "postData",
		  "type": "string"
		},
		{
		  "internalType": "bytes32",
		  "name": "metaData",
		  "type": "bytes32"
		}
	  ],
	  "name": "createPost",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "price",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "taxrate",
		  "type": "uint256"
		},
		{
		  "internalType": "string",
		  "name": "postData",
		  "type": "string"
		},
		{
		  "internalType": "bytes32",
		  "name": "metaData",
		  "type": "bytes32"
		},
		{
		  "internalType": "address",
		  "name": "creator",
		  "type": "address"
		},
		{
		  "internalType": "bytes32",
		  "name": "r",
		  "type": "bytes32"
		},
		{
		  "internalType": "bytes32",
		  "name": "s",
		  "type": "bytes32"
		},
		{
		  "internalType": "uint8",
		  "name": "v",
		  "type": "uint8"
		}
	  ],
	  "name": "createPostMeta",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "bytes32",
		  "name": "_requestId",
		  "type": "bytes32"
		},
		{
		  "internalType": "uint256",
		  "name": "_price",
		  "type": "uint256"
		}
	  ],
	  "name": "fulfill",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "getApproved",
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
		  "internalType": "address",
		  "name": "owner",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		}
	  ],
	  "name": "isApprovedForAll",
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
		  "internalType": "uint256",
		  "name": "postId",
		  "type": "uint256"
		}
	  ],
	  "name": "likePost",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "postId",
		  "type": "uint256"
		},
		{
		  "internalType": "address",
		  "name": "liker",
		  "type": "address"
		},
		{
		  "internalType": "bytes32",
		  "name": "r",
		  "type": "bytes32"
		},
		{
		  "internalType": "bytes32",
		  "name": "s",
		  "type": "bytes32"
		},
		{
		  "internalType": "uint8",
		  "name": "v",
		  "type": "uint8"
		}
	  ],
	  "name": "likePostMeta",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "name",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
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
	  "name": "nonces",
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
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "ownerOf",
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
		  "internalType": "uint256",
		  "name": "postId",
		  "type": "uint256"
		}
	  ],
	  "name": "payTaxes",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "postId",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes32",
		  "name": "_tokenSymbol",
		  "type": "bytes32"
		}
	  ],
	  "name": "purchasePost",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "safeTransferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		},
		{
		  "internalType": "bytes",
		  "name": "_data",
		  "type": "bytes"
		}
	  ],
	  "name": "safeTransferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "address",
		  "name": "operator",
		  "type": "address"
		},
		{
		  "internalType": "bool",
		  "name": "approved",
		  "type": "bool"
		}
	  ],
	  "name": "setApprovalForAll",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "bytes4",
		  "name": "interfaceId",
		  "type": "bytes4"
		}
	  ],
	  "name": "supportsInterface",
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
	  "inputs": [],
	  "name": "symbol",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
		}
	  ],
	  "stateMutability": "view",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "index",
		  "type": "uint256"
		}
	  ],
	  "name": "tokenByIndex",
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
		  "name": "owner",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "index",
		  "type": "uint256"
		}
	  ],
	  "name": "tokenOfOwnerByIndex",
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
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "tokenURI",
	  "outputs": [
		{
		  "internalType": "string",
		  "name": "",
		  "type": "string"
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
	  "name": "tokensAllowed",
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
	  "name": "totalSupply",
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
		  "name": "from",
		  "type": "address"
		},
		{
		  "internalType": "address",
		  "name": "to",
		  "type": "address"
		},
		{
		  "internalType": "uint256",
		  "name": "tokenId",
		  "type": "uint256"
		}
	  ],
	  "name": "transferFrom",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	},
	{
	  "inputs": [
		{
		  "internalType": "uint256",
		  "name": "postId",
		  "type": "uint256"
		},
		{
		  "internalType": "uint256",
		  "name": "newPrice",
		  "type": "uint256"
		}
	  ],
	  "name": "updatePostPrice",
	  "outputs": [],
	  "stateMutability": "payable",
	  "type": "function"
	},
	{
	  "inputs": [],
	  "name": "withdrawLink",
	  "outputs": [],
	  "stateMutability": "nonpayable",
	  "type": "function"
	}
  ]

  const chainExplorers = {
	'4':'https://rinkeby.etherscan.io',
	'80001': 'https://mumbai-explorer.matic.today'
}
