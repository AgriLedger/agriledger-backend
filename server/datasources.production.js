
module.exports={
  memory: {
    "name": "db",
    "connector": "memory"
  },
  mongo: {
    "url":process.env.MONGODB_URL,
    "host":process.env.MONGODB_HOST,
    "port": process.env.MONGODB_PORT,
    "database":process.env.MONGODB_DATABASE,
    "password":process.env.MONGODB_PASSWPRD,
    "user":process.env.MONGODB_USER,
    "connector": "mongodb"
  },
  "storage": {
  "name": "storage",
    "connector": "loopback-component-storage",
    "provider": "filesystem",
    "root": "/files",
    "maxFileSize": "10485760"
},
  "email": {
    "name": "email",
    "connector": "mail",
    "transports": [
      {
        "type": "SMTP",
        "host": "send.one.com",
        "secure": true,
        "port": 465,
        "auth": {
          "user": "admin@spectrus-group.com",
          "pass": "Admin!23"
        }
      }
    ]
  }
}
