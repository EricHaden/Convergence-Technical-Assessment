const { makeExecutableSchema } = require('@graphql-tools/schema');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define GraphQL schema
const typeDefs = `
type User {
    id: Int!
    username: String!
    password: String!
    todos: [Todo!]!
  }
  
type Todo {
  id: Int!
  description: String!
  user: User!
}

type Query {
  getUser(id: Int!): User
  getAllUsers: [User!]!
  getTodo(id: Int!): Todo
  getAllTodos: [Todo!]!
}

type Mutation {
  createUser(username: String!, password: String!): User!
  createTodo(description: String!, userId: Int!): Todo!
  updateUser(id: Int!, username: String!): User!
  updateTodo(id: Int!, description: String!): Todo!
  deleteUser(id: Int!): User
  deleteTodo(id: Int!): Todo
}

`;

// Define resolvers
const resolvers = {
  Query: {
    getUser: async (_, { id }) => {
      return prisma.user.findUnique({ where: { id } });
    },
    getAllUsers: async () => {
      return prisma.user.findMany();
    },
    getTodo: async (_, { id }) => {
      return prisma.todo.findUnique({ where: { id } });
    },
    getAllTodos: async () => {
      return prisma.todo.findMany();
    },
  },
  Mutation: {
    createUser: async (_, { username, password }) => {
        return prisma.user.create({ data: { username, password } });
      },
    createTodo: async (_, { description, userId }) => {
      return prisma.todo.create({
        data: {
          description,
          userId,
        },
      });
    },
    updateUser: async (_, { id, username }) => {
      return prisma.user.update({ where: { id }, data: { username } });
    },
    updateTodo: async (_, { id, description }) => {
      return prisma.todo.update({ where: { id }, data: { description } });
    },
    deleteUser: async (_, { id }) => {
      return prisma.user.delete({ where: { id } });
    },
    deleteTodo: async (_, { id }) => {
      return prisma.todo.delete({ where: { id } });
    },
  },
  User: {
    todos: async (parent) => {
      return prisma.user
        .findUnique({
          where: { id: parent.id },
        })
        .todos();
    },
  },
  Todo: {
    user: async (parent, _, context) => {
      if (context.user && parent.userId === context.user.id) {
        return prisma.todo
          .findUnique({
            where: { id: parent.id },
          })
          .user();
      } else {
        throw new Error("Unauthorized access to todo.");
      }
    },
  },
};


// Create the executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = schema;
