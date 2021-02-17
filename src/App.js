import React, { useState, useEffect } from 'react';
import './App.css';
import { API } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listStores } from './graphql/queries';
import { createStore as createStoreMutation, deleteStore as deleteStoreMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    const apiData = await API.graphql({ query: listStores });
    setStores(apiData.data.listStores.items);
  }

  async function createStore() {
    if (!formData.name || !formData.email || !formData.description) return;
    await API.graphql({ query: createStoreMutation, variables: { input: formData } });
    setStores([ ...stores, formData ]);
    setFormData(initialFormState);
  }

  async function deleteStore({ id }) {
    const newStoresArray = stores.filter(store => store.id !== id);
    setStores(newStoresArray);
    await API.graphql({ query: deleteStoreMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>Smart Store</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Store name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'email': e.target.value})}
        placeholder="Store email"
        value={formData.email}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Store description"
        value={formData.description}
      />
      <button onClick={createStore}>Create Store</button>
      <div style={{marginBottom: 30}}>
        {
          stores.map(store => (
            <div key={store.id || store.name}>
              <h2>{store.name}</h2>
              <p>{store.description}</p>
              <button onClick={() => deleteStore(store)}>Delete store</button>
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);