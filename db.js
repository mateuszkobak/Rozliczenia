let mysql = require('async-mysql');

let con;

function today() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10) {
      dd = '0'+dd
  }
  if(mm<10) {
      mm = '0'+mm
  }
  return yyyy+ '-' + mm + '-' + dd;
}

async function init() {
  con = await mysql.connect({
    host: "localhost",
    user: "app",
    database: "rozlicz",
    dateStrings: 'date'
  });
  console.log("Connected");
}

async function authenticate(username, password) {
  let sql =
    "SELECT password FROM User WHERE username = '" + username + "'";
  let result = await con.query(sql);
  return result[0].password = password;
}

async function get_teams(username) {
  let sql =
    "SELECT Member.team_id, name, Team.username admin FROM User " +
    "NATURAL JOIN Member " +
    "JOIN Team ON Member.team_id = Team.team_id " +
    "WHERE User.username = '" + username + "';";
  return await con.query(sql);
}

async function get_members(team_name) {
  let sql =
    "SELECT username FROM Team " +
    "NATURAL JOIN Member " +
    "WHERE name = '" + team_name +"';";
  return await con.query(sql);
}

async function get_payments_date(team_id, begin, end) {
  let sql =
    "SELECT * FROM Payment WHERE team_id = '" + team_id + "' " +
    "AND date >= '" + begin + "' AND date <= '" + end + "' ;";
    let payments = await con.query(sql);
    let result = [];
    for (let i = 0; i < payments.length; i++) {
      let elem = payments[i]
      let sql1 =
        "SELECT username FROM Debtor WHERE payment_id = " + elem.payment_id + ";"
      let debtors = await con.query(sql1)
      let debtors_res = []
      debtors.forEach((e) => e = debtors_res.push(e.username))

      await result.push({
        payment: elem,
        debtors: debtors_res
      })
    }
    return result;
}

async function get_payments(team_id) {
  let sql =
    "SELECT * FROM Payment WHERE team_id = '" + team_id + "';"
  let payments = await con.query(sql);
  let result = [];

  for (let i = 0; i < payments.length; i++) {
    let elem = payments[i]
    let sql1 =
      "SELECT username FROM Debtor WHERE payment_id = " + elem.payment_id + ";"
    let debtors = await con.query(sql1)
    let debtors_res = []
    debtors.forEach((e) => e = debtors_res.push(e.username))

    await result.push({
      payment: elem,
      debtors: debtors_res
    })
  }
  return result;
}

async function calculate_payoff_date(team_id, begin, end) {
  let sql1 =
    "SELECT Member.username, COALESCE(dout, 0) dout FROM Member " +
    "LEFT JOIN " +
    "(SELECT username, SUM(devided.portion) dout FROM Debtor " +
    "NATURAL JOIN " +
    "( SELECT payment_id, money / COUNT(username) portion " +
    "FROM Payment NATURAL JOIN Debtor " +
    "WHERE team_id = " + team_id + " " +
    "AND date >= '" + begin + "' AND date <= '" + end + "' " +
    "GROUP BY payment_id, money ) AS devided " +
    "GROUP BY username) AS Debts " +
    "ON Member.username = Debts.username " +
    "WHERE team_id= " + team_id + " ORDER BY Member.username;"

  let sql2 =
    "SELECT Member.username, COALESCE(din, 0) din FROM Member " +
    "LEFT JOIN " +
    "(SELECT payer username, SUM(money) din FROM Payment " +
    "WHERE team_id = " + team_id + " " +
    "AND date >= '" + begin + "' AND date <= '" + end + "' " +
    "GROUP BY payer) AS Incomes " +
    "ON Member.username = Incomes.username " +
    "WHERE team_id= " + team_id + " ORDER BY Member.username;"

  let debts_out = await con.query(sql1);
  let debts_in = await con.query(sql2);
  let stats = [];
  for (let i = 0; i < debts_in.length; i++) {
    stats.push({
      username: debts_in[i].username,
      state: debts_in[i].din - debts_out[i].dout
    })
  }

  return stats;
}

