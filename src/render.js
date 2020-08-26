const lanes = ['top', 'jungle', 'middle', 'bottom', 'support'];

$(function () {
  // TODO: change this back to 0
  toggleViews(1);
  for (let i = 1; i <= 5; i++) {
    let template = generateChampTemplates(i);
    $('#your-team').append(template);
  }
  for (let i = 6; i <= 10; i++) {
    let template = generateChampTemplates(i);
    $('#enemy-team').append(template);
  }
  for (let i = 0; i < 5; i++) {
    let template = generateVsTemplate(i);
    $('#vs').append(template);
  }
  start();
});

const toggleViews = (viewNumber) => {
  if (viewNumber == 0) {
    $('#waiting').show();
    $('#players, #odds-display').hide();
  } else {
    $('#waiting').hide();
    $('#players, #odds-display').show();
  }
}

const generateChampTemplates = (i) => {
  let template;

  if (i <= 5) {
    template = `
    <div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <article class="media">
            <figure class="media-left">
              <img class="tile" id="tile${i}" src="https://bulma.io/images/placeholders/128x128.png">
            </figure>
            <div class="media-content">
              <div class="content">
                <p id="champ${i}">
                  Champion ${i}
                </p>
              </div>
            </div>
          </article>
        </div>
        <div class="flip-card-back blue">
          <article class="media">
            <div class="media-content">
              <div class="content is-small">
                  <p>data</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div> `
  }

  else {
    template = `
    <div class="flip-card right">
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <article class="media">
            <div class="media-content">
              <div class="content">
                <p class="right-column" id="champ${i}">
                  Champion ${i}
                </p>
              </div>
            </div>
            <figure class="media-right">
              <img class="tile" id="tile${i}" src="https://bulma.io/images/placeholders/128x128.png">
            </figure>
          </article>
        </div>
        <div class="flip-card-back red">
          <article class="media">
            <div class="media-content">
              <div class="content is-small red">
                  <p>data</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div> `
  }

  template.id = `slot${i}`;
  return template;
}

const generateVsTemplate = (i) => {
  let template =
    `<div class='middle-text' id='${lanes[i]}'>
      <h1 class="middle-column">${lanes[i].toUpperCase()} </h1>
      <p class='blue'></p>
      <div class="tooltip"> &#9432
        <span class="tooltiptext">Winrate based on # games</span>
      </div>
      <p class='red'></p>
    </div>`;
  return template;
}

async function start() {
  let { PythonShell } = require('python-shell');

  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './scripts',
  };

  let pyshell = new PythonShell('getplayers.py', options);

  const scraper = require('./scraper');
  let lastMessage = {};
  pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple 'print' statement)
    if(message !== lastMessage) {
      lastMessage = message;
      const data = JSON.parse(message);
      toggleViews(1);
      data['champ_names'].map((name, index) => {
        if (name !== null) {
          // sets name
          $(`#champ${index + 1}`).text(name);

          // sets champion tile
          name = name.replace(/[^A-Za-z0-9]/g, '');
          $(`#tile${index + 1}`).attr('src', `assets/champ_tiles/${name}_0.jpg`)

          // process matchups in pairs
          if (index < 5) {
            const redChamp = data['champ_names'][index + 5];
            if (redChamp !== null) {
              const blueChamp = name.toLowerCase();
              //prints the parameters
              scraper.getMatchup(blueChamp, redChamp.replace(/[^A-Za-z0-9]/g, '').toLowerCase(), lanes[index])
                .then((value) => {
                  console.log(value);
                  $(`#${lanes[index]} > p.blue`).text(parseFloat(value[0]).toPrecision(3) + '%');
                  $(`#${lanes[index]} > p.red`).text((100.00-parseFloat(value[0])).toPrecision(3) + '%');
                  $(`#${lanes[index]} > div > span`).text(`Winrate based on ${value[1]} games`);
                })
                .catch(console.log);
            }
          }
        }
      })
      if (data['pred'] > 0) {
        const prediction = `
                    <p style="color:${data['pred'] > 0.5 ? 'green' : 'red'}">
                      ${ data['pred'].toPrecision(2)}
                    </p> `;
        $('#odds').replaceWith(prediction);
      } else {
        toggleViews(0);
      }
    }
  });

  // end the input stream and allow the process to exit
  pyshell.end(function (err, code, signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
  });
}
