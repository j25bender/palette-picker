const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const app = require('../server');
const configuration = require('../knexfile')['test'];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('Should return homepage with text', () => {
    return chai.request(app)
    .get('/')
    .then(response => {
      response.should.have.status(200);
      response.should.be.html;
      response.res.statusMessage.should.equal('OK');
    })
    .catch(error => {
      throw error;
    });
  });

  it('Requesting a non-existent path should return 404', () => {
    return chai.request(app)
    .get('/so-sad')
    .then(response => {
      response.should.have.status(404);
      response.res.statusMessage.should.equal('Not Found');
    })
    .catch(error => {
      throw error;
    });
  });
});

describe('API Routes', () => {

  before(() => {
    return database.migrate.latest()
  })

  beforeEach(() => {
    return database.seed.run();
  })

  describe('GET /api/v1/projects', () => {
    it('Should return all of the projects', () => {
      return chai.request(app)
      .get('/api/v1/projects')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');

        response.body[0].should.have.property('id');
        response.body[0].id.should.be.a('number');

        response.body[0].should.have.property('title');
        response.body[0].title.should.equal('Project1');

        response.body[0].should.have.property('created_at');
        response.body[0].created_at.should.be.a('string');
        
        response.body[0].should.have.property('updated_at');
        response.body[0].updated_at.should.be.a('string');
      });
    });
  });

  describe(`GET /api/v1/projects/:id`, () => {
    it('Should return a project by id', () => {
      return chai.request(app)
      .get('/api/v1/projects/1')
      .then(response => {
        console.log(response.body)
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');

        // response.body[0].should.have.property('id');
        // response.body.id.should.be.a('number');

        // response.body.should.have.property('title');
        // response.body.title.should.equal('Project1');

        // response.body.should.have.property('created_at');
        // response.body.created_at.should.be.a('string');
        
        // response.body.should.have.property('updated_at');
        // response.body.updated_at.should.be.a('string');
      });
    });
  });

  describe('GET /api/v1/projects', () => {
    it('Should return all of the projects', () => {
      return chai.request(app)
      .get('/api/v1/projects')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');

        response.body[0].should.have.property('id');
        response.body[0].id.should.be.a('number');

        response.body[0].should.have.property('title');
        response.body[0].title.should.equal('Project1');

        response.body[0].should.have.property('created_at');
        response.body[0].created_at.should.be.a('string');
        
        response.body[0].should.have.property('updated_at');
        response.body[0].updated_at.should.be.a('string');
      });
    });
  });

  describe('POST /api/v1/projects', () => {
    it('Should create a new project', () => {
      return chai.request(app)
      .post('/api/v1/projects')
      .send({
        title: 'Project 25'
      })
      .then(response => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');

        response.body.should.have.property('id');
        response.body.id.should.be.a('number');
        
        response.body.should.have.property('title');
        response.body.title.should.equal('Project 25');
      });
    });

    it('Should NOT create a new project if there is no title', () => {
      return chai.request(app)
      .post('/api/v1/projects')
      .send({
        title: null
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('Expected format: { title: <String> }. You\'re missing a Title.')
      })
      .catch(error => {
        throw error;
      });
    });
  });

  describe('POST /api/v1/palettes', () => {
    it('Should create a new palette', () => {
      return chai.request(app)
      .post('/api/v1/palettes')
      .send({
        palette_name: 'Thailand Sunrise',
        color1: 'rgb(139, 50, 152)',
        color2: 'rgb(42, 17, 172)',
        color3: 'rgb(21, 75, 149)',
        color4: 'rgb(136, 99, 227)',
        color5: 'rgb(221, 8, 250)'
      })
      .then(response => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');

        response.body.should.have.property('id');
        response.body.id.should.be.a('number');
        
        response.body.should.have.property('palette_name');
        response.body.palette_name.should.equal('Thailand Sunrise');

        response.body.should.have.property('color1');
        response.body.color1.should.equal('rgb(139, 50, 152)');

        response.body.should.have.property('color2');
        response.body.color2.should.equal('rgb(42, 17, 172)');

        response.body.should.have.property('color3');
        response.body.color3.should.equal('rgb(21, 75, 149)');

        response.body.should.have.property('color4');
        response.body.color4.should.equal('rgb(136, 99, 227)');

        response.body.should.have.property('color5');
        response.body.color5.should.equal('rgb(221, 8, 250)');
      });
    });

    it('Should NOT create a new palette if there is no name', () => {
      return chai.request(app)
      .post('/api/v1/palettes')
      .send({
        palette_name: null
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('Expected format: { palette_name: <String> }. You\'re missing a "palette_name" property.')
      })
      .catch(error => {
        throw error;
      });
    });
  });
});