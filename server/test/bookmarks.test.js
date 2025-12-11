import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import app from '../app.js';
import { db } from '../models/db.js';
import { ObjectId } from 'mongodb';

describe('POST /api/bookmarks', () => {
  let setCollectionStub;
  let createStub;
  let findOneStub;

  beforeEach(() => {
    setCollectionStub = sinon.stub(db, 'setCollection');
    createStub = sinon.stub(db, 'create');
    findOneStub = sinon.stub(db, 'findOne');
  });

  afterEach(() => {
    setCollectionStub.restore();
    createStub.restore();
    findOneStub.restore();
  });

  after(() => {
    sinon.restore();
  });

  describe('Success cases', () => {
    it('should create a bookmark with all fields', async () => {
      const newBookmark = {
        url: 'https://example.com',
        title: 'Example Site',
        description: 'A great example',
        tags: ['example', 'test'],
        collectionId: 'collection123'
      };

      const mockId = new ObjectId();
      const mockCreatedBookmark = {
        _id: mockId,
        ...newBookmark,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      createStub.resolves({ insertedId: mockId });
      findOneStub.resolves(mockCreatedBookmark);

      const res = await request(app)
        .post('/api/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('_id');
      expect(res.body.url).to.equal(newBookmark.url);
      expect(res.body.title).to.equal(newBookmark.title);
      expect(res.body.description).to.equal(newBookmark.description);
      expect(res.body.tags).to.deep.equal(newBookmark.tags);
      expect(res.body.collectionId).to.equal(newBookmark.collectionId);
      expect(res.body).to.have.property('createdAt');
      expect(res.body).to.have.property('updatedAt');

      // Verify stubs were called correctly
      expect(setCollectionStub.calledWith('bookmarks')).to.be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(findOneStub.calledOnce).to.be.true;
    });

    it('should create a bookmark with only required fields', async () => {
      const newBookmark = {
        url: 'https://minimal.com',
        title: 'Minimal Bookmark'
      };

      const mockId = new ObjectId();
      const mockCreatedBookmark = {
        _id: mockId,
        url: newBookmark.url,
        title: newBookmark.title,
        description: '',
        tags: [],
        collectionId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      createStub.resolves({ insertedId: mockId });
      findOneStub.resolves(mockCreatedBookmark);

      const res = await request(app)
        .post('/api/bookmarks')
        .send(newBookmark)
        .expect(201);

      expect(res.body).to.have.property('_id');
      expect(res.body.url).to.equal(newBookmark.url);
      expect(res.body.title).to.equal(newBookmark.title);
      expect(res.body.description).to.equal('');
      expect(res.body.tags).to.deep.equal([]);
      expect(res.body.collectionId).to.be.null;

      // Verify the bookmark sent to db.create had default values
      const createdBookmark = createStub.firstCall.args[0];
      expect(createdBookmark.description).to.equal('');
      expect(createdBookmark.tags).to.deep.equal([]);
      expect(createdBookmark.collectionId).to.be.null;
    });
  });

  describe('Validation errors', () => {
    it('should return 400 if url is missing', async () => {
      const invalidBookmark = {
        title: 'Missing URL'
      };

      const res = await request(app)
        .post('/api/bookmarks')
        .send(invalidBookmark)
        .expect(400);

      expect(res.body).to.have.property('error');
      expect(res.body.error).to.equal('URL and title are required');

      // Verify no database operations were attempted
      expect(createStub.called).to.be.false;
      expect(findOneStub.called).to.be.false;
    });

    it('should return 400 if title is missing', async () => {
      const invalidBookmark = {
        url: 'https://example.com'
      };

      const res = await request(app)
        .post('/api/bookmarks')
        .send(invalidBookmark)
        .expect(400);

      expect(res.body).to.have.property('error');
      expect(res.body.error).to.equal('URL and title are required');
    });

    it('should return 400 if url is invalid format', async () => {
      const invalidBookmark = {
        url: 'not-a-valid-url',
        title: 'Invalid URL'
      };

      const res = await request(app)
        .post('/api/bookmarks')
        .send(invalidBookmark)
        .expect(400);

      expect(res.body).to.have.property('error');
      expect(res.body.error).to.equal('Invalid URL format');
    });

    it('should return 400 for malformed URL', async () => {
      const invalidBookmark = {
        url: 'http://',
        title: 'Malformed'
      };

      const res = await request(app)
        .post('/api/bookmarks')
        .send(invalidBookmark)
        .expect(400);

      expect(res.body.error).to.equal('Invalid URL format');
      expect(createStub.called).to.be.false;
    });
  });
});
