import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import express from 'express';

const router = express.Router();

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'CSI400_2025 API',
			version: '1.0.0',
			description: 'API documentation for CSI400_2025 project',
		},
		servers: [
			{
				url: 'http://localhost:3000',
			},
		],
	},
	apis: ['./routes/*.js', './admin/*.js'], // ระบุ path ของไฟล์ route ที่ต้องการให้ swagger scan
};

const specs = swaggerJsdoc(options);

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export default router;
