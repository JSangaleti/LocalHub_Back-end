const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LocalHub API',
            version: '1.0.0',
            description:
                'Documentação da API do LocalHub, uma plataforma para descoberta de comércios locais e visualização de publicações por categoria.'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Servidor local'
            }
        ],
        tags: [
            { name: 'Health', description: 'Verificação de funcionamento da API' },
            { name: 'Auth', description: 'Cadastro e login de usuários' },
            { name: 'Users', description: 'Consulta de usuários cadastrados' },
            { name: 'Categories', description: 'Consulta de categorias comerciais' },
            { name: 'Stores', description: 'Gerenciamento de lojas/comércios' },
            { name: 'Posts', description: 'Feed de publicações do aplicativo' }
        ],
        components: {
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Erro ao processar a requisição.'
                        },
                        error: {
                            type: 'string',
                            example: 'Detalhes técnicos do erro'
                        }
                    }
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'API funcionando normalmente' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Juliano' },
                        email: { type: 'string', format: 'email', example: 'juliano@email.com' },
                        userType: {
                            type: 'string',
                            enum: ['cliente', 'comercio', 'admin'],
                            example: 'cliente'
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                AuthRegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'Juliano Sangaleti' },
                        email: { type: 'string', format: 'email', example: 'juliano@email.com' },
                        password: { type: 'string', minLength: 6, example: '123456' },
                        userType: {
                            type: 'string',
                            enum: ['cliente', 'comercio', 'admin'],
                            example: 'cliente'
                        }
                    }
                },
                AuthLoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'juliano@email.com' },
                        password: { type: 'string', example: '123456' }
                    }
                },
                AuthSuccessResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Login realizado com sucesso.' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                AuthRegisterResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Usuário cadastrado com sucesso.' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 },
                                name: { type: 'string', example: 'Juliano Sangaleti' },
                                email: { type: 'string', format: 'email', example: 'juliano@email.com' },
                                userType: {
                                    type: 'string',
                                    enum: ['cliente', 'comercio', 'admin'],
                                    example: 'cliente'
                                }
                            }
                        }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Restaurantes' }
                    }
                },
                Store: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        ownerUserId: { type: 'integer', example: 2 },
                        categoryId: { type: 'integer', example: 3 },
                        name: { type: 'string', example: 'Burger House' },
                        description: { type: 'string', example: 'Hamburgueria artesanal' },
                        address: { type: 'string', example: 'Rua Central, 123' },
                        openingHours: { type: 'string', example: 'Seg-Sáb 18:00 às 23:00' },
                        contact: { type: 'string', example: '(44) 99999-0000' },
                        category: { type: 'string', example: 'Restaurantes' }
                    }
                },
                StoreCreateRequest: {
                    type: 'object',
                    required: ['ownerUserId', 'categoryId', 'name'],
                    properties: {
                        ownerUserId: { type: 'integer', example: 2 },
                        categoryId: { type: 'integer', example: 3 },
                        name: { type: 'string', example: 'Burger House' },
                        description: { type: 'string', example: 'Hamburgueria artesanal' },
                        address: { type: 'string', example: 'Rua Central, 123' },
                        openingHours: { type: 'string', example: 'Seg-Sáb 18:00 às 23:00' },
                        contact: { type: 'string', example: '(44) 99999-0000' }
                    }
                },
                StoreResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Loja cadastrada com sucesso.' },
                        store: { $ref: '#/components/schemas/Store' }
                    }
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        storeName: { type: 'string', example: 'Burger House' },
                        title: { type: 'string', example: 'Combo Especial' },
                        description: {
                            type: 'string',
                            example: 'Hambúrguer + batata + refrigerante por preço promocional.'
                        },
                        category: { type: 'string', example: 'Comida' },
                        imageUrl: { type: 'string', example: '' }
                    }
                }
            },
            responses: {
                BadRequest: {
                    description: 'Requisição inválida',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                Unauthorized: {
                    description: 'Não autorizado',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                NotFound: {
                    description: 'Recurso não encontrado',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                Conflict: {
                    description: 'Conflito de dados',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Erro interno do servidor',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ErrorResponse' }
                        }
                    }
                }
            }
        }
    },
    apis: [path.resolve(__dirname, '../routes/*.js')]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;