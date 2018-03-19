//express is a framework for node.js to build an api
//here we are requiring it from our node modules
const express = require('express');
//we are the utilizing express by initializing it and assigning it to app
const app = express();
//body parser is a node middleware that makes incoming requests json
const bodyParser = require('body-parser');
//assigning environment to the node environment or default to development set in knexfile
const environment = process.env.NODE_ENV || 'development';
//config assigned to what environment gets set to requiring knexfile
const configuration = require('./knexfile')[environment];
//database assigned to node module knex per it's config
const database = require('knex')(configuration);

//sets server to accept param from environment or default to localhost:3000
app.set('port', process.env.PORT || 3000);
//tells express to utilize static js and css files from public folder
app.use(express.static('public'));
//implementing the use of middleware and converting to json
app.use(bodyParser.json());

//telling app to get projects from a certain url. callback takes request object and response object
app.get('/api/v1/projects', (request, response) => {
  //accessing the table projects and selecting it
  database('projects').select()
  //then given projects present 
  .then((projects) => {
    //send response object with status of 200 ok and json object of all projects
    response.status(200).json(projects);
  })
  //if no such projects exist send an error
  .catch((error) => {
    //response object status key set to server error and json the error sent
    response.status(500).json({ error });
  });
});

//making a get request to a url with dynamic project id
app.get('/api/v1/projects/:id', (request, response) => {
  //accessing our database table projects where the id matches the id from the request object, same as the in the url
  database('projects').where('id', request.params.id)
  //select that particular project
  .select()
  //then for that project
  .then((projects) => {
    //send response object w status of 200 ok and the json ed project
    response.status(200).json(projects);
  })
  //otherwise send an error
  .catch((error) => {
    response.status(500).json({ error });
  });
});

//this get gets the palettes
app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
  .then((palettes) => {
    response.status(200).json(palettes);
  })
  .catch((error) => {
    response.status(500).json({ error });
  });
});

//get that finds all palettes of a project
app.get('/api/v1/projects/:id/palettes/', (request, response) => {
  //find the palettes table where the project_id / foreign id matches that of the id passed into the url which corresponds to the primary key of the project
  database('palettes').where('project_id', request.params.id)
    .select()
    //for each palette in the projec table
    .then( palette => {
      //if it has length / exists
      if(palette.length) {
        //set status of response object to 200 ok and send json version of palette
        response.status(200).json(palette);    
      } else {
        //otherwise send error 404 that no palette exists for that project
        response.status(404).json({
          error: `Could not find palette with id ${request.params.id}`
        })
      }
    })
    //if stuff goes really wrong send server error 500 unprocessable
    .catch(error => {
      response.status(500).json({ error });
    });
});

//post or add data to database
app.post('/api/v1/projects', (request, response) => {
  //destructuring title from the request object
  const { title } = request.body;
  //if no title exists in request 
  if (!title) {
    //response status set as 422 missing params
    return response
      .status(422)
      .send({ error: `Expected format: { title: <String> }. You're missing a Title.` });
  }
  //otherwise if title is present add to database and give it an incremented id
  database('projects').insert({ title }, 'id')
  //send status code that data was successfully added
    .then(project => {
      //added with json version of id and title
      response.status(201).json({ id: project[0], title })
    })
    //else server messed up 
    .catch(error => {
      response.status(500).json({ error });
    });
});

//post that adds new palette to database
app.post('/api/v1/palettes', (request, response) => {
  //getting palette from request body
  const palette = request.body;
  //assigning palette to new const to preserve unmutated
  const paletteObject = request.body;
  //for each required param of palette_name
  for (let requiredParameter of ['palette_name']) {
    //if it don't exist
    if (!palette[requiredParameter]) {
      //send a 422 that something is missing
      return response
        .status(422)
        .send({ error: `Expected format: { palette_name: <String> }. You\'re missing a "${requiredParameter}" property.` });
    }
  }
  //otherwise lets add that new palette into palettes table give it an id
  database('palettes').insert(palette, 'id')
    .then(palette => {
      //let everyone know it was added successfully
      //combine the id and the new palette
      response.status(201).json(Object.assign({}, { id: palette[0] }, paletteObject))
    })
    //otherwise things went badly on ther server side, thanks backend
    .catch(error => {
      response.status(500).json({ error });
    });
});

//lets delete a particular palette by dynamic id
app.delete('/api/v1/palettes/:id', (request, response) => {
  //check the database palettes table for a palette that matches the id
  database('palettes').where('id', request.params.id)
  //select that thing
    .select()
    //go ahead and delete that palette
    .del()
    //then confirm it no longer exists by checking its length to be 0
    .then( palette => {
      if(!palette.length) {
        //confirmed it gone, send 200 ok send request body
        response.status(200).json(request.body);    
      } else {
        //otherwise let us know database could not find palette by that id
        response.status(404).json({
          error: `Could not find palette with id ${request.params.id}`
        })
      }
    })
    //server totally messed up
    .catch(error => {
      response.status(500).json({ error });
    });
});

//sanity check that our app is paying attention and informs us via console where exactly it's running
app.listen(app.get('port'), () => {
  console.log(`PENTACHROMA is running on ${app.get('port')}.`);
});

//had to export for testing porpoises
module.exports = app;