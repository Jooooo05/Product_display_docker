import axios from '@/utils/axios';

export const fetchWrapper = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete
};
