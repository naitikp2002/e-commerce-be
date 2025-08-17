const { Model } = require("sequelize")

 const configEnv = {
    HOST: process.env.HOST,
    USER: process.env.USERNAME,
    PASSWORD: process.env.PASSWORD,
    NAME: process.env.NAME,
    PORT: process.env.PORT_NUMBER,
    DIALECT: process.env.DIALECT,
}
module.exports = { configEnv }