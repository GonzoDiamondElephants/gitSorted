'use strict';



let total = 0;

$.ajax('/weather', { method: 'get', datatype: 'json' })
  .then(data => {

    const dataKeys = Object.keys(data)
    const dataValues = Object.values(data)

    for (let i = 0; i < dataKeys.length; i++) {
      console.log(data[dataKeys[i]])
      $('#harry-pot').append('<p>book</p>');
      console.log($('#harry-pot'))

    }
  })


// // Sian Api house constructor.

function Harrypotter(obj) {
  this.houseName = obj.houseName;
  this.trait = obj.trait;
  this.description = obj.description;
  this.icon = obj.icon;
  this.magicNumber = obj.magicNumber;
  this.rivalHouse = obj.rival;
}

Harrypotter.prototype.render = function () {
  const source = $('#harry-pot').html();
  let template = Handlebars.compile(source);
  return template(this)
}

let sortedHouse = '';
let sortedRivalHouse = '';



$('#applicationForm').on('submit', function (e) {
  console.log('above preventdefault');
  e.preventDefault();
  total = Math.round((parseInt(e.target.favClass.value) +
    parseInt(e.target.companionAnimal.value) +
    parseInt(e.target.wandType.value) +
    parseInt(e.target.gift.value) +
    parseInt(e.target.book.value)) / 5);

    // here we are going to put in the if else statement for the database check


  $.ajax('/hp-house', { method: 'get', datatype: 'json' })
    .then(data => {
      data.forEach(house => {
        let normalizeData = new Harrypotter(house);
        let houseNumber = parseInt(normalizeData.magicNumber);
        console.log('inside house render total', total);
        if (houseNumber === total){
          sortedHouse = normalizeData.houseName;
          // here is where we get the sorted house and need to add it database 
          sortedRivalHouse = normalizeData.rivalHouse;
          console.log('sorted house', sortedHouse);
          console.log('rival house', sortedRivalHouse);
          let renderData = normalizeData.render();
          $('#houseHarry').append(renderData);
        }
      })
      return {sortedHouse, sortedRivalHouse}
    })
    .then( (data) => {
      $.ajax({
        url: '/harrypotter',
        method: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
      })
        .then( (data) => {

          // can we keep and send magic number and friends and foes AND house here
          renderStuff(data);
          renderMoreStuff(data);
        })
    })


})


function renderStuff (students) {
  for ( let i = 0; i < students.friends.length; i++){
    let name = students.friends[i].name;
    let image = students.friends[i].image;

    $('#hallBackground').append(`<div class="friend">${name}</div>`);
    $('#hallBackground').append(`<img src="${image}" alt="friend" >`);
  }
}

function renderMoreStuff (students) {
  for ( let i = 0; i < students.foes.length; i++){
    let name = students.foes[i].name;
    let image = students.foes[i].image;

    $('#hallBackground').append(`<div class="foe">${name}</div>`);
    $('#hallBackground').append(`<img src="${image}" alt="foe" >`);
  }
}



