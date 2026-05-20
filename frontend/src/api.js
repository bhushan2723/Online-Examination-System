import axios from 'axios';

const API = axios.create({ baseURL: 'http://13.234.48.124:5000/api' });

export const fetchUsers = () => API.get('/users');
export const createUser = (user) => API.post('/users', user);

