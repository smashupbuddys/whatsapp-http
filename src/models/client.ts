import sequelize from "../lib/sequelize";
import { DataTypes } from "@sequelize/core";

const Client = sequelize.define("client", {
  clientId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  qrCode: DataTypes.STRING,
  ready: DataTypes.BOOLEAN,

  webHook: DataTypes.STRING,
});

export default Client;
