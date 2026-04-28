import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@technovan/utils';
import { Project } from '@technovan/types';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    return await apiClient.get('/projects');
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: any) => {
    return await apiClient.post('/projects', data);
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      });
  },
});

export default projectsSlice.reducer;
