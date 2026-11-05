import axios from 'axios';

// En el browser va al mismo origen: si NEXT_PUBLIC_API_URL apunta a otro host
// (ej. www, que redirige 308 al apex) el redirect cross-origin rompe por CORS.
// En el server hace falta la URL absoluta.
export const axiosInstance = axios.create({
  baseURL: typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_URL : '',
});
