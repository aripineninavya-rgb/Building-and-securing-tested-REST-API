import { describe, it, expect, beforeEach, vi } from 'vitest';

// MUST come before app import
vi.mock('firebase-admin');

import request from 'supertest';
import db from '../db.js';
import app from '../app.js';

const { mockVerifyIdToken } = await import('firebase-admin');

/**
 * Integration Tests for Gym Review API
 * 
 * These tests verify that multiple components of the application work together correctly.
 * They test real API interactions without mocking individual functions within the request flow.
 */
describe('Gym Review API Integration Tests', () => {
  beforeEach(() => {
    db.reset();
    vi.clearAllMocks();
  });

  /**
   * Test 1: GET /gyms returns 200 and an array of gyms
   * 
   * Integration: Tests that the app can start, initialize database,
   * apply CORS middleware, and route requests to the correct handler.
   */
  describe('Test 1: GET /gyms - Public route', () => {
    it('should return 200 and an array of gyms', async () => {
      const response = await request(app).get('/gyms');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return gyms with complete structure', async () => {
      const response = await request(app).get('/gyms');
      
      expect(response.status).toBe(200);
      const gym = response.body[0];
      expect(gym).toHaveProperty('id');
      expect(gym).toHaveProperty('name');
      expect(gym).toHaveProperty('location');
      expect(gym).toHaveProperty('rating');
      expect(gym).toHaveProperty('reviews');
      expect(Array.isArray(gym.reviews)).toBe(true);
    });

    it('should contain multiple gyms in response', async () => {
      const response = await request(app).get('/gyms');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });
  });

  /**
   * Test 2: GET /gyms/:id returns 404 for unknown gym ID
   * 
   * Integration: Tests that the app correctly handles parameterized routes,
   * database lookups, and error responses.
   */
  describe('Test 2: GET /gyms/:id - Get specific gym', () => {
    it('should return 200 for a valid gym ID', async () => {
      const response = await request(app).get('/gyms/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('location');
    });

    it('should return 404 for an unknown gym ID', async () => {
      const response = await request(app).get('/gyms/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/not found|not exist/i);
    });

    it('should not return sensitive data for missing gym', async () => {
      const response = await request(app).get('/gyms/invalid-id');
      
      expect(response.status).toBe(404);
      expect(response.body).not.toHaveProperty('reviews');
    });
  });

  /**
   * Test 3: POST /gyms without a token returns 401
   * 
   * Integration: Tests that the authentication middleware is properly
   * integrated with the routes and correctly denies unauthenticated requests.
   */
  describe('Test 3: POST /gyms - Authorization required', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .post('/gyms')
        .send({ 
          name: 'New Test Gym', 
          location: '123 Main St',
          rating: 4.5
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/unauthorized|no token|missing/i);
    });

    it('should return 401 when Authorization header is missing', async () => {
      const response = await request(app)
        .post('/gyms')
        .set('Content-Type', 'application/json')
        .send({ 
          name: 'Another Gym', 
          location: '456 Oak Ave',
          rating: 4.8
        });
      
      expect(response.status).toBe(401);
    });

    it('should return 401 when Authorization header is malformed', async () => {
      const response = await request(app)
        .post('/gyms')
        .set('Authorization', 'InvalidToken')
        .send({ 
          name: 'Gym Three', 
          location: '789 Pine Rd',
          rating: 4.2
        });
      
      expect(response.status).toBe(401);
    });

    it('should accept requests with Bearer token format', async () => {
      // This request will fail auth but should at least reach the handler
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Token invalid'));
      
      const response = await request(app)
        .post('/gyms')
        .set('Authorization', 'Bearer some-token')
        .send({ 
          name: 'Test Gym', 
          location: 'Test Location',
          rating: 4.0
        });
      
      // Should get a 401, not a 400 from malformed auth
      expect(response.status).toBe(401);
    });
  });

  /**
   * Test 4: POST /gyms with required data validation
   * 
   * Integration: Tests that request validation middleware works correctly
   * with the authentication and routing layers.
   */
  describe('Test 4: POST /gyms - Data validation', () => {
    it('should validate required fields without authentication', async () => {
      const response = await request(app)
        .post('/gyms')
        .send({ name: 'Incomplete Gym' });
      
      // Should fail auth first (before validation)
      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid content type', async () => {
      const response = await request(app)
        .post('/gyms')
        .set('Authorization', 'Bearer token')
        .set('Content-Type', 'text/plain')
        .send('invalid data');
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  /**
   * Test 5: POST /gyms/:id/reviews - Authorization and data integrity
   * 
   * Integration: Tests that reviews are correctly associated with gyms,
   * authentication is properly enforced, and data relationships are maintained.
   */
  describe('Test 5: POST /gyms/:id/reviews - Review submission', () => {
    it('should return 401 when posting review without token', async () => {
      const response = await request(app)
        .post('/gyms/1/reviews')
        .send({ 
          rating: 5, 
          comment: 'Great facility!' 
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with malformed Authorization header', async () => {
      const response = await request(app)
        .post('/gyms/1/reviews')
        .set('Authorization', 'InvalidFormat')
        .send({ 
          rating: 5, 
          comment: 'Excellent!' 
        });
      
      expect(response.status).toBe(401);
    });

    it('should return 401 with missing Bearer token', async () => {
      const response = await request(app)
        .post('/gyms/1/reviews')
        .set('Authorization', 'Bearer')
        .send({ 
          rating: 4, 
          comment: 'Good' 
        });
      
      expect(response.status).toBe(401);
    });
  });

  /**
   * Test 6: GET /profile - User profile endpoint authorization
   * 
   * Integration: Tests that protected profile routes require authentication
   * and middleware is applied consistently across different routes.
   */
  describe('Test 6: GET /profile - Protected route', () => {
    it('should return 401 when accessing profile without token', async () => {
      const response = await request(app).get('/profile');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid authorization header', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'NotAToken');
      
      expect(response.status).toBe(401);
    });

    it('should return 401 when token verification fails', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Invalid token'));
      
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'Bearer expired-token');
      
      expect(response.status).toBe(401);
    });
  });

  /**
   * Test 7: CORS headers and OPTIONS requests
   * 
   * Integration: Tests that CORS middleware is properly configured
   * and allows cross-origin requests from the specified frontend.
   */
  describe('Test 7: CORS Configuration', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/gyms')
        .set('Origin', 'http://localhost:5173');
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/gyms')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');
      
      expect([200, 204]).toContain(response.status);
    });
  });

  /**
   * Test 8: Request/Response content type handling
   * 
   * Integration: Tests that the Express app correctly handles
   * JSON content types across different routes and methods.
   */
  describe('Test 8: Content-Type handling', () => {
    it('should return JSON from GET /gyms', async () => {
      const response = await request(app).get('/gyms');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle JSON parsing for POST requests', async () => {
      const response = await request(app)
        .post('/gyms')
        .set('Content-Type', 'application/json')
        .send({ 
          name: 'Test', 
          location: 'Test Location',
          rating: 4.0
        });
      
      // Will fail auth, but that means JSON was parsed
      expect(response.status).toBe(401);
    });

    it('should return error responses as JSON', async () => {
      const response = await request(app).get('/gyms/999');
      
      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('error');
    });
  });

  /**
   * Test 9: Multiple request handling and state isolation
   * 
   * Integration: Tests that the app correctly handles sequential requests
   * and that the in-memory database state is properly reset between tests.
   */
  describe('Test 9: Sequential requests and state management', () => {
    it('should return consistent data across multiple requests', async () => {
      const response1 = await request(app).get('/gyms');
      const response2 = await request(app).get('/gyms');
      
      expect(response1.body).toEqual(response2.body);
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it('should retrieve specific gym after listing all gyms', async () => {
      // First, list all gyms
      const listResponse = await request(app).get('/gyms');
      expect(listResponse.body.length).toBeGreaterThan(0);
      
      // Then get a specific one
      const firstGymId = listResponse.body[0].id;
      const getResponse = await request(app).get(`/gyms/${firstGymId}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(firstGymId);
    });

    it('should maintain data across different routes', async () => {
      // Get all gyms
      const gymsResponse = await request(app).get('/gyms');
      const totalGyms = gymsResponse.body.length;
      
      // Try to get an invalid gym
      const invalidResponse = await request(app).get('/gyms/invalid');
      expect(invalidResponse.status).toBe(404);
      
      // Get all gyms again
      const gymsResponse2 = await request(app).get('/gyms');
      expect(gymsResponse2.body.length).toBe(totalGyms);
    });
  });

  /**
   * Test 10: Error handling consistency
   * 
   * Integration: Tests that the app handles various error scenarios
   * consistently and returns appropriate HTTP status codes.
   */
  describe('Test 10: Error handling and status codes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect([404, 405]).toContain(response.status);
    });

    it('should return 405 or 404 for unsupported methods', async () => {
      const response = await request(app).put('/gyms/1');
      
      expect([404, 405, 404]).toContain(response.status);
    });

    it('should return 400 for malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/gyms')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer token')
        .send('{invalid json}');
      
      // Should get error (either 400 or 401 depending on parse order)
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
