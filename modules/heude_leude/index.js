//Dependencies
import _ from "lodash"

//Modules
import setup, { models } from "./database/setup.js"

//Settings
import trackedChannels from "./settings.json"

let database

async function checkChannels(oldState, newState) {
  try {
    //Check if user just recently connected
    if(!_.isNil(oldState?.channel)) { return }
    //User just recently joined (new voice connection)

    //Check if only one user is currently connected
    if(oldState.channel?.members?.size !== 1) { return }
  
    //Check if user connected to a tracked channel
    let newChannel = newState?.channel?.id
    if(newChannel === undefined) { return }
    if(_.has(trackedChannels, newChannel) === false) { return }
  
    //Determine announcement channel
    let announcementChannel = trackedChannels[newChannel]
  
    //Determine if channel has recently been pinged
    let result = await models.PingdateTable.findOrCreate({
      where: {
        channel_id: announcementChannel
      }
    })
  
    console.log(result?.[0]?.dataValues?.lastping)
    //Send announcement
    let lastping = result?.[0]?.dataValues?.lastping
    if(
      (lastping === undefined) ||
      (lastping < (Date.now() - 3600000))
    ) {
      //Last message was 1h+ ago
      let postfix = `${_.sampleSize("aeiouäöü", (Math.random() * 3) + 1).join("")}${_.sample("dt")}`.toUpperCase()
      newState?.guild?.channels?.cache?.get(announcementChannel)?.send(`@here H${postfix}E L${postfix}E?`)
      //Update latest ping date
      await models.PingdateTable.update({lastping: Date.now()}, {
        where: {
          channel_id: announcementChannel
        }
      })
    } else {
      //Last message is younger than 1h
      newState?.guild?.channels?.cache?.get(announcementChannel)?.send(`${newState.member} in diesem Textkanal wurde erst vor Kurzem gepingt.`)
    }

  } catch (error) {
    console.error(error)
  }
}

async function hookTo(client) {
  database = await setup()
  client.on("voiceStateUpdate", checkChannels)
}

export default hookTo
