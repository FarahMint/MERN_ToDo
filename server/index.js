//  1rst line is importing package
const { GraphQLServer } = require("graphql-yoga");

// grab from the package where we importing it
const mongoose = require("mongoose");
//Then connection to the database - connect to the todotest db (Name of the db todotest)
mongoose.connect(
  "mongodb://localhost/todotest",
  { useNewUrlParser: true }
);
//EAfter that what we want to do is 1rst connect to the db - and then start the server
// it does not immediately connect when we run ( it runs in the background)

const Todo = mongoose.model("Todo", {
  //  we are going to have  2 fields on this Todo obj
  // so we can save this into our DB
  // we can pass 2 things text and whether the to do is complete or not
  text: String,
  complete: Boolean
});

// This is the schema - we using Graphql with GraphQl we have to set up a schema
// Inside this schema we have a query type - -  type Query --
// Inside query type we have hello - hello takes 1 arg( this arg is name - name is the name of the arg and String is the data type for it -- hello(name: String) --
//the return type - - : String! -->! this is mandatory you have to passed in a string)
const typeDefs = `
  type Query {
    hello(name: String): String!
    todos: [Todo]
  }
  type Todo {
    id:ID!,
    text: String!,
   complete: Boolean!
  }

  type Mutation{
    createTodo(text: String!): Todo
    updateTodo(id: ID!, complete: Boolean!): Boolean!
    removeTodo(id: ID!): Boolean!
  }
`;

//  the resolvers
//  shape matches  -- Query -- & -- hello --
// then there is the arg calld name -- we are are destructuring
const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "World"}`,
    todos: () => Todo.find()
  },
  Mutation: {
    //  we don't care abt the 1rst arg - this are called resolver func
    //1rst thing is passed the parent - the 2nd argument is the arg - so for this wewe are expecting an arg called text
    //  make it an async function
    createTodo: async (_, { text }) => {
      //  from this we are going to 1rst create a to do
      //  new Todo passed in text and complete -> by default complete is false
      const todo = new Todo({ text, complete: false });
      //  save to db .save return a promise so we want to await that
      await todo.save();
      return todo;

      // so create an instance of it
      // save it to the db
      //returning it
    },

    //Implementation for update to do - async
    //  2 arguments ID and complete
    updateTodo: async (_, { id, complete }) => {
      //  specify the id as the 1rst argument
      //2nd we specify what changed so -> complete
      await Todo.findByIdAndUpdate(id, { complete });
      // we’re going to pass that in and this is the new value for what complete is and this returns back a document query looks like  what it comes back. ( might be a promise that we have to await it)

      //If it works
      return true;
    },
    //Implementation for remove to do - async
    //  1 arguments ID
    removeTodo: async (_, { id }) => {
      //  specify the id as the 1rst argument
      await Todo.findByIdAndRemove(id);
      //If it works
      return true;
    }
  }
};

//  Specy typeDefs and resolvers const defined above
const server = new GraphQLServer({ typeDefs, resolvers });
//use call back -  to open/get connected - Once connect to mongoDB
mongoose.connection.once("open", () => {
  //we then start our graphQl server
  server.start(() => console.log("Server is running on localhost:4000"));
});
