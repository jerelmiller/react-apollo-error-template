/*** SCHEMA ***/
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";

const PersonType = new GraphQLObjectType({
  name: "Person",
  fields: {
    id: { type: GraphQLID },
    name: {
      type: GraphQLString,
      resolve: (person) => {
        return `${person.name} (${person.count})`;
      },
    },
  },
});

const peopleData = [
  { id: 1, name: "John Smith", count: 0 },
  { id: 2, name: "Sara Smith", count: 0 },
  { id: 3, name: "Budd Deey", count: 0 },
];

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    people: {
      type: new GraphQLList(PersonType),
      resolve: () => peopleData,
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    incrementCount: {
      type: PersonType,
      args: {
        personId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: function (_, { personId }) {
        const person = peopleData.find((p) => p.id === Number(personId));
        person.count++;
        return person;
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
