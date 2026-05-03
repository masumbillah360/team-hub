import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Team Hub API',
            version: '1.0.0',
            description: 'Team Hub backend API documentation',
        },
        servers: [
            { url: 'http://localhost:3005/api/v1', description: 'Development server' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
            },
        },
    },
    apis: ['./src/routes/v1/**/*.js', './src/routes/v1/*.js'],
};

export default function swaggerDocs(app) {
    const specs = swaggerJsdoc(options);
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, { customSiteTitle: 'Team Hub API Docs' }));
}
