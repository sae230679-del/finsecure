import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './setup';
import { loginAsSuperAdmin } from './authHelper';
import { resetTestDatabase } from './dbReset';

describe('RKN Registry Check Settings', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should get RKN settings', async () => {
    const agent = await loginAsSuperAdmin();
    
    // First ensure clean state by setting to defaults
    await agent
      .put('/api/admin/settings/rkn-registry-check')
      .send({ enabled: true, priceRub: 10 });
    
    const res = await agent.get('/api/admin/settings/rkn-registry-check');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('enabled');
    expect(res.body).toHaveProperty('priceRub');
  });

  it('should update RKN settings', async () => {
    const agent = await loginAsSuperAdmin();
    
    const updateRes = await agent
      .put('/api/admin/settings/rkn-registry-check')
      .send({ enabled: false, priceRub: 25 });
    
    expect(updateRes.status).toBe(200);
    
    const getRes = await agent.get('/api/admin/settings/rkn-registry-check');
    expect(getRes.body.enabled).toBe(false);
    expect(getRes.body.priceRub).toBe(25);
  });

  it('should require SuperAdmin for RKN settings', async () => {
    const res = await request(app).get('/api/admin/settings/rkn-registry-check');
    expect(res.status).toBe(401);
  });
});

describe('RKN Registry Check Endpoint', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should return 400 when no inn or name provided', async () => {
    const res = await request(app)
      .post('/api/rkn/registry-check')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('should accept inn parameter and return response when enabled', async () => {
    // Ensure feature is enabled
    const agent = await loginAsSuperAdmin();
    await agent
      .put('/api/admin/settings/rkn-registry-check')
      .send({ enabled: true });
    
    const res = await request(app)
      .post('/api/rkn/registry-check')
      .send({ inn: '7707083893' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('searchParams');
    expect(res.body.searchParams.inn).toBe('7707083893');
  });

  it('should accept name parameter and return response when enabled', async () => {
    // Ensure feature is enabled
    const agent = await loginAsSuperAdmin();
    await agent
      .put('/api/admin/settings/rkn-registry-check')
      .send({ enabled: true });
    
    const res = await request(app)
      .post('/api/rkn/registry-check')
      .send({ name: 'Тестовая организация' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('searchParams');
    expect(res.body.searchParams.name).toBe('Тестовая организация');
  });
});
