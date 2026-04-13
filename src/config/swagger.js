const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API do LocalHub',
            version: '1.0.0',
            description: 'Documentação inicial da API'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;