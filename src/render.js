const { data } = require('jquery');

$(function(){
  $('#players').hide();
  for(let i = 1; i <= 5; i++) {
    let template = generateTemplate(i);
    $('#your-team').append(template);
  }
  for(let i = 6; i <= 10; i++) {
    let template = generateTemplate(i);
    $('#enemy-team').append(template);
  }
  start();
});
const generateTemplate = (i) => {
  let template;

  if(i<=5) {
    template =
      '<article class="media">' +
        '<figure class="media-left">' +
          '<p class="image is-32x32">' +
            `<img src="https://bulma.io/images/placeholders/128x128.png" id="tile${i}">` +
          '</p>' +
        '</figure>' +
        '<div class="media-content center">' +
          '<div class="content is-small">' +
            `<p id="champ${i}">` +
              `Champion ${i}` +
            '</p>' +
          '</div>' +
        '</div>' +
      '</article>'
  }


  else {
    template =
      '<article class="media">' +
        '<div class="media-content center">' +
          '<div class="content is-small">' +
            `<p class="enemy-champs" id="champ${i}">` +
              `Champion ${i}` +
            '</p>' +
          '</div>' +
        '</div>' +
        '<figure class="media-right">' +
          '<p class="image is-32x32">' +
            `<img src="https://bulma.io/images/placeholders/128x128.png" id="tile${i}">` +
          '</p>' +
        '</figure>' +
      '</article>'
  }

  template.id = `slot${i}`;
  return template
}

async function start() {
    let {PythonShell} = require('python-shell');

    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: './scripts',
      };

      let pyshell = new PythonShell('getplayers.py', options);

      pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple 'print' statement)
        const data = JSON.parse(message);
        console.log(data);
        $('#waiting').remove();
        $('#players').show();
        data['champ_names'].map((name, index) => {
          if(name !== null) {
              $(`#champ${index+1}`).text(name);
              name = name.replace(/[^A-Za-z0-9]/g, '');
              $(`#tile${index+1}`).attr('src', `assets/champ_tiles/${name}_0.jpg`)
          }
        })
      });

      // end the input stream and allow the process to exit
      pyshell.end(function (err,code,signal) {
        if (err) throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
      });
}
