# React GraphQL

## Table of Contents

- [GraphQL Query](#graphql-query)

----
</br>

### GraphQL Query

#### The GraphQL API has the following features:

- objects and fields
- nested objects
- fragments
- arguments and variables
- operation names
- directives

##### $1

Objects hold data about an entity. You can access the data by using a so called field in GraphQL. Fields are used to ask for specific properties that are available in objects.

A query in its most basic form consists of objects and fields in GraphQL terms. Objects can also be called fields.

Input:

```bash
{
  viewer {
    name
    url
  }
}
```

Output:

```bash
{
  "data": {
    "viewer": {
      "name": "Robin Wieruch",
      "url": "https://github.com/rwieruch"
    }
  }
}
```

##### $2

