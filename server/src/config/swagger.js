const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp Clone API",
      version: "1.0.0",
      description: "REST API for the WhatsApp clone (users, direct/group messaging, image uploads). Realtime events are delivered over Socket.IO and are not documented here.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Send the token returned by /api/users/login. Accepted as-is or with a 'Bearer ' prefix.",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            isOnline: { type: "boolean" },
            lastSeen: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Group: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            admin: { $ref: "#/components/schemas/User" },
            members: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            removedMembers: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MessageImage: {
          type: "object",
          nullable: true,
          properties: {
            url: { type: "string", format: "uri" },
            publicId: { type: "string" },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: { type: "string" },
            conversationType: { type: "string", enum: ["direct", "group"] },
            sender: { type: "string" },
            receiver: { type: "string", nullable: true },
            group: { type: "string", nullable: true },
            message: { type: "string" },
            image: { $ref: "#/components/schemas/MessageImage" },
            isSeen: { type: "boolean" },
            isDeleted: { type: "boolean" },
            isEdited: { type: "boolean" },
            editedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
