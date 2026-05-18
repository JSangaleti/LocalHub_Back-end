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
                        password: {
                            type: 'string',
                            minLength: 8,
                            maxLength: 42,
                            example: '12345678',
                            description: 'Nova senha do usuário. Deve ter entre 8 e 42 caracteres e será armazenada como hash.'
                        },
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

                        address: {
                            type: 'string',
                            example: 'Rua Brasil',
                            description: 'Rua ou logradouro do comércio.'
                        },
                        addressNumber: {
                            type: 'string',
                            example: '123',
                            description: 'Número do estabelecimento.'
                        },
                        neighborhood: {
                            type: 'string',
                            example: 'Centro',
                            description: 'Bairro do comércio.'
                        },
                        city: {
                            type: 'string',
                            example: 'Campo Mourão',
                            description: 'Cidade do comércio.'
                        },
                        state: {
                            type: 'string',
                            example: 'PR',
                            description: 'UF do comércio.'
                        },
                        postalCode: {
                            type: 'string',
                            example: '87300-000',
                            description: 'CEP do comércio.'
                        },
                        country: {
                            type: 'string',
                            example: 'Brasil',
                            description: 'País do comércio.'
                        },
                        latitude: {
                            type: 'number',
                            format: 'double',
                            minimum: -90,
                            maximum: 90,
                            example: -24.0463
                        },
                        longitude: {
                            type: 'number',
                            format: 'double',
                            minimum: -180,
                            maximum: 180,
                            example: -52.378
                        },
                        formattedAddress: {
                            type: 'string',
                            nullable: true,
                            example: 'Rua Brasil, 123 - Centro - Campo Mourão - PR',
                            description: 'Endereço formatado gerado pela API para exibição no frontend.'
                        },
                        mapLinks: {
                            type: 'object',
                            nullable: true,
                            description: 'Links prontos para abertura de rota em aplicativos de mapa.',
                            properties: {
                                googleMaps: {
                                    type: 'string',
                                    example: 'https://www.google.com/maps/dir/?api=1&destination=-24.0463%2C-52.378&travelmode=driving'
                                },
                                waze: {
                                    type: 'string',
                                    example: 'https://waze.com/ul?ll=-24.0463%2C-52.378&navigate=yes'
                                }
                            }
                        },

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

                        address: {
                            type: 'string',
                            example: 'Rua Brasil',
                            description: 'Rua ou logradouro do comércio.'
                        },
                        addressNumber: {
                            type: 'string',
                            example: '123'
                        },
                        neighborhood: {
                            type: 'string',
                            example: 'Centro'
                        },
                        city: {
                            type: 'string',
                            example: 'Campo Mourão'
                        },
                        state: {
                            type: 'string',
                            example: 'PR'
                        },
                        postalCode: {
                            type: 'string',
                            example: '87300-000'
                        },
                        country: {
                            type: 'string',
                            example: 'Brasil'
                        },
                        latitude: {
                            type: 'number',
                            format: 'double',
                            minimum: -90,
                            maximum: 90,
                            example: -24.0463,
                            description: 'Deve ser informada junto com longitude.'
                        },
                        longitude: {
                            type: 'number',
                            format: 'double',
                            minimum: -180,
                            maximum: 180,
                            example: -52.378,
                            description: 'Deve ser informada junto com latitude.'
                        },

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

                        address: {
                            type: 'string',
                            example: 'Rua Brasil',
                            description: 'Rua ou logradouro do comércio.'
                        },
                        addressNumber: {
                            type: 'string',
                            example: '123'
                        },
                        neighborhood: {
                            type: 'string',
                            example: 'Centro'
                        },
                        city: {
                            type: 'string',
                            example: 'Campo Mourão'
                        },
                        state: {
                            type: 'string',
                            example: 'PR'
                        },
                        postalCode: {
                            type: 'string',
                            example: '87300-000'
                        },
                        country: {
                            type: 'string',
                            example: 'Brasil'
                        },
                        latitude: {
                            type: 'number',
                            format: 'double',
                            minimum: -90,
                            maximum: 90,
                            example: -24.0463,
                            description: 'Deve ser informada junto com longitude.'
                        },
                        longitude: {
                            type: 'number',
                            format: 'double',
                            minimum: -180,
                            maximum: 180,
                            example: -52.378,
                            description: 'Deve ser informada junto com latitude.'
                        },

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
                },
                AuthRegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'Juliano Sangaleti' },
                        email: { type: 'string', format: 'email', example: 'juliano@email.com' },
                        password: {
                            type: 'string',
                            minLength: 8,
                            maxLength: 42,
                            example: '12345678',
                            description: 'Senha do usuário. Deve ter entre 8 e 42 caracteres e será armazenada como hash.'
                        },
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
                AuthSuccessResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Login realizado com sucesso.' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                HealthResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'API funcionando normalmente' }
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
                },
                Unauthorized: {
                    description: 'Não autorizado',
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