async function calculate_payoff(team_id) {
  let sql1 =
    "SELECT Member.username, COALESCE(dout, 0) dout FROM Member " +
    "LEFT JOIN " +
    "(SELECT username, SUM(devided.portion) dout FROM Debtor " +
    "NATURAL JOIN " +
    "( SELECT payment_id, money / COUNT(username) portion " +
    "FROM Payment NATURAL JOIN Debtor " +
    "WHERE team_id = " + team_id + " " +
    "GROUP BY payment_id, money ) AS devided " +
    "GROUP BY username) AS Debts " +
    "ON Member.username = Debts.username " +
    "WHERE team_id= " + team_id + " ORDER BY Member.username;"

  let sql2 =
    "SELECT Member.username, COALESCE(din, 0) din FROM Member " +
    "LEFT JOIN " +
    "(SELECT payer username, SUM(money) din FROM Payment " +
    "WHERE team_id = " + team_id + " " +
    "GROUP BY payer) AS Incomes " +
    "ON Member.username = Incomes.username " +
    "WHERE team_id= " + team_id + " ORDER BY Member.username;"

  let debts_out = await con.query(sql1);
  let debts_in = await con.query(sql2);
  let stats = [];
  for (let i = 0; i < debts_in.length; i++) {
    stats.push({
      username: debts_in[i].username,
      state: debts_in[i].din - debts_out[i].dout
    })
  }
  return stats;
}

async function create_team(username, team_name) {
  let sql1 =
    "INSERT INTO Team (name, begin_date, username) " +
    "VALUES ('" + team_name + "', '" + today() + "', '" + username + "'); "

  let res = await con.query(sql1)
  let sql2 =
    "INSERT INTO Member VALUES (" + res.insertId + ", '" + username + "');"
  await con.query(sql2)
}

async function add_member(team_id, username) {
  let sql =
    "INSERT INTO Member VALUES (" + team_id + ", '" + username + "');"
  await con.query(sql)
  //TODO nagłupotodporność
}

async function add_payment(data) {
  let sql =
    "INSERT INTO Payment (name, money, team_id, payer, date) VALUES " +
    "('" + data.paymentName + "', " + data.money + ", " + data.team_id + ", " +
    "'" + data.username + "', '" + data.year + "-" + data.month + "-" + data.day + "'); "
    //TODO nagłupotodporność
  let res = await con.query(sql)
  data.debtors.forEach( async (e) => {
    let sql1 =
      "INSERT INTO Debtor VALUES (" + res.insertId + ", '" + e + "');"
    await con.query(sql1)
  })
}

async function get_admin(team_id) {
  let sql =
    "SELECT username FROM Team WHERE team_id=" + team_id +";"
  let result = await con.query(sql)
  return result
}

async function rozlicz_date(team_id, begin, end) {
  let payments = await get_payments_date(team_id, begin, end)

  payments.forEach( (e) => {
    delete_debtors(e.payment.payment_id)
  })

  let sql =
    "DELETE FROM Payment WHERE team_id =" + team_id + " " +
    "AND date >= '" + begin + "' AND date <= '" + end + "';"
  await con.query(sql)
}

async function rozlicz(team_id) {
  let payments = await get_payments(team_id)

  payments.forEach( async (e) => {
    await delete_debtors(e.payment.payment_id)
  })

  let sql =
    "DELETE FROM Payment WHERE team_id =" + team_id + ";"
  let result = await con.query(sql)
}

async function delete_debtors(payment_id) {
  let sql =
    "DELETE FROM Debtor WHERE payment_id=" + payment_id + ";"
  await con.query(sql)
}

module.exports = {
    init: init,
    authenticate: authenticate,
    get_teams: get_teams,
    calculate_payoff_date: calculate_payoff_date,
    calculate_payoff: calculate_payoff,
    get_payments_date: get_payments_date,
    get_payments: get_payments,
    create_team: create_team,
    add_member: add_member,
    add_payment: add_payment,
    get_admin: get_admin,
    rozlicz_date: rozlicz_date,
    rozlicz: rozlicz
};
