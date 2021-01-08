//Dependencies
import url from "url"
import sql from "sequelize"
const { Sequelize, Model, DataTypes } = sql

let models = {}

async function setup() {
  //Establish database connection
  console.log("Attempting to connect to database")
  const database = new Sequelize({
    dialect: "sqlite",
    storage: url.fileURLToPath(new URL("./database.sqlite3", import.meta.url)),
    logging: ()=>{},
  })
  await database.authenticate()

  //Create tables
  console.log("Checking and altering structure")
  class PingdateTable extends Model {}
  PingdateTable.init({
    channel_id: DataTypes.STRING,
    lastping: DataTypes.DATE,
  }, {
    sequelize: database,
    modelName: "pingdates",
  })
  await database.sync({ alter: true })
    .catch(console.error)
  models.PingdateTable = PingdateTable

  //Everything done
  console.log("Database is working")
  return database
}

export default setup
export { models }
