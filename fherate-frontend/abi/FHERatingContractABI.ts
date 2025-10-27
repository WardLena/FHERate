
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const FHERatingContractABI = {
  "abi": [
    {
      "inputs": [],
      "name": "ActivityEnded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ActivityNotEnded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ActivityNotFound",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "AlreadyRated",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EmptyDimensions",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EmptyTitle",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDimensionCount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidEndTime",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidScale",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MismatchedScoreCount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MultipleRatingsNotAllowed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotCreator",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ActivityClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        }
      ],
      "name": "ActivityCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "rater",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "RatingSubmitted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        }
      ],
      "name": "closeActivity",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "coverImageUrl",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "dimensions",
          "type": "string[]"
        },
        {
          "internalType": "uint8",
          "name": "scale",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "endTime",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "allowMultiple",
          "type": "bool"
        }
      ],
      "name": "createActivity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        }
      ],
      "name": "getActivity",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "coverImageUrl",
              "type": "string"
            },
            {
              "internalType": "string[]",
              "name": "dimensions",
              "type": "string[]"
            },
            {
              "internalType": "uint8",
              "name": "scale",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "allowMultiple",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "participantCount",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct FHERatingContract.Activity",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActivityCount",
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
          "name": "activityId",
          "type": "uint256"
        }
      ],
      "name": "getActivityRaters",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        }
      ],
      "name": "getAllRatings",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "raters",
          "type": "address[]"
        },
        {
          "internalType": "euint32[][]",
          "name": "allScores",
          "type": "bytes32[][]"
        },
        {
          "internalType": "uint256[]",
          "name": "timestamps",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "name": "getCreatorActivities",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "participant",
          "type": "address"
        }
      ],
      "name": "getParticipantActivities",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getRatingTimestamp",
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
          "name": "activityId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserRating",
      "outputs": [
        {
          "internalType": "euint32[]",
          "name": "encryptedScores",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "hasUserRated",
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
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "activityId",
          "type": "uint256"
        },
        {
          "internalType": "bytes32[]",
          "name": "encryptedHandles",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "submitRating",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

