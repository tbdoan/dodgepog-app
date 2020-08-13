$(function () {
  toggleViews(0);
  for (let i = 1; i <= 5; i++) {
    let template = generateTemplate(i);
    $('#your-team').append(template);
  }
  for (let i = 6; i <= 10; i++) {
    let template = generateTemplate(i);
    $('#enemy-team').append(template);
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

const generateTemplate = (i) => {
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
  return template
}

async function start() {
  let { PythonShell } = require('python-shell');

  let options = {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: './scripts',
  };

  let pyshell = new PythonShell('getplayers.py', options);

  pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple 'print' statement)
    console.log(message);
    const data = JSON.parse(message);
    toggleViews(1);
    data['champ_names'].map((name, index) => {
      if (name !== null) {
        $(`#champ${index + 1}`).text(name);
        name = name.replace(/[^A-Za-z0-9]/g, '');
        $(`#tile${index + 1}`).attr('src', `assets/champ_tiles/${name}_0.jpg`)
      }
    })
    if (data['pred'] > 0) {
      prediction = `
                  <p style="color:${data['pred'] > 0.5 ? 'green' : 'red'}">
                    ${data['pred']}
                  </p> `;
      $('#odds').replaceWith(prediction);
    } else {
      toggleViews(0);
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
