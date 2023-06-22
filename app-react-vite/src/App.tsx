import { useState, useEffect, useRef } from 'react';
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

  //mock grid data
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, type: 'number' },
    { field: 'projectName', headerName: 'projectName', width: 150 },
    { field: 'appName', headerName: 'appName', width: 200 },
    { field: 'repository', headerName: 'repository', width: 150 },
    { field: 'scanSpeedOptions', headerName: 'scanSpeedOptions', width: 75 },
    { field: 'execCountChangeType', headerName: 'execCountChangeType', width: 50, type: 'number' },
    { field: 'scanType', headerName: 'scanType', width: 150 },
    { field: 'execPipelineCount', headerName: 'execPipelineCount', type: 'number', width: 50 },
  ];

  let rows = []

  // auth
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const mountFlagAuth = useRef(false)

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
  const [todos, setTodos] = useState([]);
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
        setTodos(json.recordset);
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
        <div><h5>Todo added: {message} </h5></div>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={todos}
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
          </div>
          : <div>Sign in for private data access</div>
        }
      </header>
    </div>
  );
}

export default App;