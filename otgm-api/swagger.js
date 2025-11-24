    const swaggerAutogen = require('swagger-autogen')();

    const outputFile = './swagger_output.json';
    const endpointsFiles = ['./routes/*.js']; // Point to your route files

    const doc = {
      info: {
        title: 'My API',
        description: 'Description of my API',
      },
      host: 'localhost:3000', // Replace with your host
      schemes: ['http'],
      // ... more OpenAPI specification details
    };

    swaggerAutogen(outputFile, endpointsFiles, doc);