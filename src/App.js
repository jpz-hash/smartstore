import React, { useState, useEffect } from 'react';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listStores } from './graphql/queries';
import { createStore as createStoreMutation, deleteStore as deleteStoreMutation } from './graphql/mutations';
import { API, Storage } from 'aws-amplify';


const initialFormState = { name: '', description: '' }

function App() {
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    const apiData = await API.graphql({ query: listStores });
    const storesFromAPI = apiData.data.listStores.items;
    await Promise.all(storesFromAPI.map(async store => {
      if (store.image) {
        const image = await Storage.get(store.image);
        store.image = image;
      }
      return store;
    }))
    setStores(apiData.data.listStores.items);
  }

  async function createStore() {
    if (!formData.name || !formData.email || !formData.description) {
      alert(formData.name)
      alert(formData.email)
      alert(formData.description)
      return;
    }
    else {
      alert(formData.name)
      alert(formData.email)
      alert(formData.description)
    }
    await API.graphql({ query: createStoreMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setStores([ ...stores, formData ]);
    setFormData(initialFormState);
  }

  async function deleteStore({ id }) {
    const newStoresArray = stores.filter(store => store.id !== id);
    setStores(newStoresArray);
    await API.graphql({ query: deleteStoreMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchStores();
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
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createStore}>Create Store</button>
      <div style={{marginBottom: 30}}>
        {
          stores.map(store => (
            <div key={store.id || store.name}>
              <h2>{store.name}</h2>
              <p>{store.description}</p>
              <p>{store.email}</p>
              <p>{store.owner}</p>
              <button onClick={() => deleteStore(store)}>Delete store</button>
              {
                store.image && <img src={store.image} style={{width: 400}} />
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
