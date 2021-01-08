//Dependencies
import { Client } from "discord.js"

//Settings
import token from "./token.json"

//Modules
import heude_leude from "./modules/heude_leude/index.js"

//
let bot = new Client()

//Hook modules
heude_leude(bot)

//Start bot
bot.login(token)
  .catch(console.error)
