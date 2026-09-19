import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  ChangeRequestStatus,
  createChangeRequest,
  fetchChangeRequests,
  transitionChangeRequest,
} from '../store/slices/changeRequestsSlice';

const statusStyles: Record<ChangeRequestStatus, string> = {
  DRAFT: 'border-gray-500 text-gray-300',
  SUBMITTED: 'border-blue-500 text-blue-400',
  TECHNICAL_ASSESSMENT: 'border-yellow-500 text-yellow-400',
  APPROVAL: 'border-yellow-500 text-yellow-400',
  IMPLEMENTATION: 'border-teal-500 text-teal-400',
  UAT_TESTING: 'border-teal-500 text-teal-400',
  DEPLOYMENT: 'border-teal-500 text-teal-400',
  CLOSED: 'border-green-500 text-green-400',
  REJECTED: 'border-red-400 text-red-400',
  RETURNED: 'border-orange-400 text-orange-400',
  UAT_FAILED: 'border-red-400 text-red-400',
};

const nextStatus: Partial<Record<ChangeRequestStatus, ChangeRequestStatus>> = {
  DRAFT: 'SUBMITTED',
  SUBMITTED: 'TECHNICAL_ASSESSMENT',
  TECHNICAL_ASSESSMENT: 'APPROVAL',
  APPROVAL: 'IMPLEMENTATION',
  IMPLEMENTATION: 'UAT_TESTING',
  UAT_TESTING: 'DEPLOYMENT',
  DEPLOYMENT: 'CLOSED',
};

type FormState = {
  title: string;
  systemModule: string;
  description: string;
  currentBehaviour: string;
  proposedChange: string;
  businessJustification: string;
};

const emptyForm: FormState = {
  title: '',
  systemModule: '',
  description: '',
  currentBehaviour: '',
  proposedChange: '',
  businessJustification: '',
};

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View className="flex-1 rounded-xl border border-gray-800 bg-gray-900 p-5">
      <Text className="mb-2 text-sm text-gray-400">{label}</Text>
      <Text className={`text-3xl font-bold ${accent}`}>{value}</Text>
    </View>
  );
}

