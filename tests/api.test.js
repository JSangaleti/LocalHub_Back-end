const request = require('supertest');

const app = require('../src/app');
const pool = require('../src/config/db');

const generateValidCnpj = () => {
    const base = Date.now().toString().slice(-8).padStart(8, '0') + '0001';
    const calculateDigit = (value, weights) => {
        const sum = value
            .split('')
            .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };
    const firstDigit = calculateDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const secondDigit = calculateDigit(
        `${base}${firstDigit}`,
        [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );
    return `${base}${firstDigit}${secondDigit}`;
};

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

            const forgotPasswordResponse = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: user.email })
                .expect(200);

            expect(forgotPasswordResponse.body.code).toMatch(/^\d{6}$/);

            const newPassword = 'novaSenha123';
            await request(app)
                .post('/api/auth/reset-password')
                .send({
                    email: user.email,
                    code: forgotPasswordResponse.body.code,
                    newPassword
                })
                .expect(200);

            await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: newPassword
                })
                .expect(200);

            const storeResponse = await request(app)
                .post('/api/stores')
                .send({
                    ownerUserId: registerResponse.body.user.id,
                    categoryId: 1,
                    cnpj: generateValidCnpj(),
                    name: 'Loja Teste Upload',
                    actingUserId: registerResponse.body.user.id
                })
                .expect(201);

            const uploadResponse = await request(app)
                .post(`/api/uploads/stores/${storeResponse.body.store.id}`)
                .attach('file', Buffer.from('fake image'), 'store-test.png')
                .expect(200);

            expect(uploadResponse.body).toMatchObject({
                message: 'Imagem enviada e registro atualizado.'
            });
            expect(uploadResponse.body.path).toMatch(/^\/uploads\/stores\//);
        });
    });
});
