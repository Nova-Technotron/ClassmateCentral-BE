import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Class-Specific Application API',
            version: '1.0.0',
            description: 'API documentation for the Class-Specific Application',
        },
    },
    apis: ['./routes/*.js'], // Path to the API routes directory
};

const specs = swaggerJsdoc(options);

export default function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
