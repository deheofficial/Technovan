import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiClient from '@technovan/utils';

export type ChangeRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'TECHNICAL_ASSESSMENT'
  | 'APPROVAL'
  | 'IMPLEMENTATION'
  | 'UAT_TESTING'
  | 'DEPLOYMENT'
  | 'CLOSED'
  | 'REJECTED'
  | 'RETURNED'
  | 'UAT_FAILED';

export type ChangeRequest = {
  id: string;
  crNumber: string;
  title: string;
  description: string;
  requestType: string;
  systemModule: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ChangeRequestStatus;
  currentBehaviour: string;
  proposedChange: string;
  businessJustification: string;
  project?: { id: string; title: string; status: string } | null;
  requestedBy?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
};

export type NewChangeRequest = Omit<
  ChangeRequest,
  'id' | 'crNumber' | 'status' | 'project' | 'requestedBy' | 'createdAt'
> & { projectId?: string; action?: 'draft' | 'submit' };

type ChangeRequestsState = {
  requests: ChangeRequest[];
  loading: boolean;
  error: string | null;
};

const initialState: ChangeRequestsState = { requests: [], loading: false, error: null };

export const fetchChangeRequests = createAsyncThunk('changeRequests/fetch', async () =>
  (await apiClient.get('/change-requests')) as unknown as ChangeRequest[]
);

export const createChangeRequest = createAsyncThunk(
  'changeRequests/create',
  async (data: NewChangeRequest) => (await apiClient.post('/change-requests', data)) as unknown as ChangeRequest
);

export const transitionChangeRequest = createAsyncThunk(
  'changeRequests/transition',
  async ({ id, status, comments }: { id: string; status: ChangeRequestStatus; comments?: string }) => {
    const request = await apiClient.patch(`/change-requests/${id}/transition`, { status, comments });
    return request as unknown as ChangeRequest;
  }
);

const changeRequestsSlice = createSlice({
  name: 'changeRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChangeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChangeRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.loading = false;
      })
      .addCase(fetchChangeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load change requests';
      })
      .addCase(createChangeRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(createChangeRequest.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create change request';
      })
      .addCase(transitionChangeRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((request) => request.id === action.payload.id);
        if (index >= 0) state.requests[index] = { ...state.requests[index], ...action.payload };
      });
  },
});

export default changeRequestsSlice.reducer;
