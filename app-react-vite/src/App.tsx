import { useState, useEffect, useRef } from 'react';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowModes, GridRowModesModel, GridValueGetterParams } from '@mui/x-data-grid';
import NavBar from './Components/NavBar';
import Status from './Components/Status';
import * as React from 'react';
import './App.css';
import { FaSave } from 'react-icons/fa';
import { FaBeer } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa';

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
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = todos.find((row:any) => row.id === id);
    if (editedRow != null) {
      setTodos(todos.filter((row:any) => row.id !== id));
    }
  };
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleDeleteClick = (id: GridRowId) => () => {
    setTodos(todos.filter((row: any) => row.id !== id));
  };

  //mock grid data
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, type: 'number' },
    { field: 'projectName', headerName: 'projectName', width: 150, editable: true },
    { field: 'appName', headerName: 'appName', width: 200, editable: true },
    { field: 'repository', headerName: 'repository', width: 150, editable: true },
    { field: 'scanSpeedOptions', headerName: 'scanSpeedOptions', width: 75, editable: true },
    { field: 'execCountChangeType', headerName: 'execCountChangeType', width: 50, type: 'number', editable: true },
    { field: 'scanType', headerName: 'scanType', width: 150 , editable: true},
    { field: 'execPipelineCount', headerName: 'execPipelineCount', type: 'number', width: 50, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<FaSave />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<FaBeer />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<FaEdit />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<FaTrash />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    }
  ];

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
            editMode="row"
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
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