export default function ChangeManagementScreen() {
  const dispatch = useAppDispatch();
  const { requests, loading, error } = useAppSelector((state) => state.changeRequests);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => ['SUBMITTED', 'TECHNICAL_ASSESSMENT', 'APPROVAL'].includes(request.status)).length,
      active: requests.filter((request) => ['IMPLEMENTATION', 'UAT_TESTING', 'DEPLOYMENT'].includes(request.status)).length,
      completed: requests.filter((request) => request.status === 'CLOSED').length,
    }),
    [requests]
  );

  useEffect(() => {
    dispatch(fetchChangeRequests());
  }, [dispatch]);

  const updateStatus = (id: string, status: ChangeRequestStatus) => {
    dispatch(transitionChangeRequest({ id, status })).then((result) => {
      if (transitionChangeRequest.fulfilled.match(result)) setNotice(`Status updated to ${status.replace(/_/g, ' ')}`);
    });
  };

  const addRequest = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const submitRequest = () => {
    dispatch(createChangeRequest({ ...form, requestType: 'CHANGE_REQUEST', priority: 'MEDIUM', action: 'submit' })).then((result) => {
      if (createChangeRequest.fulfilled.match(result)) {
        setFormOpen(false);
        setNotice('Change request submitted');
      }
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 32 }}>
      <View className="mb-8 flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-bold text-white">Change Management</Text>
          <Text className="mt-2 text-gray-400">Manage project changes, approvals, and delivery status.</Text>
        </View>
        <Pressable onPress={addRequest} className="rounded-lg bg-teal-500 px-5 py-3">
          <Text className="font-semibold text-white">+ New Change Request</Text>
        </Pressable>
      </View>

      <View className="mb-8 flex-row gap-4">
        <StatCard label="Total Requests" value={counts.total} accent="text-white" />
        <StatCard label="Pending Review" value={counts.pending} accent="text-yellow-400" />
        <StatCard label="In Progress" value={counts.active} accent="text-teal-400" />
        <StatCard label="Completed" value={counts.completed} accent="text-green-400" />
      </View>

      {loading && <ActivityIndicator className="mb-5 self-start" color="#14b8a6" />}
      {error && <Text className="mb-5 text-red-400">{error}</Text>}
      <View className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <View className="flex-row border-b border-gray-800 px-5 py-4">
          <Text className="w-[31%] text-xs font-bold uppercase tracking-wider text-gray-400">Title</Text>
          <Text className="w-[16%] text-xs font-bold uppercase tracking-wider text-gray-400">Module</Text>
          <Text className="w-[14%] text-xs font-bold uppercase tracking-wider text-gray-400">Priority</Text>
          <Text className="w-[13%] text-xs font-bold uppercase tracking-wider text-gray-400">Status</Text>
          <Text className="w-[13%] text-xs font-bold uppercase tracking-wider text-gray-400">Created</Text>
          <Text className="flex-1 text-xs font-bold uppercase tracking-wider text-gray-400">Update Status</Text>
        </View>

        {requests.map((request) => (
          <View key={request.id} className="flex-row items-center border-b border-gray-800 px-5 py-4 last:border-b-0">
            <View className="w-[31%] pr-4">
              <Text className="font-semibold text-gray-100">{request.crNumber} · {request.title}</Text>
              <Text numberOfLines={1} className="mt-1 text-sm text-gray-500">{request.description}</Text>
            </View>
            <Text className="w-[16%] text-gray-300">{request.systemModule}</Text>
            <Text className="w-[14%] text-gray-300">{request.priority}</Text>
            <View className="w-[13%]">
              <View className={`self-start rounded-full border px-3 py-1 ${statusStyles[request.status]}`}>
                <Text className={`text-xs font-bold ${statusStyles[request.status].split(' ')[1]}`}>{request.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <Text className="w-[13%] text-gray-300">{new Date(request.createdAt).toLocaleDateString()}</Text>
            {nextStatus[request.status] ? <Pressable onPress={() => updateStatus(request.id, nextStatus[request.status]!)} className="flex-1 rounded-lg border border-gray-700 px-3 py-2"><Text className="text-sm text-gray-200">Move to {nextStatus[request.status]!.replace(/_/g, ' ')}</Text></Pressable> : <Text className="flex-1 text-sm text-gray-500">No next step</Text>}
          </View>
        ))}
        {!loading && requests.length === 0 && <Text className="p-8 text-center text-gray-500">No change requests found.</Text>}
      </View>

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
        <View className="flex-1 justify-center bg-black/70 px-6">
          <View className="rounded-xl border border-gray-700 bg-gray-900 p-6">
            <Text className="mb-5 text-xl font-bold text-white">New Change Request</Text>
            {(['title', 'systemModule', 'description', 'currentBehaviour', 'proposedChange', 'businessJustification'] as const).map((field) => (
              <TextInput key={field} value={form[field]} onChangeText={(value) => setForm((current) => ({ ...current, [field]: value }))} placeholder={field.replace(/([A-Z])/g, ' $1')} placeholderTextColor="#6b7280" multiline={field !== 'title' && field !== 'systemModule'} className="mb-3 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white" />
            ))}
            <View className="mt-2 flex-row justify-end gap-3"><Pressable onPress={() => setFormOpen(false)} className="rounded-lg border border-gray-700 px-4 py-3"><Text className="text-gray-300">Cancel</Text></Pressable><Pressable onPress={submitRequest} className="rounded-lg bg-teal-500 px-4 py-3"><Text className="font-semibold text-white">Submit Request</Text></Pressable></View>
          </View>
        </View>
      </Modal>

      {notice && (
        <Pressable onPress={() => setNotice(null)} className="mt-5 self-end rounded-lg border border-gray-700 bg-gray-900 px-5 py-4">
          <Text className="text-gray-200">✓ {notice}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
