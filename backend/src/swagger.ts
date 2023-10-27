import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('StockFlo Api')
    .setDescription('This is the API documentation for StockFlo Application')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header'
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(
    process.env.BASE_URL ? `${process.env.BASE_URL}/api-docs` : `api-docs`,
    app,
    document
  );
}
