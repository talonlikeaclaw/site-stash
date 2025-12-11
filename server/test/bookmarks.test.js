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

  before(() => {
    setCollectionStub = sinon.stub(db, 'setCollection');
    createStub = sinon.stub(db, 'create');
    findOneStub = sinon.stub(db, 'findOne');
  });

  afterEach(() => {
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
    })
  })
});
