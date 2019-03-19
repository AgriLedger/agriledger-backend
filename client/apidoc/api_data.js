define({ "api": [
  {
    "type": "get",
    "url": "/sendassetfrom",
    "title": "send asset from your address to another address",
    "group": "Send_and_Receive",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "from",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "to",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "amount",
            "description": ""
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "txnId",
            "description": "<p>Transaction ID.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Object",
            "optional": false,
            "field": "Error",
            "description": "<p>Error object containing message property</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routes/multichain/server.js",
    "groupTitle": "Send_and_Receive",
    "name": "GetSendassetfrom"
  },
  {
    "type": "get",
    "url": "/sendfrom",
    "title": "send token from your address to another address",
    "group": "Send_and_Receive",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "from",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "to",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "amount",
            "description": ""
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "txnId",
            "description": "<p>Transaction ID.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Object",
            "optional": false,
            "field": "Error",
            "description": "<p>Error object containing message property</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routes/multichain/server.js",
    "groupTitle": "Send_and_Receive",
    "name": "GetSendfrom"
  },
  {
    "type": "get",
    "url": "/getaddressbalances",
    "title": "get balance by address",
    "group": "Wallet",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": ""
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "balance",
            "description": "<p>list of balances for this address</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Object",
            "optional": false,
            "field": "Error",
            "description": "<p>Error object containing message property</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routes/multichain/server.js",
    "groupTitle": "Wallet",
    "name": "GetGetaddressbalances"
  },
  {
    "type": "get",
    "url": "/getaddresses",
    "title": "get all addresses in wallet",
    "group": "Wallet",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "address",
            "description": "<p>list of address in node's wallet.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Object",
            "optional": false,
            "field": "Error",
            "description": "<p>Error object containing message property</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routes/multichain/server.js",
    "groupTitle": "Wallet",
    "name": "GetGetaddresses"
  },
  {
    "type": "get",
    "url": "/getnewaddress",
    "title": "generate address  for user",
    "group": "Wallet",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": "<p>return created address</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Object",
            "optional": false,
            "field": "Error",
            "description": "<p>Error object containing message property</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routes/multichain/server.js",
    "groupTitle": "Wallet",
    "name": "GetGetnewaddress"
  },
  {
    "type": "get",
    "url": "/listaddresstransactions",
    "title": "get all the txn from by address",
    "group": "Wallet",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": ""
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-access-token",
            "description": "<p>Users token</p>"
          },
          {
            "group": "Header",
            "type": "Object[]",
            "optional": false,
            "field": "txn",
            "description": "<p>list of transactions for this address</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Object",
            "optional": false,
            "field": "Error",
            "description": "<p>Error object containing message property</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "server/routes/multichain/server.js",
    "groupTitle": "Wallet",
    "name": "GetListaddresstransactions"
  }
] });
