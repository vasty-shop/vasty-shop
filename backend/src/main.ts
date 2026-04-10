import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  // Get configuration
  const port = configService.get<number>("PORT", 4005);

  // Increase body size limit for file uploads (50MB)
  // Exclude webhook endpoints from JSON parsing to preserve raw body for signature verification
  app.use(
    require('express').json({
      limit: '50mb',
      verify: (req: any, res: any, buf: Buffer) => {
        // Store raw body for webhook signature verification
        if (req.url && (req.url.includes('/billing/webhook') || req.url.includes('/stripe-connect/webhook'))) {
          req.rawBody = buf;
        }
      },
    })
  );
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // MANUAL CORS MIDDLEWARE - This works reliably
  console.log("🔓 Enabling CORS...");
  app.use((req, res, next) => {
    // Set CORS headers for every response
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept,Authorization,x-shop-id,x-return-url"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");

    console.log(
      `📨 ${req.method} ${req.url} from ${req.headers.origin || "no origin"}`
    );

    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      console.log("OPTIONS preflight handled");
      return res.status(200).end();
    }

    next();
  });

  console.log("🌐 CORS enabled with manual middleware");

  // API prefix
  const apiPrefix = configService.get("API_PREFIX") || "api/v1";
  app.setGlobalPrefix(apiPrefix);

    // Swagger API Documentation
    const config = new DocumentBuilder()
      .setTitle("Vasty Shop API")
      .setDescription("E-commerce platform API powered by database")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT token",
          in: "header",
        },
        "JWT-auth"
      )
      .addTag("auth", "Authentication endpoints")
      .addTag("shops", "Shop management")
      .addTag("products", "Product catalog")
      .addTag("cart", "Shopping cart")
      .addTag("orders", "Order management")
      .addTag("campaigns", "Marketing campaigns")
      .addTag("offers", "Special offers")
      .addTag("delivery", "Delivery management")
      .addTag("payment", "Payment processing")
      .addTag("wishlist", "Wishlist management")
      .addTag("reviews", "Product reviews")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   Vasty Shop Backend is running!            ║
    ║                                               ║
    ║   Server:  http://localhost:${port}              ║
    ║   API:     http://localhost:${port}/${apiPrefix}      ║
    ║   Docs:    http://localhost:${port}/${apiPrefix}/docs ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
  `);
}

bootstrap();
