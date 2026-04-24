const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API do LocalHub',
            version: '1.0.0',
            description: 'Documentação da API do LocalHub.'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Servidor local'
            }
        ],
        tags: [
            { name: 'Health', description: 'Verificação de funcionamento da API' },
            { name: 'Auth', description: 'Autenticação de usuários' },
            { name: 'Users', description: 'Gerenciamento de usuários' },
            { name: 'Categories', description: 'Gerenciamento de categorias' },
            { name: 'Stores', description: 'Gerenciamento de lojas' },
            { name: 'Posts', description: 'Gerenciamento de posts' }
        ],
        components: {
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Erro ao processar a requisição.' },
                        error: { type: 'string', example: 'Detalhes técnicos do erro' }
                    }
                },
                DeleteResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Registro removido com sucesso.' }
                    }
                },

                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Restaurantes' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                CategoryCreateRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Restaurantes' }
                    }
                },
                CategoryResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Categoria cadastrada com sucesso.' },
                        category: { $ref: '#/components/schemas/Category' }
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
                UserUpdateRequest: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Juliano Sangaleti' },
                        email: { type: 'string', format: 'email', example: 'juliano@email.com' },
                        password: { type: 'string', example: '123456' },
                        userType: {
                            type: 'string',
                            enum: ['cliente', 'comercio', 'admin'],
                            example: 'cliente'
                        }
                    }
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Usuário atualizado com sucesso.' },
                        user: { $ref: '#/components/schemas/User' }
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
                        category: { type: 'string', example: 'Restaurantes' },
                        address: { type: 'string', example: 'Rua Central, 123' },
                        openingHours: { type: 'string', example: 'Seg-Sáb 18:00 às 23:00' },
                        contact: { type: 'string', example: '(44) 99999-0000' }
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
                StoreUpdateRequest: {
                    type: 'object',
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
                        storeId: { type: 'integer', example: 1 },
                        storeName: { type: 'string', example: 'Burger House' },
                        categoryId: { type: 'integer', example: 2 },
                        category: { type: 'string', example: 'Restaurantes' },
                        title: { type: 'string', example: 'Combo Especial' },
                        description: {
                            type: 'string',
                            example: 'Hambúrguer + batata + refrigerante em promoção.'
                        },
                        imageUrl: { type: 'string', example: 'https://exemplo.com/imagem.jpg' }
                    }
                },
                PostCreateRequest: {
                    type: 'object',
                    required: ['storeId', 'title', 'description'],
                    properties: {
                        storeId: { type: 'integer', example: 1 },
                        categoryId: { type: 'integer', example: 2 },
                        title: { type: 'string', example: 'Combo Especial' },
                        description: {
                            type: 'string',
                            example: 'Hambúrguer + batata + refrigerante em promoção.'
                        },
                        imageUrl: { type: 'string', example: 'https://exemplo.com/imagem.jpg' }
                    }
                },
                PostUpdateRequest: {
                    type: 'object',
                    properties: {
                        storeId: { type: 'integer', example: 1 },
                        categoryId: { type: 'integer', example: 2 },
                        title: { type: 'string', example: 'Novo título' },
                        description: { type: 'string', example: 'Nova descrição' },
                        imageUrl: { type: 'string', example: 'https://exemplo.com/nova-imagem.jpg' }
                    }
                },
                PostResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Post cadastrado com sucesso.' },
                        post: { $ref: '#/components/schemas/Post' }
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