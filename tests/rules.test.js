const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

let repoId;

beforeEach(async () => {
  await prisma.reviewRule.deleteMany();
  await prisma.repository.deleteMany();
  const res = await request(app).post('/api/repositories')
    .send({ name: 'demo', owner: 'miti', githubUrl: 'https://github.com/miti/demo' });
  repoId = res.body.id;
});
afterAll(() => prisma.$disconnect());

const rule = { title: 'No console.log', content: 'Flag console.log calls', severity: 'LOW' };

describe('Review Rules API', () => {
  test('full lifecycle: create → get → list → update → delete → 404', async () => {
    const created = await request(app).post(`/api/repositories/${repoId}/rules`).send(rule).expect(201);
    const id = created.body.id;
    expect(created.body).toMatchObject({ ...rule, enabled: true, repositoryId: repoId });

    await request(app).get(`/api/rules/${id}`).expect(200);

    const list = await request(app).get(`/api/repositories/${repoId}/rules`).expect(200);
    expect(list.body).toHaveLength(1);

    const updated = await request(app).patch(`/api/rules/${id}`).send({ severity: 'HIGH' }).expect(200);
    expect(updated.body.severity).toBe('HIGH');

    await request(app).delete(`/api/rules/${id}`).expect(204);
    await request(app).get(`/api/rules/${id}`).expect(404);
  });

  test('create rule for missing repository returns 404', async () => {
    await request(app).post('/api/repositories/999999/rules').send(rule).expect(404);
  });

  test('invalid severity returns 400', async () => {
    const res = await request(app).post(`/api/repositories/${repoId}/rules`)
      .send({ ...rule, severity: 'URGENT' }).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('missing title returns 400', async () => {
    await request(app).post(`/api/repositories/${repoId}/rules`).send({ content: 'x' }).expect(400);
  });

  test('filters rules by severity and enabled', async () => {
    await request(app).post(`/api/repositories/${repoId}/rules`).send({ ...rule, title: 'a', severity: 'LOW' });
    await request(app).post(`/api/repositories/${repoId}/rules`).send({ ...rule, title: 'b', severity: 'HIGH', enabled: false });
    const high = await request(app).get(`/api/repositories/${repoId}/rules?severity=HIGH`).expect(200);
    expect(high.body.map(r => r.title)).toEqual(['b']);
    const enabled = await request(app).get(`/api/repositories/${repoId}/rules?enabled=true`).expect(200);
    expect(enabled.body.map(r => r.title)).toEqual(['a']);
  });

  test('deleting a repository deletes its rules (cascade)', async () => {
    const created = await request(app).post(`/api/repositories/${repoId}/rules`).send(rule);
    await request(app).delete(`/api/repositories/${repoId}`).expect(204);
    await request(app).get(`/api/rules/${created.body.id}`).expect(404);
  });

  test('update or delete unknown rule returns 404', async () => {
    await request(app).patch('/api/rules/999999').send({ title: 'x' }).expect(404);
    await request(app).delete('/api/rules/999999').expect(404);
  });

  test('PATCH only changes the fields sent (severity is not reset)', async () => {
    const created = await request(app).post(`/api/repositories/${repoId}/rules`).send({ ...rule, severity: 'HIGH' });
    const updated = await request(app).patch(`/api/rules/${created.body.id}`).send({ title: 'Renamed' }).expect(200);
    expect(updated.body).toMatchObject({ title: 'Renamed', severity: 'HIGH' });
  });
});
