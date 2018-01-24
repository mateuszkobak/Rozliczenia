let express = require('express')
let app = express()
let http = require('http').Server(app)
let io = require('socket.io')(http)
let db = require('./db')

function my_compare(a, b) {
  return b.state - a.state
}

function sposob_rozliczenia(stats) {
  let transfers = []
  let n = stats.length
  stats.sort(my_compare)
  while (stats[0].state > 0.01) {
    let money = Math.min(stats[0].state, -stats[n - 1].state)
    stats[0].state -= money;
    stats[n - 1].state += money;
    transfers.push({
      from: stats[n - 1].username,
      to: stats[0].username,
      money: money
    })
    stats.sort(my_compare)
  }
  return transfers;
}

async function reteam(msg, socket) {
  let payments = await db.get_payments(msg.team_id)
  let stats = await db.calculate_payoff(msg.team_id)
  let admin = await db.get_admin(msg.team_id)
  socket.emit('reteam', {
    admin: admin,
    payments: payments,
    stats: stats
  })
}

async function reteam_date(msg, socket) {
  let payments = await db.get_payments_date(msg.team_id, msg.begin, msg.end)
  let stats = await db.calculate_payoff_date(msg.team_id, msg.begin, msg.end)
  let admin = await db.get_admin(msg.team_id)
  socket.emit('reteam', {
    admin: admin,
    payments: payments,
    stats: stats
  })
}

async function main() {


  await db.init()
  app.use(express.static('views'))

  io.on('connection', (socket) => {
    console.log("a user connected");

    socket.on('login', async (msg) => {
      if (db.authenticate(msg.username, msg.password)) {
        let teams = await db.get_teams(msg.username);
        socket.emit('relogin', {
          success: true
        })
        socket.emit('reuser', {
          teams: teams
        })
      }
      else {
        socket.emit('relogin', {
          success: false
        })
      }
    })

    socket.on('team', async (msg) => {
      reteam(msg, socket)
    })

    socket.on('createTeam', async (msg) => {
      await db.create_team(msg.username, msg.teamName)
      let teams = await db.get_teams(msg.username)
      socket.emit('reuser', {
        teams: teams
      })
    })

    socket.on('addMember', async (msg) => {
      await db.add_member(msg.team_id, msg.memberName)
      reteam(msg, socket)
    })

    socket.on('addPayment', async (msg) => {
      await db.add_payment(msg)
      reteam(msg, socket)
    })

    socket.on('braces', async function(msg) {
      reteam_date(msg, socket)
    })

    socket.on('rozlicz', async (msg) => {
      let stats_before = await db.calculate_payoff(msg.team_id)
      let rozliczenie = sposob_rozliczenia(stats_before)
      await db.rozlicz(msg.team_id)
      socket.emit('rerozlicz', rozliczenie)
      reteam(msg, socket)
    })

    socket.on('rozlicz_date', async (msg) => {
      let stats_before = await db.calculate_payoff_date(msg.team_id, msg.begin, msg.end)
      let rozliczenie = sposob_rozliczenia(stats_before)
      await db.rozlicz_date(msg.team_id, msg.begin, msg.end)
      socket.emit('rerozlicz', rozliczenie)
      reteam_date(msg, socket)
    })

  })

  let port = 4002
  http.listen(port, () => {
      console.log('listening on *:' + port)
  })
}

main();
