import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import NavBar from './Components/NavBar';
import Status from './Components/Status';
import './App.css';

let url = `/getall`;

const cloudEnv = import.meta.env.VITE_CLOUD_ENV;
const backendEnv = import.meta.env.VITE_BACKEND_URI;

console.log(`CLOUD_ENV = ${cloudEnv}`)
console.log(`BACKEND_URI = ${backendEnv}`)

if (cloudEnv.toLowerCase()=='production') {
  if (backendEnv) {
    url = `${backendEnv}${url}`
  } else {
    throw Error(`Missing backendEnv`)
  }
}

console.log(`URL = ${url}`)

function App() {

  // auth
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const mountFlagAuth = useRef(false)

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 90,
    },
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      valueGetter: (params: GridValueGetterParams) =>
        `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },
  ];
  
  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!mountFlagAuth.current) {
        const response = await fetch('/.auth/me');
        const payload = await response.json();
        const { clientPrincipal } = payload;

        if (clientPrincipal) {
          setUser(clientPrincipal);
          userHasAuthenticated(true);
          setUserName(clientPrincipal?.userDetails.toLowerCase().split(' ').map(x => x[0].toUpperCase() + x.slice(1)).join(' '))
          console.log(`clientPrincipal = ${JSON.stringify(clientPrincipal)}`);
        }
      }
    }

    fetchData();
  }, []);

  // data
  const [todos, setTodos] = useState({});
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const mountFlagData = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!mountFlagData.current) {
        mountFlagData.current = true;
        console.log(url)

        const data = await fetch(url);
        const json = await data.json();
        console.log("json 1", json)
        setTodos(json);
      }
    }

    fetchData();
  }, []);

  const sendDataToApi = async (e: any) => {
    e.preventDefault();

    const config = {
      method: "POST",
      headers: { "Content-Test": "application/json" },
      body: JSON.stringify({ title })
    };
    const data = await fetch(url, config);
    const returnedName = await data.text();
    console.log("returnedName 2", returnedName)

    if (returnedName) {
      setMessage(returnedName);
    } else {
      setMessage(`Couldn't send data`);
    }

    const userResponse = await fetch(url, { method: "GET" });
    const dataReturned = await userResponse.json();
    console.log("dataReturned 3", dataReturned)

    if (dataReturned) {
      setTitle('')
      setTodos(dataReturned);
    }
  };

  return (
    <div className="App">
      <NavBar user={user} />
      <header className="App-header">
        <form id="form1" className="App-form" onSubmit={e => sendDataToApi(e)}>
          <div>
            <input
              type="text"
              id="name"
              className="App-input"
              placeholder="Enter todo to add"
              value={title}
              onChange={e => setTitle(e.target.value)} />
            <button type="submit" className="App-button">Submit</button>
            <div>
              <Button variant="contained">Hello World</Button>
            </div>
          </div>
        </form>
        <div><h5>Todo added: {message} </h5></div>

        <details>
          <summary>Public data</summary>
          <p><h5><pre>{JSON.stringify(todos, null, 2)}</pre></h5></p>
        </details>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
          />
        </div>
        {isAuthenticated ?
          <div>
            <details>
              <summary>Private data - just for {userName}</summary>
              <p>
                <h5>Auth: {isAuthenticated}</h5>
                <p><Status user={user} /></p>
              </p>
            </details>
            <p>{JSON.stringify(user)}</p>
          </div>
          : <div>Sign in for private data access</div>
        }


      </header>
    </div>
  );
}

export default App;