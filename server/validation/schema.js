exports.userSchemaForFarmer={
  "properties": {
    "password": { "type": "string","pattern":"^[0-9]{6,6}$","minLength":6,"maxLength":6 }
  },
  "required": ["password"]
};
exports.userSchemaForInternal={
  "type":"object",
  "properties": {
    "password": { "type": "string","pattern":"^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$","minLength":6,"maxLength":15 }
  },
  "required": ["password"]
};
exports.profileSchema={
  "type":"object",
  "properties": {
    "name": { "type": "string" },
    "phone": { "type": "string","pattern":"^[0-9]+$","minLength":6,"maxLength":15 },
    "address":{"type":"object","properties":{
      "country":{"type":"string","minLength":3},
      "city":{"type":"string","minLength":3},
      "province":{"type":"string","minLength":3},
      "district":{"type":"string","minLength":3},
      "line1":{"type":"string","minLength":3}
    },
      "required": ["country","city","province","district","line1"]

    }

  },
  "required": ["name","phone","address"]
};


