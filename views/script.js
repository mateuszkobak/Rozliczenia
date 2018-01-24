$('document').ready( () => {
  $('#teamsScreen').hide()
  $('#statsContainer').hide()
  $('#rozliczButton').hide()
})

let socket = io()
let username
let curr_team
let curr_admin

///////////////////////////////////////////////////////////////////////////////
//LISTENERY

$("#logIn").click(() => {
  username = $("#usernameIn").val()
  let password = $("#passwordIn").val()
  socket.emit('login', {
    username: username,
    password: password
  })
})

$("#createTeam").click(function() {
  let teamName = $("#teamNameIn").val()
  socket.emit('createTeam', {
    username: username,
    teamName: teamName
  })
})

$("#addMember").click(function() {
  let memberName = $("#addMemberIn").val()
  socket.emit('addMember', {
    team_id: curr_team,
    memberName: memberName
  })
})

$("#addPayment").click(function() {
  year = $("#yearIn").val()
  month = $("#monthIn").val()
  day = $("#dayIn").val()
  money = $("#moneyIn").val()
  paymentName = $("#paymentNameIn").val()
  debtors = []
  $(".debtors:checked").each(function() {
    debtors.push($(this).data('username'))
  })

  socket.emit('addPayment', {
    team_id: curr_team,
    username: username,
    year: year,
    month: month,
    day: day,
    money: money,
    paymentName: paymentName,
    debtors: debtors
  })
})

$("#bracesButton").click(function() {
  let begin = $("#begin").val()
  let end = $("#end").val()
  socket.emit('braces', {
    begin: begin,
    end: end,
    team_id: curr_team
  })
})

$("#clearBracesButton").click(function() {
  $("#begin").val("")
  $("#end").val("")
  socket.emit('team', {
    username: username,
    team_id: curr_team
  })
})

$("#rozliczButton").click(function() {
  let begin = $("#begin").val()
  let end = $("#end").val()
  if (begin == '') {
    console.log("Rozliczam");
    socket.emit('rozlicz', {
      team_id: curr_team
    })
  }
  else {
    socket.emit('rozlicz_date', {
      team_id: curr_team,
      begin: begin,
      end: end
    })
  }
})

///////////////////////////////////////////////////////////////////////////////
//SOCKETY
socket.on('relogin', (msg) => {
  if (msg.success) {
    $("#loginScreen").hide()
  }
  else {
    alert("złe dane logowania")
  }
})

socket.on('reuser', (msg) => {
  showTeamsList(msg.teams)
})


socket.on('reteam', function(msg) {
  $("#statsContainer").show()
  $("#rozliczButton").hide()
  curr_admin = msg.admin[0].username
  if (curr_admin == username) {
    $("#rozliczButton").show()
  }
  showPayments(msg.payments)
  showStats(msg.stats)
  showCheckers(msg.stats)
})

socket.on('rerozlicz', function(msg) {
  showRozliczenie(msg)
})


///////////////////////////////////////////////////////////////////////////////
//FUNKCJE
function showTeamsList(teams) {
  let html = ''

  teams.forEach( (team) => {
    html += '<li class="list-group-item list-group-item-action teamItem" data-team="' + team.team_id + '">' + team.name + '</li>'
  })

  $("#teamsList").html(html)
  $("#teamsScreen").show()

  $(".teamItem").on('click', function() {
    $(this).parent().children().removeClass('active');
    $(this).addClass('active')
    curr_team = $(this).attr('data-team')
    socket.emit('team', {
      username: username,
      team_id: curr_team
    })
  })
}

function showPayments(payments) {
  html = ''

  payments.forEach( function(elem) {
    html += '<li class="list-group-item">' + elem.payment.payment_id + '. ' + elem.payment.name + ', kwota: ' + elem.payment.money +
    ', płacił: ' + elem.payment.payer + ', data: ' + elem.payment.date.substr(0,10) + ', obciążeni: ' + elem.debtors + '</li>'
  })
  $("#paymentsList").html(html)
}

function showStats(stats) {
  html = ''
  stats.forEach(function(elem) {
    let forAdmion = ''

    if (curr_admin == elem.username) forAdmion = 'list-group-item-warning'
    html += '<li class="list-group-item ' + forAdmion + '">' + elem.username + ': ' + elem.state + '</li>'
  })
  $("#membersList").html(html)
}

function showCheckers(stats) {
  html = ''
  stats.forEach(function(elem) {
    html+='<div class="form-check "><input type="checkbox" class="form-check-input debtors" data-username="' + elem.username + '">    <label class="form-check-label" for="exampleCheck1">' + elem.username + '</label></div>'
  })

  $("#userCheck").html(html)
}

function showRozliczenie(transfers) {
  html = ''
  transfers.forEach(function(e) {
    html += '<li class="list-group-item">' + e.from + ' => ' + e.to + ' : ' + e.money + '</li>'
  })
  $("#transfersList").html(html)
  $("#rozliczenieModal").modal('show')
}
