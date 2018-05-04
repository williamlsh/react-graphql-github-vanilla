import React, { Component } from 'react';
import './App.css';

const TITLE = 'React GraphQL GitHub Client';

const fetchGitHubGraphQL = new Request('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`
  }
});

const GET_ISSUES_OF_REPOSITORY = `
   query ($organization: String!, $repository: String!) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        name
        url
        issues(last: 5) {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }
`;

const getIssuesOfRepository = path => {
  const [organization, repository] = path.split('/');
  return fetch(fetchGitHubGraphQL, {
    body: JSON.stringify({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: { organization, repository }
    })
  }).then(res => res.json());
};

const Organization = ({ organization, errors }) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong: </strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    );
  }
  return (
    <React.Fragment>
      <p>
        <strong>Issues from Organization: </strong>
        <a href={organization.url}>{organization.name}</a>
      </p>
      <Repository repository={organization.repository} />
    </React.Fragment>
  );
};

const Repository = ({ repository }) => (
  <React.Fragment>
    <p>
      <strong>In Repository: </strong>
      <a href={repository.url}>{repository.name}</a>
    </p>
    <strong>Last 5 Issues: </strong>
    <ul>
      {repository.issues.edges.map(issue => (
        <li key={issue.node.id}>
          <a href={issue.node.url}>{issue.node.title}</a>
        </li>
      ))}
    </ul>
  </React.Fragment>
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: 'the-road-to-learn-react/the-road-to-learn-react',
      organization: null,
      errors: null
    };
  }

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = e => {
    this.setState({ path: e.target.value });
  };

  onSubmit = e => {
    this.onFetchFromGitHub(this.state.path);
    e.preventDefault();
  };

  onFetchFromGitHub = path => {
    getIssuesOfRepository(path)
      .then(result =>
        this.setState({
          organization: result.data.organization,
          errors: result.errors
        })
      )
      .catch(error => console.log(error));
  };

  render() {
    const { path, organization, errors } = this.state;
    return (
      <React.Fragment>
        <h1>{TITLE}</h1>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">Show open issues for https://github.com/</label>
          <input
            id="url"
            type="text"
            value={path}
            onChange={this.onChange}
            style={{ width: '300px' }}
          />
          <button type="submit">Search</button>
        </form>
        <br />
        {organization ? (
          <Organization organization={organization} errors={errors} />
        ) : (
          <p>No information yet ...</p>
        )}
      </React.Fragment>
    );
  }
}

export default App;
