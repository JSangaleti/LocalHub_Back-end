const request = require('supertest');

const app = require('../src/app');
const pool = require('../src/config/db');

describe('LocalHub API', () => {
    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/health', () => {
        it('deve retornar status 200 e indicar que a API está funcionando', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'API funcionando normalmente'
            });
        });
    });

    describe('GET /api/categories', () => {
        it('deve retornar status 200 e uma lista de categorias', async () => {
            const response = await request(app)
                .get('/api/categories')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /api/posts', () => {
        it('deve retornar status 200 ao listar posts', async () => {
            const response = await request(app)
                .get('/api/posts')
                .expect(200);

            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('POST /api/auth/register e POST /api/auth/login', () => {
        it('deve cadastrar um usuário e realizar login com sucesso', async () => {
            const timestamp = Date.now();
            const user = {
                name: 'Usuário Teste',
                email: `usuario.teste.${timestamp}@localhub.dev`,
                password: 'senha12345',
                userType: 'cliente'
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(user)
                .expect(201);

            expect(registerResponse.body).toHaveProperty('message', 'Usuário cadastrado com sucesso.');
            expect(registerResponse.body).toHaveProperty('user');
            expect(registerResponse.body.user).toMatchObject({
                name: user.name,
                email: user.email,
                userType: user.userType
            });
            expect(registerResponse.body.user).not.toHaveProperty('password');

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: user.password
                })
                .expect(200);

            expect(loginResponse.body).toHaveProperty('message', 'Login realizado com sucesso.');
            expect(loginResponse.body).toHaveProperty('user');
            expect(loginResponse.body.user).toMatchObject({
                email: user.email,
                userType: user.userType
            });
            expect(loginResponse.body.user).not.toHaveProperty('password');
        });
    });
});