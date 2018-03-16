const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.use(bodyParser.json());
app.locals.title = 'Palette Picker';

app.locals.palettes = [];

app.get('/', (request, response) => {
  response.send('hello platte picker!');
});

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
  .then((projects) => {
    response.status(200).json(projects);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/projects/:id', (request, response) => {
  database('projects').select()
  .then((projects) => {
    response.status(200).json(projects);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
  .then((palettes) => {
    response.status(200).json(palettes);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/projects/:id/palettes/', (request, response) => {
  database('palettes').where('project_id', request.params.id)
    .select()
    .then( palette => {
      if(palette.length) {
        response.status(200).json(palette);    
      } else {
        response.status(404).json({
          error: `Could not find paper with id ${request.params.id}`
        })
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/projects', (request, response) => {
  const project = request.body;

  for (let requiredParameter of ['title']) {
    if (!project[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  database('projects').insert(project, 'id')
    .then(project => {
      response.status(201).json({ id: project[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/palettes', (request, response) => {
  const palette = request.body;

  for (let requiredParameter of ['palette_name']) {
    if (!palette[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { title: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }

  database('palettes').insert(palette, 'id')
    .then(palette => {
      response.status(201).json({ id: palette[0] })
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/palettes/:id', (request, response) => {
  database('palettes').where('id', request.params.id)
    .select()
    .del()
    .then( palette => {
      if(!palette.length) {
        response.status(200).json(request.body);    
      } else {
        response.status(404).json({
          error: `Could not find paper with id ${request.params.id}`
        })
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});