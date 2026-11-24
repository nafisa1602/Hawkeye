const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

const valid = { name: 'hawkeye', owner: 'nafisa', githubUrl: 'https://github.com/nafisa/hawkeye' };

beforeEach(async () => {
  await prisma.reviewRule.deleteMany();
  await prisma.repository.deleteMany();
});
afterAll(() => prisma.$disconnect());

describe('Repositories API', () => {
  test('full lifecycle: create → get → list → update → delete → 404', async () => {
    const created = await request(app).post('/api/repositories').send(valid).expect(201);
    const id = created.body.id;
    expect(created.body).toMatchObject({ ...valid, defaultBranch: 'main', isActive: true });

    const got = await request(app).get(`/api/repositories/${id}`).expect(200);
    expect(got.body.name).toBe('hawkeye');

    const list = await request(app).get('/api/repositories').expect(200);
    expect(list.body.meta.total).toBe(1);

    const updated = await request(app).patch(`/api/repositories/${id}`).send({ name: 'hawkeye-v2' }).expect(200);
    expect(updated.body.name).toBe('hawkeye-v2');

    await request(app).delete(`/api/repositories/${id}`).expect(204);
    await request(app).get(`/api/repositories/${id}`).expect(404);
  });

  test('create with missing name returns 400', async () => {
    const res = await request(app).post('/api/repositories').send({ ...valid, name: undefined }).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('create with non-GitHub URL returns 400', async () => {
    await request(app).post('/api/repositories').send({ ...valid, githubUrl: 'https://gitlab.com/x/y' }).expect(400);
  });

  test('duplicate githubUrl returns 409', async () => {
    await request(app).post('/api/repositories').send(valid).expect(201);
    const res = await request(app).post('/api/repositories').send(valid).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('get unknown id returns 404', async () => {
    await request(app).get('/api/repositories/999999').expect(404);
  });

  test('invalid id format returns 400', async () => {
    await request(app).get('/api/repositories/abc').expect(400);
  });

  test('update with unknown field returns 400', async () => {
    const { body } = await request(app).post('/api/repositories').send(valid);
    await request(app).patch(`/api/repositories/${body.id}`).send({ hacked: true }).expect(400);
  });

  test('delete unknown id returns 404', async () => {
    await request(app).delete('/api/repositories/999999').expect(404);
  });

  describe('list: pagination, filter, sort', () => {
    beforeEach(async () => {
      for (const [name, isActive] of [['alpha', true], ['bravo', false], ['charlie', true]]) {
        await request(app).post('/api/repositories')
          .send({ name, owner: 'o', githubUrl: `https://github.com/o/${name}`, isActive });
      }
    });

    test('paginates results', async () => {
      const res = await request(app).get('/api/repositories?page=2&limit=2').expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 2, limit: 2, total: 3, totalPages: 2 });
    });

    test('filters by isActive and search', async () => {
      const active = await request(app).get('/api/repositories?isActive=false').expect(200);
      expect(active.body.data.map(r => r.name)).toEqual(['bravo']);
      const search = await request(app).get('/api/repositories?search=CHAR').expect(200);
      expect(search.body.data[0].name).toBe('charlie');
    });

    test('sorts by name asc and desc', async () => {
      const asc = await request(app).get('/api/repositories?sort=name').expect(200);
      expect(asc.body.data.map(r => r.name)).toEqual(['alpha', 'bravo', 'charlie']);
      const desc = await request(app).get('/api/repositories?sort=-name').expect(200);
      expect(desc.body.data[0].name).toBe('charlie');
    });
  });
});